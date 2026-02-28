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
        console.log('--- CREATE TEAM REQUEST ---');
        console.log('Name:', name);
        console.log('MemberID:', memberId);


        if (!name || !hackathonId || !memberId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create team
        const team = new Team({
            name,
            description,
            needsSkills: typeof needsSkills === 'string' ? needsSkills.split(',').map(s => s.trim()) : needsSkills,
            hackathonId,
            memberIds: [memberId] // creator is automatically a member
        });

        await team.save();

        // Return populated team
        const populatedTeam = await Team.findById(team._id).populate('memberIds', 'name avatar skills').populate('hackathonId', 'name');
        res.status(201).json(populatedTeam);
    } catch (err) {
        console.error('Create team error:', err);
        res.status(500).json({ error: err.message });
    }
});


// Join a team
router.post('/:teamId/join', async (req, res) => {
    try {
        const { userId } = req.body;
        const { teamId } = req.params;
        console.log(`--- JOIN TEAM REQUEST --- TeamId: ${teamId}, UserId: ${userId}`);

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const team = await Team.findById(req.params.teamId);

        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        // Use string comparison for Mongoose ObjectIds
        const isAlreadyMember = team.memberIds.some(id => id.toString() === userId.toString());
        if (isAlreadyMember) {
            return res.status(400).json({ error: 'User already in team' });
        }

        team.memberIds.push(userId);
        await team.save();

        const populatedTeam = await Team.findById(team._id).populate('memberIds', 'name avatar skills').populate('hackathonId', 'name');
        res.json(populatedTeam);
    } catch (err) {
        console.error('Join team error:', err);
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;

