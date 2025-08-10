const { model } = require("../aiModel/gemini");
const redisClient = require("../config/redisClient");

const finalTradeExtractorTool = {
  name: "finalTradeExtractor",
  description: "Generate Final entities for Trade",

  func: async ({ user, sessionId }) => {
    const data = await redisClient.get(`session:data:${user.id}:${sessionId}`);

    if (!data) {
      return { jsonObject:{reply: "No Pending trade found in memory"} };
    }

    let parsed;

    try {
      parsed = JSON.parse(data);
    } catch (err) {
      console.error("Error parsing Redis data:", err);
      return "Invalid session data format";
    }

    if (!Array.isArray(parsed.pendingTrades) || parsed.pendingTrades.length === 0) {
      return { jsonObject:{reply: "No Pending trade found in memory"} };

    }

    // Find latest pending trade by timestamp
    const latestPending = parsed.pendingTrades
      .filter(trade => trade.status === "WAITING_FOR_CONFIRMATION")
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

    if (!latestPending) {
      return { jsonObject:{reply: "No Pending trade found in memory"} };

    }

    // Prepare AI prompt
    const json = JSON.stringify([latestPending]);
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
        "userId": "${user.id}"
        "action": "<buy/sell>",
        "symbol": "<ticker symbol>",
        "amount": <numeric quantity or null>,
        "condition": "<price or condition like 'currentPrice', currentPrice < 40000,currentPrice <= 0.30,currentPrice >=  40000, etc.>",
        "orderType": "<market/limit/stop-loss/etc.>",
        "price": <numeric currentPrice if specified, else null>,
        "assetName": "<full asset name>",
        "riskProfile": "<low/moderate/high>",
        "status":"CONFIRMED",
        "reply":"PASS"
      }

      Rules:
      1. Always take the action from the user's input if clear (e.g., "buy", "sell").
      2. Extract the symbol in uppercase (e.g., "PI", "BTC").
      3. If the user specifies "current price ", map it to the numeric value from context.currentPrice.
      4. If amount is mentioned in units, extract it as a number; if in currency, still record the number and note in condition.
      5. Return only JSON, no explanations, no extra text.
      6. Always ensure numeric fields are numbers, not strings.
      7. Use context data to fill in missing but inferable values (e.g., assetName, riskProfile).
      8. Change status from "WAITING_FOR_CONFIRMATION" to "CONFIRMED".
      9. If uncertain, set field to null instead of guessing.

      Here Is JSON: ${json}
    `;

    const result = await model.invoke(Prompt);
    const cleaned = result.content.replace(/```json|```/g, "").trim();
    const jsonObject = JSON.parse(cleaned);
    const oldMemory = parsed.interaction;
    return { jsonObject,oldMemory };
  }
};

module.exports = { finalTradeExtractorTool };
