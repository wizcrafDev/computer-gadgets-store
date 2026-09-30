import { prisma } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generate_jwt } from "../middlewares/authMiddleware.js";
import { messenger } from "../config/email.js";

export const register = async (req, res) => {
  console.log("RECEIVED BODY:", req.body);
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing" });
    }
    // get values from user form
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ msg: "Please provide name, email and password" });
    }

    // check if user already exist
    const exist_user = await prisma.user.findUnique({ where: { email } });
    if (exist_user)
      return res.status(400).json({ message: "User already exist" });

    // hash the password
    const hashed_password = await bcrypt.hash(password, 10);

    // save user to db
    const user = await prisma.user.create({
      data: { name, email, password: hashed_password },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // send confirmation email or otp
    messenger.sendMail(
      {
        from: `"GenesisX" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Welcome to our GadgetStore! Your account is ready 🎉",
        text: `Hello ${name}, \n\nWelcome to GenesisX! your account has been created successfully`,
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Segoe UI', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f6f9; padding: 40px 10px;">
            <tr>
              <td align="center">
              
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 540px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); overflow: hidden;">
                  
                
                  <tr>
                    <td style="background: linear-gradient(135deg, #0ea5e9, #0284c7); height: 6px; width: 100%;"></td>
                  </tr>

                  
                  <tr>
                    <td style="padding: 32px 32px 16px 32px; text-align: left;">
                      <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #0284c7; letter-spacing: -0.5px;">
                        GENESISX
                      </h1>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 0 32px 32px 32px; color: #334155; font-size: 15px; line-height: 1.6;">
                      <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #0f172a;">
                        Hello ${name}!, Welcome to GenesisX
                      </h2>
                      <p style="margin: 0 0 16px 0; color: #64748b;">
                        We're excited to have you with us.
                      </p>
                      <p style="margin: 0 0 20px 0; color: #475569;">
                        Your GadgetStore account has been successfully created, and you're now ready to explore our collection of quality gadgets and accessories.
                      </p>

                      
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 20px 0; background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px;">
                        <tr>
                          <td>
                            <span style="display: block; font-size: 12px; font-weight: 700; color: #0369a1; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
                              What you can do with your account:
                            </span>
                            <ul style="margin: 0; padding-left: 0; list-style: none; color: #334155; font-size: 14px; line-height: 2;">
                              <li>🛍️ Browse our latest gadgets</li>
                              <li>🛒 Add your favorite products to your cart</li>
                              <li>📦 Place and track your orders</li>
                              <li>🔐 Manage your account securely</li>
                            </ul>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 0 0 16px 0; color: #475569;">
                        Whether you're looking for a new laptop, accessories, networking equipment, or other tech essentials, we've got you covered.
                      </p>

                      
                      <div style="margin: 24px 0 16px 0; padding: 16px; background-color: #f8fafc; border-left: 4px solid #0284c7; border-radius: 0 8px 8px 0;">
                        <h3 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: #0f172a;">
                          Ready to start shopping?
                        </h3>
                        <p style="margin: 0; font-size: 13px; color: #64748b;">
                          Explore our store and find your next gadget.
                        </p>
                      </div>

                      <p style="margin: 20px 0 0 0; color: #475569;">
                        Thank you for choosing <strong>GenesisX</strong>. We look forward to serving you!
                      </p>
                      
                      <p style="margin: 16px 0 0 0; font-weight: 600; color: #0284c7;">
                        Happy shopping!<br>
                        <span style="color: #475569; font-weight: normal;">The GadgetStore Team</span>
                      </p>
                    </td>
                  </tr>

                  
                  <tr>
                    <td style="padding: 0 32px;">
                      <div style="border-top: 1px solid #e2e8f0;"></div>
                    </td>
                  </tr>

                  
                  <tr>
                    <td style="padding: 24px 32px; text-align: center; font-size: 12px; color: #94a3b8; background-color: #f8fafc;">
                      <p style="margin: 0 0 4px 0;">© ${new Date().getFullYear()} GadgetStore. All rights reserved.</p>
                      <p style="margin: 0;">This is an automated email. Please do not reply to this message.</p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
      },

      (err, info) => {
        if (err) {
          console.error("Email send error:", err);
        } else {
          console.log("Email sent successfully");
          console.log("email status:", info);
        }
      },
    );

    // return successful
    return res
      .status(201)
      .json({ message: "User registered successfully", data: user });
  } catch (error) {
    console.log("[/register] error: ", error.message);
    return res.status(500).json({
      message: "Internal server error during registration",
      error: error.message,
    });
  }
};

// Register as ADMIN
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, adminSecret } = req.body;

    const envSecret = process.env.ADMIN_REGISTRATION_SECRET;

    if (!name || !email || !password || !adminSecret) {
      return res.status(400).json({
        message: "Name, email, password, and adminSecret are required.",
      });
    }

    // Verify secret key from environment variables
    if (adminSecret !== process.env.ADMIN_REGISTRATION_SECRET) {
      return res
        .status(403)
        .json({ message: "Invalid admin registration secret key." });
      console.error(error.message);
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: "Admin account registered successfully.",
      data: newAdmin,
    });
  } catch (error) {
    console.error("[registerAdmin] Error:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// login endpoint
export const login = async (req, res) => {
  try {
    console.log("username:", req.user_name);
    // get email and password
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ msg: "Please provide, email and password" });
    }

    // check if user exist
    const exist_user = await prisma.user.findUnique({ where: { email } });
    if (!exist_user)
      return res.status(400).json({ message: "invalid email or password" });

    console.log("exist_user_password: ", typeof exist_user.password);
    // compare password
    const is_password_match = await bcrypt.compare(
      password,
      exist_user.password,
    );
    if (!is_password_match)
      return res.status(400).json({ message: "invalid email or password" });
    //create payload with user_id and role
    const payload = {
      user_id: exist_user.id,
      role: exist_user.role,
      //this role will return "ADMIN" or "USER"
    };
    // return (jwt token)
    const token = await generate_jwt(payload);

    return res.status(200).json({
      message: "Login Successful",
      token: token,
      user: {
        id: exist_user.id,
        name: exist_user.name,
        email: exist_user.email,
        role: exist_user.role,
      },
    });
  } catch (error) {
    console.log("[/login] error: ", error.message);
    return res
      .status(500)
      .json({ message: "internal server errpr during login" });
  }
};

// auth user profile
export const me = async (req, res) => {
  try {
    const user_id = req.user_id;
    console.log("user_id: ", user_id);
    const user = await prisma.user.findUnique({
      where: { id: user_id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        profile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    return res.status(200).json({
      message: "User profile retrieved successfully",
      data: user,
    });
  } catch (error) {
    console.log("[auth/me] error occured: ", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//forgot Password

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Please provide an email" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    //for security, send generic response even if user doesn't exist
    if (!user) {
      return res.status(200).json({
        message:
          "if that email is registered, a pasword reset token has been generated.",
      });
    }
    //Generate temporary reset token valid for 15 minutes
    const resetToken = jwt.sign({ user_id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    return res.status(200).json({
      message:
        "If that email is registered, a password reset token has been generated.",
      resetToken: resetToken,
    });
  } catch (error) {
    console.error("[/auth/forgot-password] error:", error.message);
    return res.status(500).json({ message: "internal server error" });
  }
};

// change password
export const change_password = async (req, res) => {
  try {
    const user_id = req.user_id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password field is required" });
    }

    const hashed_password = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user_id },
      data: { password: hashed_password },
    });

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("[/auth/change_password] error occurred:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
