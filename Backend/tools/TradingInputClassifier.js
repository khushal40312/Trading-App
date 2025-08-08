const { model } = require("../aiModel/gemini");

const tradingInputClassifierTool = {
  name: "tradingInputClassifier",
  description: "Classifies the user's trade input ",

  func: async ({ input,user, sessionId }) => {

    let context = ''
    const classificationPrompt = `
      Context: ${JSON.stringify(context)}
      Current Input: "${input}"
      
      Classify this input:
      1. FRESH_TRADING_REQUEST - New buy/sell request
      2. TRADE_CONFIRMATION - Confirming a pending trade
      3. TRADE_MODIFICATION - Want to change pending trade
      4. TRADE_CANCELLATION - Cancel pending trade
      5. GENERAL_QUESTION - Non-trading query
      
      Also extract confidence level (0-1).
      
      Return: {"category": "...", "confidence": 0.9, "reasoning": "..."}
    `;

    const result = await model.invoke(classificationPrompt);
    const cleaned = result.content.replace(/```json|```/g, '').trim();
    const jsonObject = JSON.parse(cleaned);
    return jsonObject

  }

};
module.exports = { tradingInputClassifierTool }


