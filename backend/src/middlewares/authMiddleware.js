const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token missing from header" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET_KEY);
    req.user = {
      _id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };
    console.log("✅ Verified user:", req.user);
    next();
  } catch (err) {
    console.error("❌ Invalid or expired token:", err.message);
    return res.status(401).json({ message: "Session expired. Please log in again." });
  }
};

module.exports = verifyToken;
