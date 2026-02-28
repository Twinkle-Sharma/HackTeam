const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, gender, github, bio, skills } = req.body;

        // Validation
        if (!name || name.trim().length < 3) {
            return res.status(400).json({ message: 'Name must be at least 3 characters long' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Determine avatar based on gender
        let avatar = '';
        if (gender === 'male') {
            avatar = `https://avatar.iran.liara.run/public/boy?username=${encodeURIComponent(name)}`;
        } else if (gender === 'female') {
            avatar = `https://avatar.iran.liara.run/public/girl?username=${encodeURIComponent(name)}`;
        } else {
            avatar = `https://avatar.iran.liara.run/public?username=${encodeURIComponent(name)}`;
        }

        // Create user
        user = new User({ name, email, password: hashedPassword, gender, github, avatar, bio, skills });
        await user.save();

        // Create token
        const payload = { user: { id: user._id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, bio: user.bio, skills: user.skills, github: user.github, avatar: user.avatar } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create token
        const payload = { user: { id: user._id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user: { id: user._id, name: user.name, email: user.email, bio: user.bio, skills: user.skills, github: user.github, avatar: user.avatar } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
