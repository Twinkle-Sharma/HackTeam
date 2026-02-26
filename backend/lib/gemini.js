const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-flash-latest" });

const getRecommendations = async (userProfile, hackathons, users) => {
  const prompt = `
    Based on the following user profile, recommend the best hackathons and potential team members from the provided lists.
    
    User Profile:
    Name: ${userProfile.name}
    Skills: ${userProfile.skills?.join(", ") || "None specified"}
    Bio: ${userProfile.bio || "None specified"}
    
    Hackathons List:
    ${hackathons.map(h => `- ID: ${h._id} | Name: ${h.name} | Description: ${h.description} | Type: ${h.type} | Location: ${h.location}`).join("\n")}
    
    Other Users List (Potential Team Members):
    ${users.map(u => `- ID: ${u._id} | Name: ${u.name} | Skills: ${u.skills?.join(", ")} | Bio: ${u.bio}`).join("\n")}
    
    When recommending teammates, please include a mix of:
    - Users with COMPLEMENTARY skills (e.g., if the user is frontend, suggest a backend developer).
    - Users with SIMILAR skills (e.g., if the user is frontend, suggest another frontend developer to share workload).

    Return the response as a JSON object with two keys:
    1. "recommendedHackathons": An array of objects with "id" (MUST match exactly the ID provided above), and "reason" (why it's a good match).
    2. "recommendedTeammates": An array of objects with "id" (MUST match exactly the ID provided above), and "reason" (why they are a good match, explicitly stating if they have complementary or similar skills).
    
    Limit recommendations to the top 3 for each category. ONLY RETURN A VALID JSON BLOCK WITHOUT ANY MARKDOWN TICKS.
  `;

  try {
    console.log("Sending prompt to Gemini...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    console.log("Raw response from Gemini:", text);

    // Clean up response if it contains markdown code blocks
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return {
      recommendedHackathons: [],
      recommendedTeammates: []
    };
  }
};

const generateChatResponse = async (messages) => {
  try {
    let formattedMessages = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const systemPrompt = "You are HackBot, a friendly and helpful AI assistant for a hackathon platform. You help users find hackathon ideas, pick tech stacks, build teams, and answer general hackathon-related questions. Keep your answers concise, encouraging, and helpful.";

    // Gemini requires chat history to begin with a 'user' message
    while (formattedMessages.length > 0 && formattedMessages[0].role === 'model') {
      formattedMessages.shift();
    }

    console.log("Formatted messages for Gemini:", JSON.stringify(formattedMessages, null, 2));

    const chatModel = genAI.getGenerativeModel({
      model: "models/gemini-flash-latest",
      systemInstruction: systemPrompt
    });

    const chat = chatModel.startChat({
      history: formattedMessages.slice(0, -1),
    });

    console.log("Sending message to Gemini:", messages[messages.length - 1].content);
    const result = await chat.sendMessage(messages[messages.length - 1].content);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("FULL Error generating chat response:", error);
    throw new Error('Failed to generate response');
  }
};

module.exports = { getRecommendations, generateChatResponse };
