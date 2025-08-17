const { v4: uuidv4 } = require('uuid');

const { model } = require("../aiModel/gemini");
const { getLatest3Interactions, getLatest3Trades } = require("../services/ai.service");


const extractTradingEntities = {
  name: "extractTradingEntitiesToJson",
  description: "Extract Input Into JSON Format",

  func: async ({ input, user, sessionId }) => {

    const oldChats = await getLatest3Interactions(user.id, sessionId)
    const oldTrades = await getLatest3Trades(user.id, sessionId)
    let tradeId = uuidv4()
    console.log(oldTrades)
    const extractionPrompt = `
    You are a trading command parser. Extract the following entities from user input :
    - action: buy or sell
    - symbol: trading pair or crypto name
    - amount: quantity in number
    - condition: any price condition or  if current price then context.currentPrice
    - orderType: "market", "limit", or "conditional" (based on context)
    
    Respond in this JSON format, Respond ONLY with JSON. No explanation.:
    {
      "tradeId":${tradeId}  
      "action": "",
      "symbol": "",
      "amount": ,
      "condition": "",
      "orderType": ""
    }
      Example:
       {
      "tradeId":"1deu475ncihfdbdvkd8e5"
      "action": "buy",
      "symbol": "BTC",
      "amount": 0.5,
      "condition": "currentPrice < 40000"or context.currentPrice,
      "orderType": "conditional"
    }
    ***instructions***
    -Always look old conversation and Cached Trades to read and understand the situation.
    -Always return JSON
    - if its a Modification situation then look at cached trade and update the field that re said by user and response. 
    -if amount is not provided then add (numeric) 1  .


    
    User fresh Input: "${input}"
    User and Model recent Memory:${JSON.stringify(oldChats, null, 2)}
    Cached Trades(need Confirmation):${JSON.stringify(oldTrades, null, 2)}
    `;
    const result = await model.invoke(extractionPrompt);
    const cleaned = result.content.replace(/```json|```/g, '').trim();
    const jsonObject = JSON.parse(cleaned);

    console.log(jsonObject)
    return jsonObject;


  }

};
module.exports = { extractTradingEntities }


