import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token " });
    }
    // const user = await User.findById(decoded.userId);
    // if (!user) {
    //   return res.status(401).json({ message: "user not found " });
    // }
    // req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute Middleware ", error.message);
    res.status(500).json({ message: "Error in protectRoute middleware" });
  }
};

export default protectRoute;
