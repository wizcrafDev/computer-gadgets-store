import { Router } from "express";
import {
  auth_middleware,
  admin_middleware,
} from "../middlewares/authMiddleware.js";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productControllers.js";

export const productRoutes = Router();
/**
 * @openapi
 * /products:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get all products
 *     description: Retrieves a list of all available products in the store.
 *     responses:
 *       200:
 *         description: List of products fetched successfully
 */
productRoutes.get("/", getProducts);

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get product by ID
 *     description: Retrieves details of a specific product using its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product unique ID
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found
 */
productRoutes.get("/:id", getProductById);
/**
 * @openapi
 * /products:
 *   post:
 *     tags:
 *       - Products
 *     summary: Create a new product (Admin Only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 *       401:
 *         description: Access Denied. Token missing or invalid.
 *       403:
 *         description: Access Forbidden. Admin role required.
 */
productRoutes.post("/", auth_middleware, admin_middleware, createProduct);

/**
 * @openapi
 * /products/{id}:
 *   patch:
 *     tags:
 *       - Products
 *     summary: Update product by ID (Admin Only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       401:
 *         description: Access Denied. Token missing or invalid.
 *       403:
 *         description: Access Forbidden. Admin role required.
 */
productRoutes.patch("/:id", auth_middleware, admin_middleware, updateProduct);

/**
 * @openapi
 * /products/{id}:
 *   delete:
 *     tags:
 *       - Products
 *     summary: Delete product by ID (Admin Only)
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
 *         description: Product deleted successfully
 *       401:
 *         description: Access Denied. Token missing or invalid.
 *       403:
 *         description: Access Forbidden. Admin role required.
 */
productRoutes.delete("/:id", auth_middleware, admin_middleware, deleteProduct);
