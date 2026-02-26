const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '../.env' });

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // There is no listModels in the SDK for node? 
        // Actually, we can use the fetch API to check.
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        console.log("Available models:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("LIST FAILED:", error);
    }
}

listModels();
