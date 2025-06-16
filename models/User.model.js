const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        require: true
    },
    username: {
        type: String,
        require: true,
        unique: true
    },
    emailOrPhone: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    confirmPassword: {
        type: String,
       require: true
    }
}, { timestamps: true, }); // Automatically add createdAt and updatedAt fields

// Create and export the User model
const User = mongoose.model("User", userSchema);

module.exports = User;
