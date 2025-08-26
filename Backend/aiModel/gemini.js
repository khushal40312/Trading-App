// models/gemini.js

const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const Groq = require("groq-sdk");
const groq1 = new Groq({ apiKey: process.env.GROQ_API_KEY1 });
const groq2 = new Groq({ apiKey: process.env.GROQ_API_KEY2 });

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-2.5-flash",
});


async function analyzeModel(prompt) {
  try {


    const response = await groq1.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant. Always reply in valid JSON.",
        },
        {
          role: "user",
          content: `${prompt}\n\nRespond ONLY in JSON format.`,
        },
      ],
    });
    return response.choices?.[0]?.message?.content ?? "";

  } catch (error) {
    console.log(error.message)
  }

}


async function runOpsTask(prompt) {
  const response = await groq2.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0].message.content;
}
module.exports = { model, analyzeModel, runOpsTask }


