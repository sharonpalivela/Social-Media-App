const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const protect  = require('../middlewares/authMiddleware');
const User = require('../models/User.model'); // Import the User model

// Sign-Up Route
router.post('/signup', async (req, res) => {
    const { username, emailOrPhone, password } = req.body;

    if (!username || !emailOrPhone || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ emailOrPhone });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password before saving
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Create new user
        const newUser = new User({
            username,
            emailOrPhone,
            password: hashedPassword
        });

        // Save user to the database
        await newUser.save();

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser._id,
                username: newUser.username,
                emailOrPhone: newUser.emailOrPhone
            }
        });
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
        return res.status(400).json({ message: 'Please provide email/phone and password' });
    }

    try {
        const user = await User.findOne({ emailOrPhone });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, "Chalopapa56", { expiresIn: '1h' });

        return res.status(200).json({
            message: 'Login successful',
            token,
            user: { 
                id: user._id,
                username: user.username,
                emailOrPhone: user.emailOrPhone
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get Profile (Protected)
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id, '-password'); // Exclude password field
        res.json({ message: 'User profile', user });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user details' });
    }
});

// 🚀 GET All Users Route (For Testing Chat System)
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, '_id username emailOrPhone'); // Exclude password
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
