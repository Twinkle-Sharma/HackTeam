const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const getRecommendations = async (userProfile, hackathons, users) => {
  const prompt = `
    Based on the following user profile, recommend the best hackathons and potential team members from the provided lists.
    
    User Profile:
    Name: ${userProfile.name}
    Skills: ${userProfile.skills.join(", ")}
    Bio: ${userProfile.bio}
    
    Hackathons List:
    ${hackathons.map(h => `- ${h.name}: ${h.description} (Type: ${h.type}, Location: ${h.location})`).join("\n")}
    
    Other Users List (Potential Team Members):
    ${users.map(u => `- ${u.name}: Skills: ${u.skills.join(", ")}, Bio: ${u.bio}`).join("\n")}
    
    Return the response as a JSON object with two keys:
    1. "recommendedHackathons": An array of objects with "id" (matching hackathon id), "reason" (why it's a good match).
    2. "recommendedTeammates": An array of objects with "id" (matching user id), "reason" (why they are a good match).
    
    Limit recommendations to the top 3 for each category. Ensure the JSON is valid and only return the JSON block.
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

module.exports = { getRecommendations };
