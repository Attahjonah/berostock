const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { randomBytes, createHash } = require("crypto");
require('dotenv').config();

const {
  ACCESS_SECRET_KEY,
  ACCESS_TOKEN_LIFETIME,
  REFRESH_SECRET_KEY,
  REFRESH_TOKEN_LIFETIME
} = process.env;

exports.generatePasswordCode = () => {
  const rawToken = randomBytes(20).toString("hex");
  const passwordResetCode = createHash("sha256").update(rawToken).digest("hex");
  const verifyToken = randomBytes(32).toString("hex");
  const passwordResetExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  return { verifyToken, passwordResetCode, passwordResetExpire, rawToken };
};

exports.hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

exports.verifyPassword = async (plain, hash) => {
  return await bcrypt.compare(plain, hash);
};

exports.validatePassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%#./*?&])[A-Za-z\d@$!%#./*?&]{8,}$/;
  return regex.test(password);
};

exports.generateAccessToken = (user) => {
  const payload = { id: user._id, email: user.email, role: user.role };
  return jwt.sign(payload, ACCESS_SECRET_KEY, { expiresIn: ACCESS_TOKEN_LIFETIME });
};

exports.generateRefreshToken = (user) => {
  const payload = { id: user._id };
  return jwt.sign(payload, REFRESH_SECRET_KEY, { expiresIn: REFRESH_TOKEN_LIFETIME });
};

exports.validateAccessToken = (token) => {
  try {
    return jwt.verify(token, ACCESS_SECRET_KEY);
  } catch (err) {
    return null;
  }
};

exports.validateRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_SECRET_KEY);
  } catch (err) {
    return null;
  }
};

exports.doHashValidation = (value, hashedValue) => {
    const result = bcrypt.compare(value, hashedValue)
    return result;
}

exports.hmacProcess = (value, key) => {
  return crypto.createHmac('sha256', key).update(value.toString()).digest('hex');
};
