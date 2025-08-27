const { model } = require("../aiModel/gemini");
const redisClient = require("../config/redisClient");
const { getLatest3Interactions, getLatest3Trades } = require("../services/ai.service");
const { safeSend } = require("../webServer");

const tradeCancellationResolverTool = {
    name: "tradeCancellationResolver",
    description: "Identifies if a trade exists that the user wants to cancel.",

    func: async ({ input, user, sessionId, ws }) => {
        safeSend(ws, { event: "typing", status: true });


        // Fetch latest interactions + trades
        const oldChats = await getLatest3Interactions(user.id, sessionId);
        const oldTrades = await getLatest3Trades(user.id, sessionId);

        const prompt = `
      You're an assistant that determines if the user wants to cancel a trade.

      ---
      **Recent User Interactions (Chats):**
      ${JSON.stringify(oldChats, null, 2)}

      **Trades in Cache:**
      ${JSON.stringify(oldTrades, null, 2)}

      **User's Current Input:**
      "${input}"

      ---
      Your task:
      1. Identify if the user wants to cancel a specific trade.
      2. If yes, respond in the following JSON format:
         {
           "status": "SUCCESS",
           "tradeId": "<TRADE_ID>",
           "message": "Friendly confirmation message about successful cancellation with trade info"
         }
      3. If no trade found, return exactly:
         { "status": "TRADE_NOT_FOUND" }

      Constraints:
      - Always use **Markdown** inside the message field.
      - Always end the message with: *“Is there anything else you’d like to know?”*
      
    `;

        const result = await model.invoke(prompt);
        const cleaned = result.content.replace(/```json|```/g, '').trim();

        let parsed;
        try {
            parsed = JSON.parse(cleaned);
        } catch (err) {
            return "Something went wrong parsing LLM response.";
        }

        if (parsed.status === "SUCCESS") {
            // Update pending trades in Redis
            const sessionKey = `session:data:${user.id}:${sessionId}`;
            let sessionData = await redisClient.get(sessionKey);
            sessionData = sessionData ? JSON.parse(sessionData) : { pendingTrades: [], interaction: [] };

            // Update matching trade status
            sessionData.pendingTrades = sessionData.pendingTrades.map(trade =>
                trade.id === parsed.tradeId && trade.status === "WAITING_FOR_CONFIRMATION"
                    ? { ...trade, status: "CANCELLED" }
                    : trade
            );

            // Add interaction
            sessionData.interaction.push({
                input,
                reply: parsed.message
            });

            await redisClient.setEx(sessionKey, 900, JSON.stringify(sessionData));
            safeSend(ws, { event: "typing", status: false });


            return parsed.message;
        }

        if (parsed.status === "TRADE_NOT_FOUND") {
            const notFoundMessage = `***Trade Not Found***  

It looks like I couldn’t find any trade matching your cancellation request.  
- Please double-check the trade details.  
- Only trades with status **WAITING_FOR_CONFIRMATION** can be cancelled.  

*Is there anything else you’d like to know?*`;
            safeSend(ws, { event: "typing", status: true });


            return notFoundMessage;
        }
        safeSend(ws, { event: "typing", status: false });


        return "Unexpected response format.";
    }
};

module.exports = { tradeCancellationResolverTool };
