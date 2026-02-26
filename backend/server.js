const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const server = http.createServer(app);

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const teamRoutes = require('./routes/teams');
const hackathonRoutes = require('./routes/hackathons');
const recommendationRoutes = require('./routes/recommendations');
const Message = require('./models/Message');

const chatRoutes = require('./routes/chat');

// Middleware
const allowedOrigins = [
    'http://localhost:3000',
    process.env.FRONTEND_URL, // Add your Vercel URL here
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/hackathons', hackathonRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/chat', chatRoutes);

// MongoDB Connection
mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log('Connected to MongoDB via Mongoose'))
    .catch(err => console.error('MongoDB connection error:', err));

// Socket.IO Setup
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust this in production
        methods: ["GET", "POST"]
    }
});

// Basic route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Backend is running with MongoDB' });
});

app.get('/api/messages/:roomId', async (req, res) => {
    try {
        const messages = await Message.find({ roomId: req.params.roomId }).sort({ createdAt: 1 });
        const formatted = messages.map(msg => ({
            roomId: msg.roomId,
            message: msg.content,
            senderId: msg.senderId.toString(),
            timestamp: msg.createdAt
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Socket.IO Connection Handling
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on('send_message', async (data) => {
        // data should contain { roomId, message, senderId }
        try {
            const newMessage = new Message({
                roomId: data.roomId,
                content: data.message,
                senderId: data.senderId
            });
            await newMessage.save();

            // Broadcast message
            io.to(data.roomId).emit('receive_message', data);
        } catch (error) {
            console.error('Error saving message:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
