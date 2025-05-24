const logger = require('../../utils/logger');
const User = require('../../models/userModel');
const { hashPassword, doHashValidation, validatePassword } = require("../../utils/authUtils");
const { sendSecurityAlertEmail } = require("../../utils/mailerUtils"); 

exports.changePassword = async (req, res) => {
  const userId = req.user._id;
  const { current_password, new_password, confirm_new_password } = req.body;

  if (!current_password || !new_password || !confirm_new_password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (new_password !== confirm_new_password) {
    return res.status(400).json({ message: "New passwords do not match." });
  }

  if (!validatePassword(new_password)) {
    return res.status(400).json({
      message: "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.",
    });
  }

  try {
    logger.info(`START: Attempting to change password for user: ${userId}`);
    const user = await User.findById(userId).select("password email");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isValidCurrentPassword = await doHashValidation(current_password, user.password);

    if (!isValidCurrentPassword) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    user.password = await hashPassword(new_password);
    await user.save();

    await sendSecurityAlertEmail(user.email); 

    logger.info(`END: Password changed successfully for user: ${userId}`);
    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    logger.error(`Error changing password for user ${userId}: ${error.message}\n${error.stack}`);
    res.status(500).json({ message: "Internal server error." });
  }
};



