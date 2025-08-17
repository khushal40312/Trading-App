const { model } = require("../aiModel/gemini");
const redisClient = require("../config/redisClient");
const { getLatest3Interactions, getLatest3Trades } = require("../services/ai.service");

const tradeCancellationResolverTool = {
    name: "tradeCancellationResolver",
    description: "Identifies that does trade exists which the user wants to cancel ",

    func: async ({ input, user, sessionId }) => {
        // Fetch latest interactions + trades
        const oldChats = await getLatest3Interactions(user.id, sessionId);
        const oldTrades = await getLatest3Trades(user.id, sessionId);

        const prompt = `
      You're an assistant resolving is the trade exists that user wanna cancel .

      ---
      **Recent User Interactions (Chats):**
      ${JSON.stringify(oldChats, null, 2)}

      **Recent Trades:**
      ${JSON.stringify(oldTrades, null, 2)}

      **User's Current Input:**
      "${input}"

      ---
      Your task:
      1. Identify if the user wants to cancel a specific trade from the above context.
      2. If clear, return a nice friendly string with these instruction:
      - Always use USDT for prices or balances.
         - Entire response must be in **Markdown**.  
         - Output must be in a **single string** (no raw line breaks outside Markdown).  
         - Use **headers (##)**, **bold/italic**, bullet points, or definition style.  
         - Avoid '<br>' or HTML tags.  
         - Can use JSON snippets or template literals inside Markdown if useful.  
         - Always end with a gentle prompt: *“Is there anything else you’d like to know?”*  
         -Dont use # ## ## for Heading use ***content***.
      3. If no trade found , return TRADE_NOT_FOUND
      4. Output format tradeId in a string
      
    `;

        const result = await model.invoke(prompt);
        if (result.content !== 'TRADE_NOT_FOUND') {
            const sessionData = {
                pendingTrades: [
                ],
                interaction: [
                   { input,
                    reply:result.content}
                ]
            };
            await redisClient.setEx(`session:data:${user.id}:${sessionId}`, 900, JSON.stringify(sessionData));
        }

        return result.content;
    }
};

module.exports = { tradeCancellationResolverTool };
