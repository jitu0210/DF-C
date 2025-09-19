import jwt from "jsonwebtoken";
import config from "../config/env.config.js";
import User from "../models/user.model.js";

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Token is not valid.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Token is not valid.",
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(decoded.id).select("-password");

      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    next();
  }
};
