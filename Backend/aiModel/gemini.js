// models/gemini.js
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
console.log(process.env.GOOGLE_API_KEY)
// Normal Gemini model (free-form text)
const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-2.5-flash", // or "gemini-1.5-flash"
});

// JSON-only Gemini model
const jsonModel = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY2,
  model: "gemini-2.5-flash",
  config: {
    responseMimeType: "application/json",
  }
});

// ---------- Helpers like old Groq-style ----------

// JSON response (like analyzeModel)
async function analyzeModel(prompt) {
  // console.log(prompt)
  try {
    const res = await jsonModel.invoke(prompt);
    // LangChain packs responses in .content array
    
    return res ?? "";
  } catch (err) {
    console.error("AnalyzeModel Error:", err.message);
    return "";
  }
}

async function runOpsTask(prompt) {
  // console.log(prompt)

  try {
    const res = await model.invoke(prompt);
    console.log(res)
    return res?.content ?? "";
  } catch (err) {
    console.error("RunOpsTask Error:", err.message);
    return "";
  }
}

module.exports = { model, jsonModel, analyzeModel, runOpsTask };
