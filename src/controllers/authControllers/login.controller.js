const jwt = require("jsonwebtoken");
const logger = require("../../utils/logger");
const User = require("../../models/userModel");
const { generateAccessToken, generateRefreshToken, verifyPassword } = require('../../utils/authUtils');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    logger.info(`START: Attempting to log in a user`);

    // Find user and include password for verification
    const user = await User.findOne({ email }).select("_id email password firstName lastName role isVerified");

    if (!user) {
      return res.status(401).json({ message: "User does not exist" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in." });
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: "Invalid credentials!" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    logger.info(`User logged in: ${email}`);

    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    logger.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};






// const jwt = require("jsonwebtoken");
// const logger = require("../../utils/logger")
// const User = require("../../models/userModel");
// const { generateAccessToken, generateRefreshToken, verifyPassword } = require('../../utils/authUtils');

// exports.login = async (req, res) => {

//       const { email, password } = req.body;
  
//         // Validate input
//         if (!email || !password) {
//           return res.status(400).json({ message: "Email and password are required." });
//         }
//     try {
//       logger.info(`START: Attempting to log in a user`);

//       // Find user from DB
//       const user = await User.findOne({ email }, '_id email password firstName lastName role isVerified');

//       if (!user) {
//         return res.status(401).json({ message: "User does not exist" });
//       }
  
//       // Check if email is verified
//       if (!user.isVerified) {
//         return res.status(403).json({ message: "Please verify your email before logging in." });
//       }
  
  
//       const isValidPassword = await verifyPassword(password, user.password);
//           if (!isValidPassword) {
//               return res.status(401).json({ success: false, message: 'Invalid credentials!' });
//           }
  
//       // Generate tokens
//       const accessToken = generateAccessToken(user );
//       const refreshToken = generateRefreshToken(user);
  
//       logger.info(`User logged in: ${email}`);
  
//       res.status(200).json({
//         message: "Login successful",
//         accessToken,
//         refreshToken,
//         user: {
//           id: user._id,
//           firstName: user.firstName,
//           lastName: user.lastName,
//           email: user.email,
//           role: user.role,
//           isVerified: user.isVerified
//         },
//       });
//     } catch (err) {
//       logger.error("Login error:", err);
//       res.status(500).json({ message: "Internal server error" });
//     }
//   };
  
  
  