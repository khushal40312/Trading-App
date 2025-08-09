
const { model } = require("../aiModel/gemini");
const redisClient = require("../config/redisClient");






const finalTradeExtractorTool = {
    name: "finalTradeExtractor",
    description: "Generate Final entities for Trade",

    func: async ({ user, sessionId }) => {
     
        const data = await redisClient.get(`session:data:${user.id}:${sessionId}`)


        const Prompt = `
You are an AI trading entity extractor.

You will be given JSON stringify input containing:
- User message and details
- Classified category
- Context data (portfolio, market info, prices, etc.)
- Any pre-computed insights

Your job is to extract the **core trading entities** from the user's intent in the input field.  
Return them strictly as JSON with the following keys (if a value is not found, set it to null):

{
  "action": "<buy/sell>",
  "symbol": "<ticker symbol>",
  "amount": <numeric quantity or null>,
  "condition": "<price or condition like 'currentPrice', currentPrice < 40000,currentPrice <= 0.30,currentPrice >=  40000, etc.>",
  "orderType": "<market/limit/stop-loss/etc.>",
  "price": <numeric price if specified, else null>,
  "assetName": "<full asset name>",
  "riskProfile": "<low/moderate/high>",
  "status":"CONFIRMED"
}

Rules:
1. Always take the action from the user's input if clear (e.g., "buy", "sell").
2. Extract the symbol in uppercase (e.g., "PI", "BTC").
3. If the user specifies "current price ", map it to the numeric value from context.currentPrice.
4. If amount is mentioned in units, extract it as a number; if in currency, still record the number and note in condition.
5. Return only JSON, no explanations, no extra text.
6. Always ensure numeric fields are numbers, not strings.
7. Use context data to fill in missing but inferable values (e.g., assetName, riskProfile).
8.Change status from "WAITING_FOR_CONFIRMATION" to "CONFIRMED".
9. If uncertain, set field to null instead of guessing.

Here Is JSON:${data}
`
        const result = await model.invoke(Prompt);
        const cleaned = result.content.replace(/```json|```/g, '').trim();
        const jsonObject = JSON.parse(cleaned);
        return jsonObject;
    }
}

module.exports = { finalTradeExtractorTool }