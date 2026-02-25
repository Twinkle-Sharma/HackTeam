const mongoose = require('mongoose');

const hackathonSchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: String, required: true },
    location: { type: String, required: true },
    type: { type: String, required: true }, // offline/online
    description: { type: String, required: true },
    participants: { type: Number, default: 0 },
    image: { type: String, default: '' },
    teamIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
    registeredUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Hackathon', hackathonSchema);
