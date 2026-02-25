const express = require('express');
const Team = require('../models/Team');
const router = express.Router();

// Get all teams
router.get('/', async (req, res) => {
    try {
        const teams = await Team.find().populate('memberIds', 'name avatar skills').populate('hackathonId', 'name');
        res.json(teams);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new team
router.post('/', async (req, res) => {
    try {
        const { name, description, needsSkills, hackathonId, memberId } = req.body;

        // Create team
        const team = new Team({
            name,
            description,
            needsSkills: typeof needsSkills === 'string' ? needsSkills.split(',').map(s => s.trim()) : needsSkills,
            hackathonId,
            memberIds: [memberId] // creator is automatically a member
        });

        await team.save();

        res.status(201).json(team);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
