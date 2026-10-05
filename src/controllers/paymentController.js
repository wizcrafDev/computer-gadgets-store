import { prisma } from "../config/db.js";
import axios from "axios";
import crypto from "crypto";

// POST /api/payments/initialize
export const initializePayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user_id; // From auth_middleware

    if (!orderId) {
      return res.status(400).json({ message: "orderId is required" });
    }

    // Ensure order exists and belongs to the authenticated user
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { user: true },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const amountInKobo = Math.round(order.totalAmount * 100);

    console.log("PAYSTACK_SECRET_KEY:", process.env.PAYSTACK_SECRET_KEY);
    console.log(
      "starts with sk_:",
      process.env.PAYSTACK_SECRET_KEY?.startsWith("sk_"),
    );
    console.log("length:", process.env.PAYSTACK_SECRET_KEY?.length);

    const paystackResponse = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: order.user.email,
        amount: amountInKobo,
        metadata: {
          orderId: order.id,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    return res.status(200).json({
      message: "Payment initialized successfully",
      authorization_url: paystackResponse.data.data.authorization_url,
      reference: paystackResponse.data.data.reference,
    });
  } catch (error) {
    console.error("[initializePayment] error:", error.message);
    return res.status(500).json({
      message: "Failed to initialize payment",
      error: error.response?.data?.message || error.message,
    });
  }
};

// GET /api/payments/verify/:reference
export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    const data = paystackResponse.data.data;

    if (data.status === "success") {
      const orderId = data.metadata.orderId;

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
      });

      return res.status(200).json({
        message: "Payment verified successfully",
        order: updatedOrder,
      });
    }

    return res.status(400).json({
      message: "Payment verification failed",
      status: data.status,
    });
  } catch (error) {
    console.error("[verifyPayment] error:", error.message);
    return res.status(500).json({
      message: "Error verifying payment",
      error: error.response?.data?.message || error.message,
    });
  }
};

// POST /api/payments/webhook
export const handlePaystackWebhook = async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const bodyString =
      typeof req.body === "string" ? req.body : JSON.stringify(req.body);

    const hash = crypto
      .createHmac("sha512", secret)
      .update(bodyString)
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(400).send("Invalid signature");
    }

    const event = req.body;

    if (event.event === "charge.success") {
      const orderId = event.data.metadata.orderId;

      await prisma.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
      });
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error("[handlePaystackWebhook] error:", error.message);
    return res
      .status(500)
      .json({ message: "Webhook error", error: error.message });
  }
};
