const rateLimit = require('express-rate-limit');

// Login: limit to 5 requests per 15 minutes
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Signup: limit to 3 requests per hour
const signupRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: "Too many signup attempts. Please try again after an hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Password Reset: limit to 3 requests per 30 minutes
const resetRateLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: "Too many reset requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const changePasswordRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: "Too many password change attempts from this IP, please try again after an hour.",
  standardHeaders: true,
  legacyHeaders: false,
});


const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per window
  message: "Too many password reset requests. Please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many password reset attempts. Please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});


const productRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` per route
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});




module.exports = {
  loginRateLimiter,
  signupRateLimiter,
  resetRateLimiter,
  changePasswordRateLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
  productRateLimiter
};
