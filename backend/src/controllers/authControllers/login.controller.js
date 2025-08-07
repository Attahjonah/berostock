const logger = require("../../utils/logger");
const User = require("../../models/userModel");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyPassword,
} = require("../../utils/authUtils");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  // 🔍 Validate input
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    logger.info("START: Attempting to log in a user");

    // 🔐 Find user and explicitly include password
    const user = await User.findOne({ email }).select("+password _id email firstName lastName role isVerified");

    if (!user) {
      return res.status(401).json({ message: "User does not exist." });
    }

    // 🛡️ Check verification status
    if (!user.isVerified) {
      return res.status(403).json({ message: "Account is not verified. Contact admin." });
    }

    // 🔑 Compare password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // ✅ Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    logger.info(`SUCCESS: User logged in: ${email}`);

    // 🎯 Return response
    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    logger.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
