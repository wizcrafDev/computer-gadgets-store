import { prisma } from "../config/db.js";

//Fetch or create User's cart
const getOrCreateCart = async (userId) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
  }
  return cart;
};

//Get Cart

export const getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user_id);
    return res
      .status(200)
      .json({ message: "Cart retrieved successfully", data: cart });
  } catch (error) {
    console.log("[getCart error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//POST /cart/items
export const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({ message: "productId is required" });
  }

  try {
    const cart = await getOrCreateCart(req.user_id);

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });
    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    const updatedCart = await getOrCreateCart(req.user_id);
    return res
      .status(200)
      .json({ message: "Item added to cart", data: updatedCart });
  } catch (error) {
    console.error("[addToCart] error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /cart/items/:id
export const updateCartItem = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined || quantity < 1) {
    return res.status(400).json({ message: "Quantity must be at least 1" });
  }

  try {
    await prisma.cartItem.update({
      where: { id },
      data: { quantity },
    });

    const updatedCart = await getOrCreateCart(req.user_id);
    return res
      .status(200)
      .json({ message: "Cart item updated", data: updatedCart });
  } catch (error) {
    console.error("[updateCartItem] error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /cart/items/:id
export const removeCartItem = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.cartItem.delete({ where: { id } });
    const updatedCart = await getOrCreateCart(req.user_id);
    return res
      .status(200)
      .json({ message: "Item removed from cart", data: updatedCart });
  } catch (error) {
    console.error("[removeCartItem] error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /cart
export const clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user_id);
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("[clearCart] error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
