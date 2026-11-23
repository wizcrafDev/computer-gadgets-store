import "dotenv/config";
import { createTransport } from "nodemailer";

export const messenger = createTransport({
  host: process.env["SMTP_HOST"],
  port: Number(process.env["SMTP_PORT"]),
  secure: true,
  auth: {
    user: process.env["EMAIL_USER"],
    pass: process.env["EMAIL_PASS"],
  },
});
