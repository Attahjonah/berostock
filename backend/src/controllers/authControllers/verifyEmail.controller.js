const { createHmac } = require("crypto");
const User = require("../../models/userModel");
const logger = require("../../utils/logger");

// Utility to hash the code for comparison
const hmacProcess = (value, key) => {
  return createHmac('sha256', key).update(value).digest('hex');
};

exports.verifyEmail = async (req, res) => {
  const { code, email } = req.body;

  if (!code || !email) {
    return res.status(400).json({ success: false, message: "Email and verification code are required." });
  }

  try {
    logger.info(`START: Verifying email for ${email}`);

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (!user.verificationCode || !user.verificationCodeExpires) {
      return res.status(400).json({ success: false, message: "No verification code found. Please request a new one." });
    }

    if (Date.now() > user.verificationCodeExpires) {
      return res.status(400).json({ success: false, message: "Verification code has expired." });
    }

const hashedCode = hmacProcess(code.toString(), process.env.HMAC_VERIFICATION_CODE_SECRET);


    if (user.verificationCode !== hashedCode) {
      return res.status(400).json({ success: false, message: "Invalid verification code." });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    logger.info(`Email verified for user: ${user.email}`);

    res.status(200).json({ success: true, message: "Email successfully verified. You can now log in." });

  } catch (error) {
    logger.error("Verification error:", error);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
};


