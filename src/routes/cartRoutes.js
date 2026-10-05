import { Router } from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cartControllers.js";
import { auth_middleware } from "../middlewares/authMiddleware.js";

export const cartRoutes = Router();

// Apply auth middleware to all cart endpoints
cartRoutes.use(auth_middleware);

/**
 * @openapi
 * /cart:
 *   get:
 *     tags:
 *       - Cart
 *     summary: Fetch the current shopping cart
 *     description: Retrieves or initializes the current client's shopping cart along with populated product details.
 *     responses:
 *       200:
 *         description: Cart retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cart retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "7f8c9a12-3b45-4d67-8901-234567890abc"
 *                     userId:
 *                       type: string
 *                       example: "e28322ca-7c22-482d-a3a8-442bd2304df3"
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "a1234567-b89c-4d01-2345-6789abcdef01"
 *                           cartId:
 *                             type: string
 *                             example: "7f8c9a12-3b45-4d67-8901-234567890abc"
 *                           productId:
 *                             type: string
 *                             example: "e28322ca-7c22-482d-a3a8-442bd2304df3"
 *                           quantity:
 *                             type: integer
 *                             example: 2
 *                           product:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "e28322ca-7c22-482d-a3a8-442bd2304df3"
 *                               name:
 *                                 type: string
 *                                 example: "Dell Latitude 5420"
 *                               description:
 *                                 type: string
 *                                 nullable: true
 *                                 example: "Business laptop with Intel Core i5 processor"
 *                               price:
 *                                 type: number
 *                                 format: float
 *                                 example: 450000
 *                               stock:
 *                                 type: integer
 *                                 example: 10
 *                               image:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                                 example:
 *                                   - "https://example.com/laptop.jpg"
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                               updatedAt:
 *                                 type: string
 *                                 format: date-time
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Internal server error.
 */
cartRoutes.get("/", getCart);
/**
 * @openapi
 * /cart/items:
 *   post:
 *     tags:
 *       - Cart
 *     summary: Add an item to the cart
 *     description: Adds a product to the cart. Increments quantity if the item is already present.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 example: "e28322ca-7c22-482d-a3a8-442bd2304df3"
 *               quantity:
 *                 type: integer
 *                 default: 1
 *                 minimum: 1
 *                 example: 2
 *     responses:
 *       200:
 *         description: Item added to cart successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Item added to cart"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "7f8c9a12-3b45-4d67-8901-234567890abc"
 *                     userId:
 *                       type: string
 *                       example: "e28322ca-7c22-482d-a3a8-442bd2304df3"
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           cartId:
 *                             type: string
 *                           productId:
 *                             type: string
 *                           quantity:
 *                             type: integer
 *                             example: 2
 *                           product:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                                 example: "Dell Latitude 5420"
 *                               description:
 *                                 type: string
 *                                 nullable: true
 *                               price:
 *                                 type: number
 *                                 format: float
 *                                 example: 450000
 *                               stock:
 *                                 type: integer
 *                                 example: 10
 *                               image:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                               updatedAt:
 *                                 type: string
 *                                 format: date-time
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Missing required productId or invalid quantity.
 *       401:
 *         description: Unauthorized - Token missing or invalid.
 *       404:
 *         description: Product not found.
 *       500:
 *         description: Internal server error.
 */
cartRoutes.post("/items", addToCart);
/**
 * @openapi
 * /cart/items/{id}:
 *   patch:
 *     tags:
 *       - Cart
 *     summary: Update cart item quantity
 *     description: Updates the quantity of a specific item inside the user's cart.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item unique ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cart item updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cart item updated"
 *                 data:
 *                   $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Quantity must be at least 1.
 *       401:
 *         description: Unauthorized - Token missing or invalid.
 *       404:
 *         description: Cart item not found.
 *       500:
 *         description: Internal server error.
 */
cartRoutes.patch("/items/:id", updateCartItem);

/**
 * @openapi
 * /cart/items/{id}:
 *   delete:
 *     tags:
 *       - Cart
 *     summary: Remove an item from the cart
 *     description: Deletes a single item from the user's cart by cart item ID.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item unique ID
 *     responses:
 *       200:
 *         description: Item removed from cart successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Item removed from cart"
 *                 data:
 *                   $ref: '#/components/schemas/Cart'
 *       401:
 *         description: Unauthorized - Token missing or invalid.
 *       404:
 *         description: Cart item not found.
 *       500:
 *         description: Internal server error.
 */
cartRoutes.delete("/items/:id", removeCartItem);

/**
 * @openapi
 * /cart:
 *   delete:
 *     tags:
 *       - Cart
 *     summary: Clear entire cart
 *     description: Removes all items from the authenticated user's active cart.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cart cleared successfully"
 *       401:
 *         description: Unauthorized - Token missing or invalid.
 *       500:
 *         description: Internal server error.
 */
cartRoutes.delete("/", clearCart);
