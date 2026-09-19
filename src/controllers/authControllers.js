import { prisma } from "../config/db.js";
import bcrypt from "bcrypt";
import { generate_jwt } from "../middlewares/authMiddleware.js";
import { messenger } from "../config/email.js";

export const register = async (req, res) => {
  try {
    // get values from user form
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ msg: "Please provide name, email and password" });
    }

    // check if user already exist
    const exist_user = await prisma.user.findUnique({ where: { email } });
    // if (exist_user)
    //   return res.status(400).json({ message: "user already exist" });

    // hash the password
    const hashed_password = await bcrypt.hash(password, 10);

    // save user to db
    const user = await prisma.user.create({
      data: { name, email, password: hashed_password },
    });

    // send otp
    messenger.sendMail(
      {
        to: email,
        subject: "User Registration",
        text: `hello ${name}, your account has been registered successfully`,
      },
      (err, info) => console.log("email status:", info),
    );

    // console.log("email sent");

    // return successful
    // return res.sendStatus(201);
    return res.status(201).json({ message: "created", data: user });
  } catch (error) {
    console.log("[/register] error: ", error.message);
    return res.sendStatus(500);
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
      .sendStatus(500)
      .json({ message: "internal server errpr during login" });
  }
};

// auth user profile
export const me = async (req, res) => {
  try {
    const user_id = req.user_id;
    console.log("user_id: ", user_id);
    const user = await prisma.user.findUnique({
      where: {
        id: user_id,
      },
    });
    if (!user) return res.sendStatus(404);

    return res
      .status(200)
      .json({ message: "user retrieved successfully", data: user });
  } catch (error) {
    console.log("[auth/me] error occured: ", error.message);
    return res.sendStatus(500);
  }
};

// change password
export const change_password = async (req, res) => {
  try {
    const user_id = req.user_id;
    if (!user_id) return res.sendStatus(401);

    // const user = await prisma.user.findUnique({ where: { id: user_id } });
    // if (!user) return res.sendStatus(404);

    const new_password = req.body.password;
    if (!new_password)
      return res.status(400).json({ message: "password field is required" });

    const hashed_password = await bcrypt.hash(new_password, 5);

    // modify the user password
    const new_user = await prisma.user.update({
      where: {
        id: user_id,
      },
      data: {
        password: hashed_password,
      },
    });

    return res.sendStatus(200);
  } catch (error) {
    console.log("[auth/change_password] error occured: ", error.message);
    return res.sendStatus(500);
  }
};
