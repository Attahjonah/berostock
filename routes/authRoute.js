const Router = require('express').Router
const AuthController = require("../controllers/authController")
const route = Router()

route.post('/login', AuthController.Login);
route.post('/signup', AuthController.Signup);

module.exports = route;