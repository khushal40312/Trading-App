// tools/classify.js
const {  analyzeModel, runOpsTask } = require("../aiModel/gemini");
const { getLatest3Interactions } = require("../services/ai.service");

const classifyTool = {
  name: "classifyInput",
  description: "Classifies the user's message into categories.",
  func: async ({ input, user, sessionId,ws }) => {
    
 
    const data = await getLatest3Interactions(user.id, sessionId)
    let memoryContext = data ? JSON.stringify(data) : "";
    const classifyPrompt = `
     Classify the user's fresh input + old Conversation memory context into one of these categories for a trading app:

    TRADING: Actions directly related to placing, modifying, or canceling buy/sell orders.

    PORTFOLIO: Requests about the user’s own holdings, balances, performance, or account details.

    MARKET_ANALYSIS: Questions or discussions about crypto research, market trends, forecasts,  price movements or Educational.

    GENERAL_CHAT: Any casual or off-topic conversation not related to trading, portfolio, or market analysis.

📌 Memory Context: ${memoryContext}
Fresh User Input: "${input}"

🔁 Instructions:

Always check the recent conversation history before classifying.

Just output the category name (or "out of context").
- Example output TRADING
`
const category= await runOpsTask(classifyPrompt)
    return category.trim();
  }
};

module.exports = { classifyTool };
