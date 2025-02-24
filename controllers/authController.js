const AuthService = require("../services/authService")

const Signup = async (req, res) => {

    const payload = req.body; // firstName, lastName, password, email

    const signupResponse = await AuthService.Signup(
        payload.firstName,
        payload.lastName,
        payload.email,
        payload.password,
    )

    res.status(signupResponse.code).json(signupResponse)
}

const Login = async (req, res) => {

    const payload = req.body;

    const loginResponse = await AuthService.Login(
        payload.email,
        payload.password,
    )

    res.status(loginResponse.code).json(loginResponse)
}

module.exports = {
    Signup,
    Login
}