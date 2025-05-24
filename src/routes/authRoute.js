const express = require("express")
const router = express.Router()
const { signup } = require("../controllers/authControllers/signup.controller")
const { login }= require("../controllers/authControllers/login.controller")
const { verifyEmail }= require("../controllers/authControllers/verifyEmail.controller")
const verifyToken = require("../middlewares/authMiddleware")
const { changePassword } = require("../controllers/authControllers/changePassword.controller")
const { forgotPassword } = require("../controllers/authControllers/forgotPassword")
const { resetPassword } = require("../controllers/authControllers/resetPassword")
const { 
        loginRateLimiter, 
        signupRateLimiter, 
        changePasswordRateLimiter, 
        forgotPasswordLimiter, 
        resetPasswordLimiter 
    } = require("../middlewares/rateLimiter")


router.post("/signup", signupRateLimiter, signup)
router.post("/login", loginRateLimiter, login)
router.post("/verify-email", verifyEmail)
router.patch("/change-password", verifyToken, changePasswordRateLimiter, changePassword)
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword)
router.post("/reset-password", resetPasswordLimiter, resetPassword)

module.exports = router