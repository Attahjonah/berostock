const User = require("../../models/userModel");
const { sendLoginCredentials } = require("../../utils/mailerUtils");
const { generateReadablePassword } = require("../../utils/passwordUtils"); // or generateRandomPassword

exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, role } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !role) {
      return res.status(400).json({ message: "All fields are required except password (it will be generated)." });
    }

    const allowedRoles = ["admin", "manager", "staff"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be admin, manager, or staff." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: "User with this email already exists." });
    }

    // 🔐 Generate random password
    const generatedPassword = generateReadablePassword(); // or generateRandomPassword()

    // Create user
    const newUser = new User({
      firstName,
      lastName,
      email,
      role,
      password: generatedPassword,
    });

    await newUser.save();

    // Send login credentials
    try {
      await sendLoginCredentials(email, generatedPassword, `${firstName} ${lastName}`);
    } catch (emailErr) {
      console.error("Email send error:", emailErr.message);
    }

    res.status(201).json({
      message: "User created and login credentials sent to email.",
      user: {
        id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
