const logger = require('../../utils/logger');
const User = require('../../models/userModel');
const { hmacProcess } = require('../../utils/authUtils'); 
const { sendVerificationEmail } = require('../../utils/mailerUtils');

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  logger.info(`START: Forgot password request for ${email}`);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Do not reveal whether email exists
      return res.status(200).json({ message: "If the email exists, a code has been sent." });
    }

    // Generate 6-digit code as string, padded with leading zeros if needed
    const codeValue = Math.floor(100000 + Math.random() * 900000).toString();

    // Send email with the code
    await sendVerificationEmail({ to: email, name: user.firstName || '', code: codeValue });

    // Hash the code before saving
    const hashedCode = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET);

    user.resetPasswordCode = hashedCode;
    user.resetPasswordCodeExpires = Date.now() + 15 * 60 * 1000; // 15 mins from now

    await user.save();

    logger.info(`END: Forgot password code sent to ${email}`);
    res.status(200).json({ message: "If the email exists, a code has been sent." });
  } catch (error) {
    logger.error(`Forgot password error: ${error.message}`);
    res.status(500).json({ message: "Internal server error." });
  }
};

