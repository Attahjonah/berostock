// routes/admin.js
const express = require("express");
const router = express.Router();
const { updateUserRole } = require("../controllers/updateUserRoleController");
const authMiddleware = require("../middlewares/authMiddleware"); // Sets req.user
const isAdmin = require("../middlewares/isAdmin");

router.patch("/users/:id/role", authMiddleware, isAdmin, updateUserRole);

module.exports = router;
