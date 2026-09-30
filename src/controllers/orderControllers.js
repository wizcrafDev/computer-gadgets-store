import { prisma } from "../config/db.js";

// USER CONTROLLERS (For Customer Action)

// POST /orders - User places order from active cart
export const createOrder = async (req, res) => {
  try {
    const userId = req.user_id;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Check inventory stock
    for (const item of cart.items) {
      if (item.quantity > item.product.stock) {
        return res.status(400).json({
          message: `Insufficient stock for '${item.product.name}'. Only ${item.product.stock} available.`,
        });
      }
    }

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );

    const order = await prisma.$transaction(async (tx) => {
      // Create Order
      const newOrder = await tx.order.create({
        data: {
          userId,
          totalAmount,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
        include: { items: true },
      });

      // Decrement stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    return res
      .status(201)
      .json({ message: "Order placed successfully", data: order });
  } catch (error) {
    console.error("[createOrder] error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /orders - User fetches their own order history
export const getUserOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user_id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ message: "Orders retrieved", data: orders });
  } catch (error) {
    console.error("[getUserOrders] error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /orders/:id - User fetches single order of theirs
export const getOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await prisma.order.findFirst({
      where: { id, userId: req.user_id },
      include: { items: { include: { product: true } } },
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    return res.status(200).json({ message: "Order details", data: order });
  } catch (error) {
    console.error("[getOrderById] error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /orders/:id/cancel - User cancels their own pending order
export const cancelOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await prisma.order.findFirst({
      where: { id, userId: req.user_id },
      include: { items: true },
    });

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== "PENDING") {
      return res
        .status(400)
        .json({ message: "Cannot cancel order at this stage" });
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const canceled = await tx.order.update({
        where: { id },
        data: { status: "CANCELLED" },
      });

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return canceled;
    });

    return res
      .status(200)
      .json({ message: "Order cancelled", data: updatedOrder });
  } catch (error) {
    console.error("[cancelOrder] error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ADMIN CONTROLLERS (For Admin Inspection)

// GET /admin/orders - Admin fetches ALL user orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res
      .status(200)
      .json({ message: "All orders fetched", data: orders });
  } catch (error) {
    console.error("[getAllOrders] error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /admin/orders/:id - Admin views ANY user's order details
export const getAdminOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
      },
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    return res.status(200).json({ message: "Order details", data: order });
  } catch (error) {
    console.error("[getAdminOrderById] error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /admin/orders/:id/status - Admin updates order status
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = [
    "PENDING",
    "PAID",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid order status" });
  }

  try {
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return res
      .status(200)
      .json({ message: "Order status updated", data: updatedOrder });
  } catch (error) {
    console.error("[updateOrderStatus] error:", error.message);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /admin/orders/:id/cancel - Admin overrides & cancels a user order
export const adminCancelOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status === "CANCELLED") {
      return res.status(400).json({ message: "Order is already cancelled" });
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const canceled = await tx.order.update({
        where: { id },
        data: { status: "CANCELLED" },
      });

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return canceled;
    });

    return res
      .status(200)
      .json({ message: "Order cancelled by admin", data: updatedOrder });
  } catch (error) {
    console.error("[adminCancelOrder] error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
