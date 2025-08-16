const { model } = require("../aiModel/gemini");
const {
  getLast5PendingTrades,
  getLatest3Trades,
  getLast5Trades,
  findPortfolio
} = require("../services/ai.service");
const tradeServices = require('../services/trade.service')

const unifiedTradeAssistant = {
  name: "unifiedTradeAssistant",
  description: "Comprehensive trade assistant that handles all trading queries using complete user data",
  func: async ({ input, user, sessionId }) => {
    try {
      // Fetch all relevant data
      const [
        pendingTrades,
        waitingForConfirmation,
        executedTrades,
        userPortfolio,
        userStats
      ] = await Promise.all([
        getLast5PendingTrades(user.id),//pending
        getLatest3Trades(user.id, sessionId),//cached
        getLast5Trades(user.id),// executed
        findPortfolio(user.id),
        tradeServices.getMyTradingStats(user.id)

      ]);

      const Prompt = `
      You are a **professional trading assistant** with full access to the user's trading data.  
      Your job is to deliver **precise, contextual, and relevant answers** to the user’s query.  
      Never add information the user did not ask for. Always prioritize their input first.  
      
      ---
      
      ## USER INFORMATION
      - Name: ${user.fullname.firstname || 'Not provided'}
      - User ID: ${user.id}
      - Session ID: ${sessionId}
      
      ## TRADING DATA
      1. **Pending Trades (awaiting execution):**  
      ${pendingTrades.length > 0 ? JSON.stringify(pendingTrades, null, 2) : "No pending trades."}
      
      2. **Waiting for Confirmation (mentioned but not confirmed):**  
      ${waitingForConfirmation.length > 0 ? JSON.stringify(waitingForConfirmation, null, 2) : "No trades waiting for confirmation."}
      
      3. **Executed Trades (last 5):**  
      ${executedTrades.length > 0 ? JSON.stringify(executedTrades, null, 2) : "No recent executed trades found."}
      
      4. **Portfolio (current holdings):**  
      ${userPortfolio ? JSON.stringify(userPortfolio, null, 2) : "Portfolio information not available."}
      
      5. **User Statistics:**  
      ${userStats ? JSON.stringify(userStats, null, 2) : "User statistics not available."}
      
      ---
      
      ## USER INPUT
      "${input}"
      
      ---
      
      ## RESPONSE RULES
      
      1. **Direct Answer First:**  
         - Always address the user’s exact question before providing context.  
         - Examples:  
           • If asking about portfolio → show only portfolio details.  
           • If asking about pending trades → show pending/waiting trades only.  
           • If asking about performance → use stats + recent trades.  
           • If asking about personal info (non-trading) → use user info only.  
      
      2. **Relevant Context Only:**  
         - Include supporting data only if directly useful.  
         - Do not include unrelated sections unless user explicitly asks for “everything.”  
      
      3. **Clarity & Structure:**  
         - Use concise, well-structured sentences.  
         - Organize with **headers (##)** and **bullets (• or -)**.  
         - Keep detail proportional to the question.  
      
      4. **Tone:**  
         - Professional yet conversational.  
         - Supportive if user faces losses, encouraging if profitable.  
         - For financial insights: stick to factual, focused analysis.  
         - Use emojis 🎯📈📉 when fitting.  
      
      5. **Special Cases:**  
         - If no data → state clearly (e.g., “No pending trades found”).  
         - If conflicting info → mention briefly.  
         - If personal/non-trading input → reply accordingly, without trade data.  
      
      6. **Output Format:**  
         - Entire response must be in **Markdown**.  
         - Output must be in a **single string** (no raw line breaks outside Markdown).  
         - Use **headers (##)**, **bold/italic**, bullet points, or definition style.  
         - Avoid '<br>' or HTML tags.  
         - Can use JSON snippets or template literals inside Markdown if useful.  
         - Always end with a gentle prompt: *“Is there anything else you’d like to know?”*  
         -Dont use # ## ## for Heading use ***content***.
      
      ---
      
      ## EXAMPLE RESPONSE
      
      ***Your Portfolio Insights 📈***  
      
      Here’s an overview of your current portfolio, Khushal:  
      
      ***Portfolio Summary***  
      
      **Chainbase (C)**  
      • **Quantity**: 10 tokens  
      • **Average Buy Price**: $0.3677  
      • **Current Price**: $0.2233  
      • **Current Value**: $2.23  
      • **Profit/Loss**: **-$1.44 (-39.28%)** 📉  
      
      ---
      
      *Is there anything else you’d like to know about your portfolio or trading activity?*  
      ---
      `;
      


      const result = await model.invoke(Prompt);
      console.log(result.content)
      return result.content;

    } catch (error) {
      console.error('Error in unifiedTradeAssistant:', error);

      // Fallback response
      const fallbackPrompt = `
The user asked: "${input}"

There was an error retrieving complete trading data. Please provide a helpful response explaining that there was a technical issue accessing their trading information and suggest they:
1. Try again in a moment
2. Check their trading platform directly
3. Contact support if the issue persists
4.Always reply in single string 
Be apologetic but professional, and offer to help with any general trading questions they might have. 
            `;

      const result = await model.invoke(fallbackPrompt);
      return result.content;
    }
  }
};

module.exports = { unifiedTradeAssistant };