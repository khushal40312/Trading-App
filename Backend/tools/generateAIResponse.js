const { model } = require("../aiModel/gemini");
const { getLatest3Interactions } = require("../services/ai.service");

const generateAIResponse = {
  name: "initialResponse",
  description: "Generate Trade Plan",

  func: async ({ context, entities, input, tradeClassification, user, sessionId }) => {

    // Check if required entities are present
    if (!entities.action || !entities.symbol || !entities.amount || !entities.condition) {
      return `
I wasn't able to understand your trade request fully.  
Please provide clearer trade details so I can help you better.  

Here are some examples you can try:  
- "Buy me 0.5 BTC at the current price"  
- "Buy me 1.2 ETH when it goes below 1345.50 USDT"  
- "Sell 100 XRP when the price rises above 0.75 USDT"  

This will make sure I set up the right trade plan for you.  
      `;
    }
    const oldChats = getLatest3Interactions(user.id, sessionId)

    const prompt = `
    You're a helpful and friendly trading assistant.
    
    The user context and request are provided below in structured data:
    
    ---
    **User Input Context (stringified JSON)**
    \`\`\`json
    {
      "user": {
        "name": "${context.user.fullname.firstname}",
        "balance": "${context.user.balance.toFixed(2)}",
        "riskProfile": "${context.riskProfile}",
        "preferredCurrency": "USDT"
      },
      "portfolio": {
        "totalInvestment": "${context.portfolio.totalInvestment.toFixed(2)}",
        "currentValue": "${context.portfolio.currentValue.toFixed(2)}",
        "profitLoss": "${context.portfolio.totalProfitLoss.toFixed(2)}",
        "profitLossPercentage": "${context.portfolio.totalProfitLossPercentage.toFixed(2)}"
      },
      "tradeRequest": {
        "action": "${entities.action}",
        "symbol": "${entities.symbol}",
        "amount": "${entities.amount}",
        "price": "${context.currentPrice}",
        "classification": "${tradeClassification}",
        "rawInput": "${input}"
      },
      "market": {
        "asset": "${context.assetName}",
        "sentiment": "${context.marketSentiment.replace(/_/g, ' ')}"
      },
      "memory": {
        "oldInteractions": ${JSON.stringify(oldChats, null, 2)}
      }
    }
    \`\`\`
    ---
    
    ***Instructions for LLM (your task):***
    
    1. Clearly confirm the user’s intention to **${entities.action} ${entities.amount} ${entities.symbol}** at **$${context.currentPrice}**.  
    2. If the trade value is more than 30% of their balance ($${context.user.balance.toFixed(2)}), suggest reducing the amount.  
    3. If the user's risk profile is "moderate" or "conservative", remind them not to overexpose on a single asset.  
    4. If marketSentiment is **EXTREMELY_BULLISH**, explain that the market looks promising but may still carry short-term volatility. Offer a friendly reminder to stay cautious.  
    5. Mention if the user is already running at a **portfolio loss** gently (they're currently at ${context.portfolio.totalProfitLossPercentage.toFixed(2)}% loss).  
    6. Keep your tone friendly, positive, and supportive.  
    7. Always use $ or USDT as currency.  
    8. Always look for **old memory** to understand previous context.  
    9. Entire response must be in **Markdown**.  
    10. Output must be in a **single string** (no raw line breaks outside Markdown).  
    11. Use **headers (##)**, **bold/italic**, bullet points, or definition style.  
    12. Avoid '<br>' or HTML tags.  
    13. You can use JSON snippets or template literals inside Markdown if useful.  
    14. Do not use #, ##, ### for headings — instead use ***content*** style. 
    15. **Visual Content Handling** 
      **CRITICAL:** If you find any of these in the provided data, include them in your response:
    - **Image URLs** (ending in .jpg, .jpeg, .png, .gif, .webp, .svg)
    - **Chart/Graph Links** 
    - **Sparkline SVG URLs**
    - **Trading Chart Images**
    - **Cryptocurrency logos/icons**
    Exapmple: ![BTC Logo](https://logo-url.com/btc.png)
    16. End your message with something like:  
       ➤ *"Would you like me to go ahead and place this order, or would you prefer to adjust the amount or explore other assets?"*  
    
    ---
    ✨ Format your reply like a conversation — not code or JSON. Be personal and respectful.
    `;
    

    const result = await model.invoke(prompt);
    return result.content;
  }

};

module.exports = { generateAIResponse };
