const { model } = require("../aiModel/gemini");


const generateAIResponse = {
  name: "initialResponse",
  description: "Generate Trade Plan",

  func: async ({ context,entities}) => {

    const prompt = `
    You're a helpful and friendly trading assistant.
    
    A user named ${context.user.fullname.firstname} has requested to **${entities.action.toUpperCase()} ${entities.amount} ${entities.symbol}** at the current market price of ₹${context.currentPrice}.
    
    Here are the relevant details:
    
    ---
    
    📊 **User Overview**:
    - Name: ${context.user.fullname.firstname}
    - Current Balance: ₹${context.user.balance.toFixed(2)}
    - Risk Profile: ${context.riskProfile}
    - Preferred Currency: $ USDT
    
    💼 **Portfolio Summary**:
    - Total Invested: ${context.portfolio.totalInvestment.toFixed(2)}
    - Current Value: ${context.portfolio.currentValue.toFixed(2)}
    - Profit/Loss: ${context.portfolio.totalProfitLoss.toFixed(2)} (${context.portfolio.totalProfitLossPercentage.toFixed(2)}%)
    
    📈 **Market Info**:
    - Asset: ${context.assetName}
    - Market Sentiment: ${context.marketSentiment.replace(/_/g, ' ')}
    
    ---
    
    🔁 **Instructions for LLM (your task):**
    
    1. Clearly confirm the user’s intention to **${entities.action} ${entities.amount} ${entities.symbol}** at **₹${context.currentPrice}**.
    2. If the trade value is more than 30% of their balance (₹${context.user.balance.toFixed(2)}), suggest reducing the amount.
    3. If the user's risk profile is "moderate" or "conservative", remind them not to overexpose on a single asset.
    4. If **marketSentiment is EXTREMELY_BULLISH**, explain that the market looks promising but may still carry short-term volatility — offer a friendly reminder to stay cautious.
    5. Mention if the user is already running at a **portfolio loss** gently (they're currently at ${context.portfolio.totalProfitLossPercentage.toFixed(2)}% loss).
    6. Keep your tone friendly, positive, and supportive.
    7. End your message with something like:  
       ➤ *"Would you like me to go ahead and place this order, or would you prefer to adjust the amount or explore other assets?"*
    
    ---
    
    ✨ Format your reply like a conversation — not code or JSON. Be personal and respectful.
    `;
    
  
    const result = await model.invoke(prompt);
   

    return result.content;


  }

};
module.exports = { generateAIResponse }


const sessionId = result.sessionId; 
const userId = result.user._id.toString(); 
const sessionData = {
  input: result.input,
  user: {
    fullname: result.user.fullname,
    settings: result.user.settings,
    _id: result.user._id.toString(), // Convert ObjectId to string
    email: result.user.email,
    balance: result.user.balance,
    role: result.user.role,
    profilePicture: result.user.profilePicture,
    createdAt: result.user.createdAt,
    portfolioId: result.user.portfolioId.toString()
  },
  category: result.category,
  entities: result.entities,
  sessionId: result.sessionId,
  context: {
    ...result.context,
    user: {
      ...result.context.user,
      _id: result.context.user._id.toString(),
      portfolioId: result.context.user.portfolioId.toString()
    },
    portfolio: {
      ...result.context.portfolio,
      _id: result.context.portfolio._id.toString(),
      user: result.context.portfolio.user.toString()
    }
  },
  tradeClassification: result.tradeClassification,
  reply: result.reply,
  timestamp: new Date().toISOString()
};
await redisClient.setEx(
  `session:${userId}:${sessionId}`, 
  900, 
  JSON.stringify(sessionData)
);
await redisClient.setEx(
  `session:active:${userId}:${sessionId}`, 
  900, 
  "1"
);