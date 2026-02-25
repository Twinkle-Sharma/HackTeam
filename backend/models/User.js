const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    bio: { type: String, default: '' },
    avatar: { type: String, default: '' },
    skills: [{ type: String }],
    lookingForTeam: { type: Boolean, default: true },
    teamIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
    sentMessageIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
    receivedMsgIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
    github: { type: String, default: '' },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
    registeredHackathons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
