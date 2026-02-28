const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Team = require('../models/Team');
const User = require('../models/User');
const { generateChatResponse } = require('../lib/gemini');

// GET /api/chat/conversations/:userId
router.get('/conversations/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(`--- FETCH CONVERSATIONS --- UserId: ${userId}`);
        if (!userId || userId === 'undefined') {
            return res.status(400).json({ error: 'Valid User ID is required' });
        }

        // 1. Get teams the user is in
        const teams = await Team.find({ memberIds: userId })
            .populate('hackathonId', 'name')
            .populate('memberIds', 'name');

        const teamConversations = await Promise.all(teams.map(async team => {
            const lastMsg = await Message.findOne({ roomId: team._id.toString() }).sort({ createdAt: -1 });
            return {
                id: team._id.toString(),
                name: team.name,
                isTeam: true,
                participants: team.memberIds.map(m => m.name),
                lastMessage: lastMsg ? lastMsg.content : "No messages yet",
                timestamp: lastMsg ? lastMsg.createdAt : (team.updatedAt || team.createdAt || new Date()),
                avatar: "/generic-team-icon.png",
            };
        }));

        // 2. Get direct message threads
        // Find all messages involving this user as sender or receiver (excluding teams)
        // DMs have receiverId populated
        const dmMessages = await Message.find({
            $or: [
                { senderId: userId, receiverId: { $exists: true } },
                { receiverId: userId }
            ]
        }).sort({ createdAt: -1 });

        const directThreads = {};
        for (const msg of dmMessages) {
            const otherId = msg.senderId.toString() === userId ? msg.receiverId?.toString() : msg.senderId.toString();
            if (!otherId || directThreads[otherId]) continue;

            const otherUser = await User.findById(otherId);
            if (otherUser) {
                directThreads[otherId] = {
                    id: msg.roomId || [userId, otherId].sort().join('-'),
                    name: otherUser.name,
                    isTeam: false,
                    participants: [otherUser.name],
                    lastMessage: msg.content,
                    timestamp: msg.createdAt,
                    avatar: otherUser.avatar || "/placeholder.svg",
                };
            }
        }

        const allConversations = [...teamConversations, ...Object.values(directThreads)];
        allConversations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));


        res.json(allConversations);
    } catch (err) {
        console.error('Fetch conversations error:', err);
        res.status(500).json({ error: err.message });
    }

});

// POST /api/chat
router.post('/', async (req, res) => {

    try {
        const { messages } = req.body;
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        const responseText = await generateChatResponse(messages);
        res.json({ reply: responseText });
    } catch (err) {
        console.error('Chat AI route error:', err);
        res.status(500).json({ error: 'Failed to generate AI response' });
    }
});

module.exports = router;
