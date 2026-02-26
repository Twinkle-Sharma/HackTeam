const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '../.env' });

async function testGemini() {
    try {
        console.log("Using API Key:", process.env.GEMINI_API_KEY ? "EXISTS" : "MISSING");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "models/gemini-flash-latest" });

        console.log("Testing generateContent...");
        const result = await model.generateContent("Hello, are you there?");
        const response = await result.response;
        console.log("Response:", response.text());
        console.log("TEST SUCCESSFUL");
    } catch (error) {
        console.error("TEST FAILED:", error);
    }
}

testGemini();
