const { model, analyzeModel } = require("../aiModel/gemini");
const { getLatest2TradesandInteractions } = require("../services/ai.service");
const { retrieveMemoryTool } = require("./retriveMemoryTool");

const tradingInputClassifierTool = {
  name: "tradingInputClassifier",
  description: "Classifies the user's trade input ",

  func: async ({ input, user, sessionId }) => {
    const data = await getLatest2TradesandInteractions(user.id, sessionId)
    let memoryContext = data ? JSON.stringify(data) : "";
    const vectorMemory = await retrieveMemoryTool.func({ input, userId: user.id, dataType: 'TRADING' })


    const classificationPrompt = `
      Cached Memory Context: ${JSON.stringify(memoryContext)}
      Vector long term Memory:${vectorMemory}
      Current Input: "${input}"
      
      Classify this input:
      1. FRESH_TRADING_REQUEST - New buy/sell request
      2. TRADE_CONFIRMATION - Confirming a pending trade
      3. TRADE_MODIFICATION - Want to change pending trade
      4. TRADE_CANCELLATION - Cancel pending trade
      6. GENERAL_QUESTION - Non-trading query
      
      Also extract confidence level (0-1).
      
      Return: {"category": "...", "confidence": 0.9, "reasoning": "..."}
    `;

    const result = await analyzeModel(classificationPrompt);
    let parsed = JSON.parse(result)
   console.log(parsed)
    return parsed;

  }

};
module.exports = { tradingInputClassifierTool }


