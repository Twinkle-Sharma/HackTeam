const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Hackathon = require('../models/Hackathon');
const { getRecommendations } = require('../lib/gemini');

// Get recommendations for a specific user
router.get('/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`Fetching recommendations for user: ${user.name} (${userId})`);

        // Fetch all hackathons and other users for matching
        const hackathons = await Hackathon.find({});
        const otherUsers = await User.find({ _id: { $ne: userId } });

        console.log(`Found ${hackathons.length} hackathons and ${otherUsers.length} other users.`);

        const recommendations = await getRecommendations(user, hackathons, otherUsers);
        console.log('Gemini recommendations received:', JSON.stringify(recommendations));

        const recHackathons = Array.isArray(recommendations.recommendedHackathons)
            ? recommendations.recommendedHackathons
            : Array.isArray(recommendations.hackathons) ? recommendations.hackathons : [];

        const recTeammates = Array.isArray(recommendations.recommendedTeammates)
            ? recommendations.recommendedTeammates
            : Array.isArray(recommendations.teammates) ? recommendations.teammates : [];

        const enrichedHackathons = recHackathons.map(rec => {
            const idToMatch = rec.id || rec._id;
            const h = hackathons.find(hack => hack.name === idToMatch || hack._id.toString() === idToMatch);
            if (!h) return null;
            return { ...h.toObject(), reason: rec.reason };
        }).filter(Boolean);

        const enrichedTeammates = recTeammates.map(rec => {
            const idToMatch = rec.id || rec._id;
            const u = otherUsers.find(user => user.name === idToMatch || user._id.toString() === idToMatch);
            if (!u) return null;
            return { ...u.toObject(), reason: rec.reason };
        }).filter(Boolean);

        res.json({
            recommendedHackathons: enrichedHackathons,
            recommendedTeammates: enrichedTeammates
        });
    } catch (err) {
        console.error('Recommendation error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
