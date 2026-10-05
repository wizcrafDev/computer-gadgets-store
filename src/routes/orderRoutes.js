import { Router } from "express";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
  adminCancelOrder,
} from "../controllers/orderControllers.js";
import {
  auth_middleware,
  admin_middleware,
} from "../middlewares/authMiddleware.js";

export const orderRoutes = Router();
export const adminOrderRoutes = Router();

// USER ROUTES (Placed by Customers)

orderRoutes.use(auth_middleware);

/**
 * @openapi
 * /orders:
 *   post:
 *     tags:
 *       - Customer Orders
 *     summary: Place a new order
 *     description: Customer converts cart into a new order. Decrements product inventory.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Order placed successfully.
 *       400:
 *         description: Cart is empty or stock is insufficient.
 */
orderRoutes.post("/", createOrder);

/**
 * @openapi
 * /orders:
 *   get:
 *     tags:
 *       - Customer Orders
 *     summary: Get my orders
 *     description: Retrieves list of orders placed by logged-in customer.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders retrieved.
 */
orderRoutes.get("/", getUserOrders);

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     tags:
 *       - Customer Orders
 *     summary: Get single order details
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details retrieved.
 *       404:
 *         description: Order not found.
 */
orderRoutes.get("/:id", getOrderById);

/**
 * @openapi
 * /orders/{id}/cancel:
 *   patch:
 *     tags:
 *       - Customer Orders
 *     summary: Cancel my order
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order cancelled and stock restored.
 */
orderRoutes.patch("/:id/cancel", cancelOrder);

// ADMIN ROUTES (Store Management)

adminOrderRoutes.use(auth_middleware, admin_middleware);

/**
 * @openapi
 * /admin/orders:
 *   get:
 *     tags:
 *       - Admin Orders
 *     summary: Get all customer orders
 *     description: Admin retrieves every order placed across the store with buyer details.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All store orders retrieved.
 */
adminOrderRoutes.get("/", getAllOrders);

/**
 * @openapi
 * /admin/orders/{id}:
 *   get:
 *     tags:
 *       - Admin Orders
 *     summary: Get details of any user order
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Full order details retrieved.
 */
adminOrderRoutes.get("/:id", getAdminOrderById);

/**
 * @openapi
 * /admin/orders/{id}/status:
 *   patch:
 *     tags:
 *       - Admin Orders
 *     summary: Update status of a user order
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, PAID, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *     responses:
 *       200:
 *         description: Status updated.
 */
adminOrderRoutes.patch("/:id/status", updateOrderStatus);

/**
 * @openapi
 * /admin/orders/{id}/cancel:
 *   patch:
 *     tags:
 *       - Admin Orders
 *     summary: Admin cancel user order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order cancelled by admin and stock restored.
 */
adminOrderRoutes.patch("/:id/cancel", adminCancelOrder);
