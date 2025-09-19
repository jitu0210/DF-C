import jwt from "jsonwebtoken";
import config from "../config/env.config.js";
import User from "../models/user.model.js";

export const initializeUsers = async () => {
  try {
    for (const userData of config.users) {
      const existingUser = await User.findOne({
        username: userData.username.toLowerCase(),
      });

      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`User ${userData.username} created successfully`);
      }
    }
  } catch (error) {
    console.error("Error initializing users:", error.message);
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({
      username: username.toLowerCase(),
      isActive: true,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, username: user.username },
      config.jwtSecret,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const protectedResource = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Access granted to protected resource",
      data: {
        secretData:
          "This is highly confidential information accessible only to authenticated users.",
        user: req.user.username,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Protected resource error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
