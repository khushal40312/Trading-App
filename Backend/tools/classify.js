// tools/classify.js
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { model } = require("../aiModel/gemini");
const { getLatest3Interactions } = require("../services/ai.service");

const classifyPrompt = ChatPromptTemplate.fromTemplate(`
Classify the user's fresh input + old Conversation memory context into one of these categories for a trading app:

-TRADING: Actions directly related to placing, modifying, or canceling buy/sell orders.

-PORTFOLIO: Requests about the user’s own holdings, balances, performance, or account details.

-MARKET_ANALYSIS: Questions or discussions about crypto research, market trends, forecasts,  price movements or Educational.

-GENERAL_CHAT: Any casual or off-topic conversation not related to trading, portfolio, or market analysis.

📌 Memory Context: {memoryContext}
Fresh User Input: "{input}"

🔁 Instructions:

Always check the recent conversation history before classifying.

Just output the category name (or "out of context").
`);

const classifyTool = {
  name: "classifyInput",
  description: "Classifies the user's message into categories.",
  func: async ({ input, user, sessionId }) => {
    const data = await getLatest3Interactions(user.id, sessionId)
    console.log(data)
    let memoryContext = data ? JSON.stringify(data) : "";

    const chain = classifyPrompt
      .pipe(model) // Gemini LangChain wrapper
      .pipe(new StringOutputParser());

    const category = await chain.invoke({
      input,
      memoryContext
    });
    console.log(category)
    return category.trim();
  }
};

module.exports = { classifyTool };
