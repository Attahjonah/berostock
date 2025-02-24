const UserModel = require("../models/userModel")
const jwt = require("jsonwebtoken")
require('dotenv').config()

const Signup = async ( firstName, lastName, email, password ) => {

    try {
        const newUser = await UserModel.create({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password
        })
    
        const token =  jwt.sign({ email }, process.env.SECRET_KEY );
    
        return {
            code: 201,
            success: true,
            message: 'signup succesful',
            data: {
                user: newUser,
                token,
            }
        }  
    } catch (error) {
        console.log(error) ;
        
        return {
            code: 500,
            success: false,
            data: null,
            message: 'Server error'
        }
        
    }

    
}

const Login = async ( email, password ) => {

    try {
        const user = await UserModel.findOne({ email });

    if (!user) {
        return {
            code: 400,
            success: false,
            data: null,
            message: 'Invalid credentials'
        }
    }

    const validPassword = await user.isValidPassword(password);

    if (!validPassword) {
        return {
            code: 400,
            success: false,
            data: null,
            message: 'Password or email not correct'
        }
    }

    const token = await jwt.sign({ email }, process.env.SECRET_KEY );

    return {
        code: 200,
        success: true,
        data: { user, token },
        message: 'Login successful'
    }
    } catch (error) {
        return {
        code: 500,
        success: false,
        data: null,
        message: 'Server error'
        }
        
    }
    
}

module.exports = {
    Signup,
    Login
}
