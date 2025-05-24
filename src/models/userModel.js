const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },

    lastName: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    }, 

    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        required: true,
        enum :["admin", "manager", "staff"]
    },

    isVerified: {
        type: Boolean,
        default: false,
      },
      verificationCode: String,
      verificationCodeExpires: Date, 
      resetPasswordCode: String,
      resetPasswordCodeExpires: Date, 
     
},

{
    timestamps: true
})

module.exports = mongoose.model("User", userSchema)