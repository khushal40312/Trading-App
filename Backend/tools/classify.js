// tools/classify.js
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { model } = require("../aiModel/gemini");
const redisClient = require("../config/redisClient");

const classifyPrompt = ChatPromptTemplate.fromTemplate(`
Classify the user's fresh input + old Conversation memory context into one of these categories for a trading app:
- TRADING
- PORTFOLIO
- MARKET_ANALYSIS
- EDUCATION
- GENERAL_CHAT

📌 Memory Context: {memoryContext}
Fresh User Input: "{input}"

🔁 Instructions:
- Always read recent conversation before responding if conversation available.
- Just output the category name (or "out of context").
`);

const classifyTool = {
  name: "classifyInput",
  description: "Classifies the user's message into categories.",
  func: async ({ input, user, sessionId }) => {
    const data = await redisClient.get(`session:data:${user.id}:${sessionId}`);
    let memoryContext = data ? JSON.stringify(JSON.parse(data).interaction) : "";

    const chain = classifyPrompt
      .pipe(model) // Gemini LangChain wrapper
      .pipe(new StringOutputParser());

    const category = await chain.invoke({
      input,
      memoryContext
    });

    return category.trim();
  }
};

module.exports = { classifyTool };
