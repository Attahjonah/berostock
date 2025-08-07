const logger = require('../../utils/logger');
const User = require('../../models/userModel');
const { hmacProcess, hashPassword, validatePassword } = require('../../utils/authUtils');

exports.resetPassword = async (req, res) => {
  const { email, code, new_password, confirm_new_password } = req.body;

  logger.info(`START: Reset password request for ${email}`);

  if (!email || !code || !new_password || !confirm_new_password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (new_password !== confirm_new_password) {
    return res.status(400).json({ message: "Passwords do not match." });
  }

  if (!validatePassword(new_password)) {
    return res.status(400).json({
      message:
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.",
    });
  }

  try {
    const user = await User.findOne({
      email,
      resetPasswordCodeExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired code." });
    }

    // Hash the code from request and compare to saved hashed code
    const hashedCode = hmacProcess(code, process.env.HMAC_VERIFICATION_CODE_SECRET);

    if (hashedCode !== user.resetPasswordCode) {
      return res.status(400).json({ message: "Invalid or expired code." });
    }

    user.password = await (new_password);
    user.resetPasswordCode = undefined;
    user.resetPasswordCodeExpires = undefined;

    await user.save();

    logger.info(`END: Password reset successful for user: ${email}`);
    res.status(200).json({ message: "Password reset successful." });
  } catch (error) {
    logger.error(`Reset password error: ${error.message}`);
    res.status(500).json({ message: "Internal server error." });
  }
};



