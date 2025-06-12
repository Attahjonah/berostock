const bcrypt = require("bcryptjs");
const { createHmac } = require("crypto");
const User = require("../../models/userModel");
const logger = require("../../utils/logger");
const { sendVerificationEmail } = require("../../utils/mailerUtils");
const { validatePassword } = require("../../utils/authUtils");

// Utility function to hash verification code
const hmacProcess = (value, key) => {
  return createHmac('sha256', key).update(value).digest('hex');
};


exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "staff", // role set automatically here
    });

    // Generate and hash 6-digit verification code
    const codeValue = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    const hashedCode = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET);
    newUser.verificationCode = hashedCode;
    newUser.verificationCodeExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

    await newUser.save();

    try {
      await sendVerificationEmail({
        to: email,
        name: `${firstName} ${lastName}`,
        code: codeValue,
      });
    } catch (emailErr) {
      logger.error("Error sending verification code email:", emailErr);
      return res.status(500).json({
        success: false,
        message: "User created but failed to send verification code.",
      });
    }

    logger.info(`New user registered: ${email} as staff`);

    res.status(201).json({
      success: true,
      message: `User registered successfully.`,
    });
  } catch (err) {
    logger.error("Signup error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};




// exports.signup = async (req, res) => {
//   try {
//     const { firstName, lastName, email, password, role } = req.body;

//     if (!firstName || !lastName || !email || !password || !role) {
//       return res.status(400).json({ success: false, message: "All fields are required." });
//     }

//     const allowedRoles = ["admin", "manager", "staff"];
//     if (!allowedRoles.includes(role)) {
//       return res.status(400).json({ success: false, message: "Invalid user role." });
//     }

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ success: false, message: "Email already registered" });
//     }

//     if (!validatePassword(password)) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character",
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new User({
//       firstName,
//       lastName,
//       email,
//       password: hashedPassword,
//       role,
//     });

//     // Generate and hash 6-digit verification code
//     const codeValue = Math.floor(100000 + Math.random() * 900000).toString(); // always 6 digits
//     const hashedCode = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET);
//     newUser.verificationCode = hashedCode;
//     newUser.verificationCodeExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

//     await newUser.save();

//     try {
//       await sendVerificationEmail({
//         to: email,
//         name: `${firstName} ${lastName}`,
//         code: codeValue,
//       });
//     } catch (emailErr) {
//       logger.error("Error sending verification code email:", emailErr);
//       return res.status(500).json({
//         success: false,
//         message: "User created but failed to send verification code.",
//       });
//     }

//     logger.info(`New user registered: ${email} as ${role}`);

//     res.status(201).json({
//       success: true,
//       message: `User registered successfully. A verification code has been sent to ${email}.`,
//     });
//   } catch (err) {
//     logger.error("Signup error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Something went wrong.",
//     });
//   }
// };




