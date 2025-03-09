const bcryptjs = require('bcryptjs');
const User = require('../models/User.model');

// User Signup
exports.signup = async (req, res) => {
    const { fullName, username, emailOrPhone, password, confirmPassword } = req.body;

    if (!fullName || !username || !emailOrPhone || !password || !confirmPassword) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
        const existingUser = await User.findOne({ emailOrPhone });
        if (existingUser) {
            return res.status(400).json({ message: 'Email or Phone number already in use' });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        const newUser = new User({
            fullName,
            username,
            emailOrPhone,
            password: hashedPassword,
        });

        await newUser.save();
        return res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during user registration:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
