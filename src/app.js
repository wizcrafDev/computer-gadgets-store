import dotenv from "dotenv";
dotenv.config();

import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { userRoute } from "./routes/userRoutes.js";
import { authRoutes } from "./routes/authRoutes.js";
import { productRoutes } from "./routes/productRoutes.js";
import { cartRoutes } from "./routes/cartRoutes.js";
import { orderRoutes } from "./routes/orderRoutes.js";
import { logger } from "./middlewares/logger.js";
import { auth_middleware } from "./middlewares/authMiddleware.js";
import { adminOrderRoutes } from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(logger);
// app.use(auth_middleware);
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce API Documentation",
      version: "1.0.0",
      description:
        "API for user authenticaton, products, cart, and other management. ",
    },
    servers: [
      {
        url: "http://localhost:5001",
        description: "Local Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    //Apply bearerAuth globally to all routes, or specify it per route
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/users", userRoute);
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/admin/orders", adminOrderRoutes);
app.use("/payments", paymentRoutes);
