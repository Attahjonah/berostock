const express = require("express");
const router = express.Router();
const { createUser } = require("../controllers/authControllers/createUser");
const { login } = require("../controllers/authControllers/login.controller");
const { logout } = require("../controllers/authControllers/logout.controller");
const verifyToken = require("../middlewares/authMiddleware");
const {
  changePassword,
} = require("../controllers/authControllers/changePassword.controller");
const {
  forgotPassword,
} = require("../controllers/authControllers/forgotPassword");
const {
  resetPassword,
} = require("../controllers/authControllers/resetPassword");
const refreshTokenController = require("../controllers/authControllers/refreshTokenController");
const {
  updateUserRole,
} = require("../controllers/authControllers/updateUserRoleController");
const checkBlacklistedToken = require("../middlewares/checkBlacklistMiddleware");
const authMiddleware = require("../middlewares/authMiddleware"); // Sets req.user
const isAdmin = require("../middlewares/isAdmin");

const {
  loginRateLimiter,
  createUserRateLimiter,
  changePasswordRateLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
} = require("../middlewares/rateLimiter");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and authorization routes
 */

/**
 * @swagger
 * /api/v1/auth/create-user:
 *   post:
 *     summary: Create a new user (admin only)
 *     description: Creates a new user (admin, manager, or staff). A secure password is generated and emailed to the user.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - role
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               role:
 *                 type: string
 *                 enum: [admin, manager, staff]
 *                 example: staff
 *     responses:
 *       201:
 *         description: User successfully created and credentials emailed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User created and login credentials sent to email.
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 64a01a2e9c9f1e0035b0e781
 *                     email:
 *                       type: string
 *                       example: johndoe@example.com
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     role:
 *                       type: string
 *                       example: staff
 *       400:
 *         description: Missing or invalid fields
 *       409:
 *         description: Email already in use
 *       500:
 *         description: Internal server error
 */

router.post(
  "/create-user",
  createUserRateLimiter,
  authMiddleware,
  isAdmin,
  createUser
);


/**
 * @swagger
 * /api/v1/auth/users/{id}:
 *   patch:
 *     summary: Update a user's role (admin only)
 *     description: Allows an admin to change the role of a user to admin, manager, or staff.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user whose role is to be updated
 *         schema:
 *           type: string
 *           example: 64a01a2e9c9f1e0035b0e781
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, manager, staff]
 *                 example: manager
 *     responses:
 *       200:
 *         description: User role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User role updated to manager succesfully.
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 64a01a2e9c9f1e0035b0e781
 *                     email:
 *                       type: string
 *                       example: johndoe@example.com
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     role:
 *                       type: string
 *                       example: manager
 *       400:
 *         description: Invalid role provided
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.patch("/users/:id", authMiddleware, isAdmin, updateUserRole);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Log in a user
 *     description: Authenticates a user using email and password, then returns JWT access and refresh tokens.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: examplePassword123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 refreshToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 64a01a2e9c9f1e0035b0e781
 *                     email:
 *                       type: string
 *                       example: johndoe@example.com
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     role:
 *                       type: string
 *                       example: staff
 *                     isVerified:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Email and password are required
 *       401:
 *         description: Invalid credentials or user does not exist
 *       403:
 *         description: Account is not verified
 *       500:
 *         description: Internal server error
 */

router.post("/login", loginRateLimiter, login);

//router.post("/verify-email", verifyEmail)

/**
 * @swagger
 * /api/v1/auth/change-password:
 *   patch:
 *     summary: Change user password
 *     tags: [Auth]
 *     description: Allows a logged-in user to change their password. Requires a valid access token.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - current_password
 *               - new_password
 *               - confirm_new_password
 *             properties:
 *               current_password:
 *                 type: string
 *                 example: OldPass@123
 *               new_password:
 *                 type: string
 *                 example: NewPass@456
 *               confirm_new_password:
 *                 type: string
 *                 example: NewPass@456
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password changed successfully.
 *       400:
 *         description: Missing fields, invalid input, or passwords do not match
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: New passwords do not match.
 *       401:
 *         description: Incorrect current password or unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Current password is incorrect.
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found.
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error.
 */

router.patch(
  "/change-password",
  verifyToken,
  changePasswordRateLimiter,
  changePassword
);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     description: Sends a 6-digit reset code to the user's email if the email is registered.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *     responses:
 *       200:
 *         description: Always returns success message to avoid leaking user existence.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: If the email exists, a code has been sent.
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error.
 */

router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset user password
 *     tags: [Auth]
 *     description: Resets the password using a valid email and 6-digit verification code.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *               - new_password
 *               - confirm_new_password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               code:
 *                 type: string
 *                 example: "123456"
 *               new_password:
 *                 type: string
 *                 example: NewPass@456
 *               confirm_new_password:
 *                 type: string
 *                 example: NewPass@456
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset successful.
 *       400:
 *         description: Invalid or expired code, missing fields, or password mismatch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid or expired code.
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error.
 */

router.post("/reset-password", resetPasswordLimiter, resetPassword);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Log out a user by blacklisting their refresh token
 *     tags: [Auth]
 *     description: Invalidates the user's refresh token to prevent further use.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out successfully.
 *       400:
 *         description: Refresh token not provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Refresh token is required.
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error.
 */

router.post("/logout", verifyToken, logout);

/**
 * @swagger
 * /api/v1/auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     description: Refresh access token using a valid refresh token. Rejects blacklisted tokens.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     isVerified:
 *                       type: boolean
 *       400:
 *         description: Refresh token not provided
 *       401:
 *         description: Token is blacklisted or user not found
 *       403:
 *         description: Invalid or expired refresh token
 *       500:
 *         description: Internal server error
 */

router.post(
  "/refresh-token",
  checkBlacklistedToken,
  refreshTokenController.refreshToken
);

module.exports = router;
