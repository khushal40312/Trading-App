// // models/gemini.js
// const { GoogleGenerativeAI } = require("@google/generative-ai");
// const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// const geminiChat = async (messages) => {
//   const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
//   console.log(messages)
//   const chat = model.startChat({ history: messages });
//   const result = await chat.sendMessage(messages.at(-1).parts || messages.at(-1));
//   return result.response.text();
// };
// const model = new ChatGoogleGenerativeAI({
//   apiKey: process.env.GOOGLE_API_KEY,
//   model: "gemini-2.5-flash",
// });

// module.exports = { geminiChat, model }


// const =