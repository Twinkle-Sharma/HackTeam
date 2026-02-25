const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('./models/User');
const Hackathon = require('./models/Hackathon');

const mockUsers = [
    {
        name: "Aarav Sharma",
        email: "aarav.sharma@example.com",
        skills: ["React", "Node.js", "MongoDB"],
        bio: "Full-stack developer passionate about building scalable web applications.",
        gender: "male",
        avatar: "/developer-portrait.png",
        lookingForTeam: true,
    },
    {
        name: "Priya Verma",
        email: "priya.verma@example.com",
        skills: ["UI/UX Design", "Figma", "Product Design"],
        bio: "Product designer focused on creating intuitive user experiences.",
        gender: "female",
        avatar: "/designer-portrait.png",
        lookingForTeam: true,
    },
    {
        name: "Tina Sharma",
        email: "tina.sharma@example.com",
        skills: ["Python", "Machine Learning", "Data Science"],
        bio: "ML engineer interested in applying AI to solve real-world problems.",
        gender: "female",
        avatar: "/data-scientist-workspace.png",
        lookingForTeam: true,
    },
    {
        name: "Ananya Iyer",
        email: "ananya.iyer@example.com",
        skills: ["Marketing", "Content Strategy", "Social Media"],
        bio: "Marketing specialist helping teams craft compelling narratives.",
        gender: "female",
        avatar: "/marketing-professional.png",
        lookingForTeam: true,
    },
    {
        name: "Kabir Singh",
        email: "kabir.singh@example.com",
        skills: ["Flutter", "Swift", "Mobile Development"],
        bio: "Mobile developer with 5 years of experience in iOS and Android.",
        gender: "male",
        avatar: "/mobile-developer.png",
        lookingForTeam: true,
    },
    {
        name: "Rohan",
        email: "sneha.reddy@example.com",
        skills: ["DevOps", "AWS", "Docker"],
        bio: "DevOps engineer specializing in cloud infrastructure and automation.",
        gender: "male",
        avatar: "/thoughtful-engineer.png",
        lookingForTeam: true,
    }
];

const mockHackathons = [
    {
        name: "Tech India Innovate 2026",
        date: "2026-1-15",
        location: "Bengaluru, Karnataka",
        type: "offline",
        description: "Build the next generation of web applications with cutting-edge technology.",
        participants: 234,
        image: "/tech-conference.png",
    },
    {
        name: "AI Bharat Hackathon",
        date: "2025-11-20",
        location: "Online",
        type: "online",
        description: "Create innovative AI solutions to solve real-world problems.",
        participants: 567,
        image: "/ai-digital.jpg",
    },
    {
        name: "Healthcare Innovation Sprint India",
        date: "2026-1-01",
        location: "Mumbai, Maharashtra",
        type: "offline",
        description: "Transform healthcare through technology and innovation.",
        participants: 189,
        image: "/healthcare-tech.jpg",
    },
    {
        name: "Web3 India Summit",
        date: "2025-12-18",
        location: "Online",
        type: "online",
        description: "Build decentralized applications on blockchain technology.",
        participants: 423,
        image: "/blockchain-web3.jpg",
    },
    {
        name: "Mobile App Challenge India",
        date: "2026-01-10",
        location: "Hyderabad, Telangana",
        type: "offline",
        description: "Create the next viral mobile application in 48 hours.",
        participants: 312,
        image: "/mobile-app-showcase.png",
    },
    {
        name: "Climate Tech Hackathon India",
        date: "2025-01-25",
        location: "Online",
        type: "online",
        description: "Build sustainable solutions for climate change challenges.",
        participants: 289,
        image: "/climate-environment.jpg",
    },
    {
        name: "GenAI Revolution Challenge",
        date: "2026-02-15",
        location: "Pune, Maharashtra",
        type: "offline",
        description: "Explore the potential of Generative AI to create content and code.",
        participants: 450,
        image: "/genai.jpg",
    },
    {
        name: "CyberGuard Zero Trust 2025",
        date: "2026-03-05",
        location: "Online",
        type: "online",
        description: "Defend systems against next-gen threats using Zero Trust architecture.",
        participants: 600,
        image: "/cyberguard.jpg",
    },
    {
        name: "Quantum Leap India",
        date: "2026-03-20",
        location: "Bengaluru, Karnataka",
        type: "offline",
        description: "Harness the power of quantum computing to solve complex algorithms.",
        participants: 150,
        image: "/quantumleap.jpg",
    },
    {
        name: "Fintech Nexus Summit",
        date: "2026-04-10",
        location: "Mumbai, Maharashtra",
        type: "offline",
        description: "Revolutionize digital payments and decentralized finance solutions.",
        participants: 520,
        image: "/fintech nexus.jpg",
    },
    {
        name: "AR/VR Odyssey Hack",
        date: "2025-04-25",
        location: "Online",
        type: "online",
        description: "Build immersive experiences for the metaverse and spatial computing.",
        participants: 380,
        image: "/AR.jpg",
    },
    {
        name: "NextGen EdTech Hackathon",
        date: "2025-05-15",
        location: "Online",
        type: "online",
        description: "Create the future of learning with interactive and personalized AI tutors.",
        participants: 410,
        image: "/nextgen.jpg",
    }
];

async function seedDatabase() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('Connected!');

        // Seed Users
        console.log('Seeding users...');
        for (const userData of mockUsers) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash("password123", salt);

            await User.findOneAndUpdate(
                { email: userData.email },
                {
                    ...userData,
                    password: hashedPassword
                },
                { upsert: true, returnDocument: 'after' }
            );
            console.log(`Seeded/Updated User: ${userData.name}`);
        }

        // Seed Hackathons
        console.log('Cleaning up old hackathons...');
        await Hackathon.deleteMany({});

        console.log('Seeding hackathons...');
        for (const hackathonData of mockHackathons) {
            await Hackathon.findOneAndUpdate(
                { name: hackathonData.name },
                hackathonData,
                { upsert: true, returnDocument: 'after' }
            );
            console.log(`Seeded/Updated Hackathon: ${hackathonData.name}`);
        }

        console.log('Seeding completed successfully!');
    } catch (err) {
        console.error('Seeding error:', err);
    } finally {
        mongoose.disconnect();
    }
}

seedDatabase();

