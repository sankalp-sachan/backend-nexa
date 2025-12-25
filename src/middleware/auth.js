const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.isAuthenticatedUser = async (req, res, next) => {
  try {
    let token;

    // 1️⃣ Cookie (PRIMARY for production)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // 2️⃣ Authorization header (fallback)
    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Login first to access this resource." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.id || decoded.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ message: "User not found. Please login again." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
