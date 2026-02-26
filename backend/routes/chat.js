const express = require('express');
const router = express.Router();
const { generateChatResponse } = require('../lib/gemini');

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
