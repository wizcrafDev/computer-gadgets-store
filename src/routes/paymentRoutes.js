import express from "express";
import {
  initializePayment,
  verifyPayment,
  handlePaystackWebhook,
} from "../controllers/paymentController.js";
import { auth_middleware } from "../middlewares/authMiddleware.js";

const paymentRoutes = express.Router();

/**
 * @openapi
 * /payments/initialize:
 *   post:
 *     tags:
 *       - Payments
 *     summary: Initialize Paystack payment for an order
 *     description: Generates a Paystack checkout authorization URL and payment reference for an existing user order.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 *                 format: uuid
 *                 example: "a7890123-45bc-def6-7890-123456789abc"
 *     responses:
 *       200:
 *         description: Payment initialized successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Payment initialized successfully"
 *                 authorization_url:
 *                   type: string
 *                   example: "https://checkout.paystack.com/0123456789"
 *                 reference:
 *                   type: string
 *                   example: "T1234567890"
 *       400:
 *         description: Missing orderId.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Order not found.
 *       500:
 *         description: Internal server error or Paystack API failure.
 */
paymentRoutes.post("/initialize", auth_middleware, initializePayment);

/**
 * @openapi
 * /payments/verify/{reference}:
 *   get:
 *     tags:
 *       - Payments
 *     summary: Verify payment status via Paystack transaction reference
 *     description: Endpoint called after customer completes Paystack checkout to verify payment and mark order as PAID.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction reference generated during payment initialization.
 *     responses:
 *       200:
 *         description: Payment verified successfully and order updated to PAID.
 *       400:
 *         description: Payment failed or was abandoned.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Error verifying payment.
 */
paymentRoutes.get("/verify/:reference", auth_middleware, verifyPayment);

/**
 * @openapi
 * /payments/webhook:
 *   post:
 *     tags:
 *       - Payments
 *     summary: Paystack webhook event handler
 *     description: Public route called directly by Paystack servers to notify status updates (e.g. charge.success).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Event received and processed successfully.
 *       400:
 *         description: Invalid x-paystack-signature header.
 *       500:
 *         description: Webhook error.
 */
paymentRoutes.post("/webhook", handlePaystackWebhook);

export default paymentRoutes;
