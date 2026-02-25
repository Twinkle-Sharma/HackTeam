const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    content: { type: String, required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // if private
    roomId: { type: String, required: false } // for group chat
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
