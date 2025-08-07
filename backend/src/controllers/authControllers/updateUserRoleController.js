// controllers/adminController.js
const User = require("../../models/userModel");
const logger = require("../../utils/logger");

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = ["admin", "manager", "staff"];
    if (!allowedRoles.includes(role)) {
      return res
        .status(400)
        .json({ message: "Invalid role. Must be admin, manager, or staff." });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found." });

    const oldRole = user.role;
    user.role = role;
    await user.save();

    logger.info(
      `Admin ${req.user.email} changed role of ${user.email} from ${oldRole} to ${role}`
    );

    res.status(200).json({
      message: `User role updated to ${role} succesfully.`,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error("Error updating user role:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
