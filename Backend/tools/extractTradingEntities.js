const { model } = require("../aiModel/gemini");


const extractTradingEntities = {
  name: "extractTradingEntitiesToJson",
  description: "Extract Input Into JSON Format",

  func: async ({ input, user }) => {


    const extractionPrompt = `
    You are a trading command parser. Extract the following entities from user input:
    - action: buy or sell
    - symbol: trading pair or crypto name
    - amount: quantity in number
    - condition: any price condition or  if current price then context.currentPrice
    - orderType: "market", "limit", or "conditional" (based on context)
    
    Respond in this JSON format, Respond ONLY with JSON. No explanation.:
    {
      "action": "",
      "symbol": "",
      "amount": ,
      "condition": "",
      "orderType": ""
    }
      Example:
       {
      "action": "buy",
      "symbol": "BTC",
      "amount": 0.5,
      "condition": "price < 40000"or context.currentPrice,
      "orderType": "conditional"
    }
    
    
    User Input: "${input}"
    `;
    const result = await model.invoke(extractionPrompt);
    const cleaned = result.content.replace(/```json|```/g, '').trim();
    const jsonObject = JSON.parse(cleaned);


    return jsonObject;


  }

};
module.exports = { extractTradingEntities }


