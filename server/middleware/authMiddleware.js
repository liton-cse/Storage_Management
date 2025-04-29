import User from "../models/User.js";
import jwt from "jsonwebtoken";
//authenticated User ...
export const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded.id,
    });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.token = token;
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Please authenticate" });
  }
};
