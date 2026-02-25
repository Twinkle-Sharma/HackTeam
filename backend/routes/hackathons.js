const express = require('express');
const Hackathon = require('../models/Hackathon');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Get all hackathons
router.get('/', async (req, res) => {
    try {
        const hackathons = await Hackathon.find();
        res.json(hackathons);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single hackathon
router.get('/:id', async (req, res) => {
    try {
        const hackathon = await Hackathon.findById(req.params.id);
        if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });
        res.json(hackathon);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Register for hackathon
router.post('/:id/register', auth, async (req, res) => {
    try {
        const hackathonId = req.params.id;
        const userId = req.user.id; // From auth middleware

        const [hackathon, user] = await Promise.all([
            Hackathon.findById(hackathonId),
            User.findById(userId)
        ]);

        if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Ensure arrays exist
        if (!hackathon.registeredUserIds) hackathon.registeredUserIds = [];
        if (!user.registeredHackathons) user.registeredHackathons = [];

        // Check if already registered
        if (hackathon.registeredUserIds.includes(userId)) {
            return res.status(400).json({ message: 'Already registered for this hackathon' });
        }

        hackathon.registeredUserIds.push(userId);
        hackathon.participants += 1;
        await hackathon.save();

        if (!user.registeredHackathons.includes(hackathonId)) {
            user.registeredHackathons.push(hackathonId);
            await user.save();
        }

        res.json({ message: 'Successfully registered for hackathon', hackathon });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
