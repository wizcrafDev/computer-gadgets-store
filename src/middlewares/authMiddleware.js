import jwt from "jsonwebtoken";
import "dotenv/config";

export const generate_jwt = async (payload) => {
  const jwt_secret = process.env.JWT_SECRET;
  const token = jwt.sign(payload, jwt_secret);
  return token;
};

export const auth_middleware = async (req, res, next) => {
  // check for auth token
  const auth_token = req.headers["authorization"]?.split(" ")[1];

  // console.log("auth header: ", req.headers);
  if (!auth_token)
    return res.status(401).json({
      message: "Access Denied. Token missing",
    });

  // verify jwt token, decrypt the token and get user_id
  try {
    const jwt_secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(auth_token, jwt_secret);
    req.user_id = decoded.user_id;
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ message: "invalid or expired token." });
  }
};

export const admin_middleware = (req, res, next) => {
  if (req.user && req.user.role === "ADMIN") {
    return next();
  }
  return res
    .status(403)
    .json({ message: "Access forbidden. Admin role required." });
};

// bearer xfahekljlw32iu8349u9
// ['bearer', 'xfaheklj']
