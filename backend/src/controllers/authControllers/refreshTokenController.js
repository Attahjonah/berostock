const jwt = require("jsonwebtoken");
const User = require("../../models/userModel");
const TokenBlacklist = require("../../models/tokenBlacklistModel");
const { generateAccessToken } = require("../../utils/authUtils");

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required." });
  }

  try {
    // Check if refresh token is blacklisted
    const blacklisted = await TokenBlacklist.findOne({ token: refreshToken });
    if (blacklisted) {
      return res.status(403).json({ message: "Refresh token is blacklisted." });
    }

    // Verify token
    const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY);
    const user = await User.findById(payload.id);

    if (!user || !user.isVerified) {
      return res.status(401).json({ message: "Invalid refresh token." });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user);

    res.status(200).json({
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error("Refresh token error:", err.message);
    return res.status(403).json({ message: "Invalid or expired refresh token." });
  }
};
