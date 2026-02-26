const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '../.env' });

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // The SDK might not have a direct listModels, we usually use the REST API for that
        // But we can try common names
        const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro"];
        for (const m of models) {
            try {
                console.log(`Testing model: ${m}`);
                const model = genAI.getGenerativeModel({ model: m });
                const result = await model.generateContent("test");
                console.log(`Model ${m} works!`);
                return m;
            } catch (e) {
                console.log(`Model ${m} failed: ${e.message}`);
            }
        }
    } catch (error) {
        console.error("LIST FAILED:", error);
    }
}

listModels();
