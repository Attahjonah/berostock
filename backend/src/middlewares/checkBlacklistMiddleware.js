const TokenBlacklist = require("../models/tokenBlacklistModel");

const checkBlacklistedToken = async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required." });
  }

  try {
    const tokenExists = await TokenBlacklist.findOne({ token: refreshToken });
    if (tokenExists) {
      return res.status(401).json({ message: "Refresh token is blacklisted. Please log in again." });
    }
    next();
  } catch (error) {
    console.error("Blacklist check error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = checkBlacklistedToken;
