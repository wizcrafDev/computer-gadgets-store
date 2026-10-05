import { Router } from "express";
import {
  auth_middleware,
  admin_middleware,
} from "../middlewares/authMiddleware.js";
import {
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  restock,
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
 *     security: []
 *     responses:
 *       200:
 *         description: List of products fetched successfully
 */
productRoutes.get("/", getProducts);

/**
 * @openapi
 * /products/restock:
 *   post:
 *     summary: Bulk create or restock products (Admin only)
 *     description: Allows admins to upload an array of products at once or a single product wrapped in an array.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             minItems: 1
 *             description: An array of product objects to restock.
 *             items:
 *               type: object
 *               required:
 *                 - name
 *                 - price
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "Wireless Mechanical Keyboard"
 *                 description:
 *                   type: string
 *                   nullable: true
 *                   example: "RGB backlit mechanical keyboard with hot-swappable tactile switches."
 *                 price:
 *                   type: number
 *                   format: float
 *                   example: 89.99
 *                 stock:
 *                   type: integer
 *                   default: 0
 *                   example: 50
 *                 images:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example:
 *                     - "https://res.cloudinary.com/your-cloud/image/upload/v1234/keyboard-front.jpg"
 *                     - "https://res.cloudinary.com/your-cloud/image/upload/v1234/keyboard-side.jpg"
 *     responses:
 *       201:
 *         description: Products created/restocked successfully.
 *       400:
 *         description: Invalid request payload or missing required fields.
 *       401:
 *         description: Unauthorized - JWT token missing or invalid.
 *       403:
 *         description: Forbidden - Admin role required.
 *       500:
 *         description: Internal server error.
 */

productRoutes.post("/restock", auth_middleware, admin_middleware, restock);

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
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       401:
 *         description: Access Denied. Token missing or invalid.
 *       403:
 *         description: Access Forbidden. Admin role required.
 *       404:
 *         description: Product not found.
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
 *       404:
 *         description: Product not found.
 */
productRoutes.delete("/:id", auth_middleware, admin_middleware, deleteProduct);
