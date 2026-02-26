const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '../.env' });

async function listModels() {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.models) {
            console.log("Model Names:");
            data.models.forEach(m => console.log(m.name));
        } else {
            console.log("No models found or error:", data);
        }
    } catch (error) {
        console.error("LIST FAILED:", error);
    }
}

listModels();
