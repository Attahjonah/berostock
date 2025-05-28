const logger = require("../../utils/logger");
const TokenBlacklist = require("../../models/tokenBlacklistModel"); 

exports.logout = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required." });
  }

  try {
    await TokenBlacklist.create({ token: refreshToken, blacklistedAt: new Date() });

    logger.info(`Refresh token blacklisted successfully`);
    res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    res.status(500).json({ message: "Internal server error." });
  }
};
