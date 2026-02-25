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

        // Map back the recommendations with full object data if needed, 
        // but for now the AI returns reasons which is good.
        // We can enrich the data here.

        const enrichedHackathons = recommendations.recommendedHackathons.map(rec => {
            const h = hackathons.find(hack => hack.name === rec.id || hack._id.toString() === rec.id);
            return { ...h?.toObject(), reason: rec.reason };
        }).filter(h => h.name); // Filter out any that didn't match

        const enrichedTeammates = recommendations.recommendedTeammates.map(rec => {
            const u = otherUsers.find(user => user.name === rec.id || user._id.toString() === rec.id);
            return { ...u?.toObject(), reason: rec.reason };
        }).filter(u => u.name);

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
