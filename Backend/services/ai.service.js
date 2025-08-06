
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const portfolioServices = require('../services/portfolio.service');
const tradeServices = require('../services/trade.service');

const getStockQuote = require("../getStockQuote");

const memoryStore = new Map(); // { userId: [ { role, content } ] }

module.exports.saveMessageToMemory = (userId, role, content) => {
    if (!memoryStore.has(userId)) memoryStore.set(userId, []);
    memoryStore.get(userId).push({ role, content });
};

module.exports.getRecentMemory = (userId, lastN = 5) => {
    const history = memoryStore.get(userId) || [];
    return history.slice(-lastN);
};
const formatChatHistory = (history) => {
    return history.map(msg => `${msg.role === 'user' ? '👤' : '🤖'}: ${msg.content}`).join('\n');
};

const getRecentMemory = (userId, lastN = 5) => {
    const history = memoryStore.get(userId) || [];
    return history.slice(-lastN);
};

function rateUserRiskProfile(data) {
    const {
        totalTrades,
        totalInvested,
        totalProfitLoss,
        profitLossPercentage,
        averageTradeSize,
        largestGain,
        largestLoss,
        mostTradedAssets
    } = data;

    let riskScore = 0;

    // 1. Trading frequency (0-3 points)
    if (totalTrades >= 100) riskScore += 3;
    else if (totalTrades >= 50) riskScore += 2;
    else if (totalTrades >= 20) riskScore += 1;
    // else 0 points for < 20 trades

    // 2. Position sizing relative to total invested (0-3 points)
    const avgPositionPercent = (averageTradeSize / totalInvested) * 100;
    if (avgPositionPercent >= 10) riskScore += 3;
    else if (avgPositionPercent >= 5) riskScore += 2;
    else if (avgPositionPercent >= 2) riskScore += 1;
    // else 0 points for < 2%

    // 3. Loss tolerance (0-3 points)
    const maxLossPercent = Math.abs(largestLoss / totalInvested) * 100;
    if (maxLossPercent >= 15) riskScore += 3;
    else if (maxLossPercent >= 8) riskScore += 2;
    else if (maxLossPercent >= 3) riskScore += 1;
    // else 0 points for < 3%

    // 4. P&L volatility (0-3 points)
    if (Math.abs(profitLossPercentage) >= 30) riskScore += 3; // High volatility
    else if (Math.abs(profitLossPercentage) >= 15) riskScore += 2;
    else if (Math.abs(profitLossPercentage) >= 5) riskScore += 1;
    // else 0 points for < 5%

    // 5. Diversification (0-1 point, inverted - less diversification = more risk)
    const assetCount = mostTradedAssets ? mostTradedAssets.length : 1;
    if (assetCount <= 3) riskScore += 1; // Concentrated = higher risk
    // else 0 points for > 3 assets

    // Total score: 0-13 points
    // Convert to risk levels
    if (riskScore >= 9) return "high";      // 9-13 points
    if (riskScore >= 4) return "moderate";  // 4-8 points
    return "low";                           // 0-3 points
}

function analyzeSentiment(upPercentage, downPercentage) {
    if (upPercentage < 0 || upPercentage > 100 || downPercentage < 0 || downPercentage > 100) {
        throw new Error('Percentages must be between 0 and 100');
    }

    const sentimentScore = upPercentage;
    let level;
    if (sentimentScore >= 75) {
        level = "EXTREMELY_BULLISH";

    }
    else if (sentimentScore >= 60) {
        level = "BULLISH";
    }
    else if (sentimentScore >= 40) {
        level = "NEUTRAL";
    }
    else {
        level = "BEARISH";
    }

    return level
}
const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "gemini-2.5-flash",
});

module.exports.extractTradingEntities = async (input) => {
    const extractionPrompt = `
  You are a trading command parser. Extract the following entities from user input:
  - action: buy or sell
  - symbol: trading pair or crypto name
  - amount: quantity in number
  - condition: any price condition or threshold
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
    "condition": "price < 40000",
    "orderType": "conditional"
  }
  
  
  User Input: "${input}"
  `;


    const result = await model.invoke(extractionPrompt)

    try {
        const cleaned = result.content.replace(/```json|```/g, '').trim();
        const jsonObject = JSON.parse(cleaned);


        return jsonObject;
    } catch (err) {
        console.error("⚠️ Could not parse response as JSON:", result.content);
        throw new Error("Invalid response format");
    }
};
module.exports.classifyInput = async ({ userInput, userId }) => {
    const memory = getRecentMemory(userId) || [];

    const previousAiRes = memory?.find(item => item.role === 'ai')?.content.reply || ''
    const previousUser = memory?.find(item => item.role === 'user')?.content.message || ''



    // console.log(memory)
    const classificationPrompt = `


  Classify the user fresh input + old Conversation into one of these categories based on a trading app rather say out of context :
  - TRADING
  - PORTFOLIO
  - MARKET_ANALYSIS
  - EDUCATION
  - GENERAL_CHAT
  
  
  old conversation: User Said :${previousUser} and you said :${previousAiRes} 
 Fresh User Input: "${userInput}",

  🔁 Instructions:
  - Always read recent conversation before response if coversation available.
  - just the category name or out of context .
  `;

    const result = await model.invoke(classificationPrompt);
    console.log(result)
    return result.content.trim();  // e.g. "TRADING"
};

async function getMarketSentiment(symbol) {
    const id = await tradeServices.getSuggestion(symbol)

    const coin = await tradeServices.getCoinData(id.coingeckoId)

    const Sentiment = analyzeSentiment(coin.sentiment_votes_up_percentage, coin.sentiment_votes_down_percentage)
    return { Sentiment, assetName: id.coingeckoId }
}

async function getRiskProfile(userId) {
    const stats = await tradeServices.getMyTradingStats(userId);
    return rateUserRiskProfile(stats)
}
module.exports.enrichTradingContext = async (entities, user) => {

    let sentimentWithName = await getMarketSentiment(entities.symbol)
    const { Sentiment, assetName } = sentimentWithName;
    const context = {
        user: user,
        portfolio: await portfolioServices.findPortfolio(user.id),
        currentPrice: await getStockQuote(entities.symbol),
        marketSentiment: Sentiment,
        userHistory: await tradeServices.getTradingHistory(user.id, entities.symbol),
        riskProfile: await getRiskProfile(user.id),
        assetName: assetName

    };

    return context;
};




module.exports.assessRisk = ({ entities, context }) => {
    const { amount } = entities;
    const { balance } = context.user;
    const { currentPrice } = context;
    const riskProfile = context.riskProfile;

    const requiredUSDT = amount * currentPrice;
    const positionSizePercent = (requiredUSDT / balance) * 100;

    let riskLevel = "LOW";
    if (positionSizePercent > 50) riskLevel = "HIGH";
    else if (positionSizePercent > 25) riskLevel = "MODERATE";

    const warnings = [];

    if (riskProfile === "moderate" && riskLevel === "HIGH") {
        warnings.push("Position size exceeds your risk tolerance.");
    }

    return {
        requiredUSDT,
        positionSizePercent,
        riskLevel,
        warnings
    };
};


module.exports.generateAIResponse = async (payload) => {
    const { entities, context, riskAssessment } = payload;
    const prompt = `
  You are a trading assistant. Based on the user's input and risk profile, generate a helpful, honest, and friendly response.

  Entities:
  - Action: ${entities.action}
  - Symbol: ${entities.symbol}
  - Amount: ${entities.amount}
  - Order Type: ${entities.orderType}
  - Condition: ${entities.condition || "None"}
  
  Context:
  - Current Price: $${context.currentPrice}
  - User Balance: $${context.user.balance}
  - User Risk Profile: ${context.riskProfile}
  - Market Sentiment: ${context.marketSentiment}
  
  Risk Assessment:
  - Required USDT: $${riskAssessment.requiredUSDT}
  - Position Size: ${riskAssessment.positionSizePercent.toFixed(1)}%
  - Risk Level: ${riskAssessment.riskLevel}
  - Warnings: ${riskAssessment.warnings.join("; ") || "None"}
  
  🔁 Instructions:
  - Warn about any risk if HIGH.
  - If position is large, suggest smaller amount.
  - Keep it clear and friendly.
  -  Always Ask user if they want to confirm the trade [include "confirm" work]  .

  
 User Name is ${context.user.fullname.firstname} Respond as if you’re chatting directly with the user .
  `;

    const response = await model.invoke(prompt);
    return response.content.trim();
};
module.exports.generateAIResponseWithMemory = async (payload) => {
    const { entities, context, riskAssessment, userId } = payload;

    const memory = formatChatHistory(getRecentMemory(userId));

    const prompt = `
You are an AI trading assistant.
Here's the recent conversation:
${memory}

The user now asked to buy or sell ${entities.amount} ${entities.symbol} under ${entities.condition}.

Context:
- Current price: $${context.currentPrice}
- Balance: $${context.user.balance}
- Risk: ${riskAssessment.riskLevel}, Position Size: ${riskAssessment.positionSizePercent.toFixed(1)}%

Respond with:
- Acknowledge current request
- Mention past related trades if found in memory
- Ask if user confirms the trade use confirm word if user can afford

Respond naturally.
`;

    const response = await model.invoke(prompt);
    return response.content.trim();
};
module.exports.isConfirmed = (userReply) => {
    const yesWords = ["yes", "confirm", "place it", "go ahead", "do it"];
    return yesWords.some(word => userReply.toLowerCase().includes(word));
};
let executedTrades = []; // In-memory store
let monitoringIntervalId = null; // Store interval ID globally

module.exports.executeTrade = async ({ userId, entities, context }) => {
    const trade = {
        id: "tx_" + Date.now(),
        userId,
        action: entities.action,
        symbol: entities.symbol,
        amount: entities.amount,
        condition: entities.condition || null,
        orderType: entities.orderType,
        currentPrice: context.currentPrice,
        timestamp: new Date().toISOString(),
        assetName:context.assetName
    };

    executedTrades.push(trade);
    return trade;
};
module.exports.formatTradeConfirmation = (trade) => {
    return `
  ✅ Trade Executed!
  🔹 ID: ${trade.id}
  🔹 Action: ${trade.action.toUpperCase()} ${trade.amount} ${trade.symbol}
  🔹 Type: ${trade.orderType}
  🔹 Condition: ${trade.condition || "None"}
  📅 Time: ${new Date(trade.timestamp).toLocaleString()}
  `;
};


module.exports.startTradeMonitoring = (getStockQuote, intervalMinutes = 5) => {
    console.log(`Starting trade monitoring every ${intervalMinutes} minutes...`);

    const intervalMs = intervalMinutes * 60 * 1000;

    monitoringIntervalId = setInterval(async () => {
        try {
            await module.exports.checkAndExecuteTrades(getStockQuote);
        } catch (error) {
            console.error('Error in trade monitoring:', error);
        }
    }, intervalMs);

    return monitoringIntervalId;
};

module.exports.checkAndExecuteTrades = async (getStockQuote) => {
    console.log(`Checking ${executedTrades.length} pending conditional trades...`);

    const tradesToRemove = [];

    for (const trade of executedTrades) {
        try {
            const currentPrice = await getStockQuote(trade.symbol);

            if (currentPrice === null || currentPrice === undefined) {
                console.warn(`Could not get price for ${trade.symbol}, skipping...`);
                continue;
            }

            console.log(`${trade.symbol}: Current price $${currentPrice}, Condition: ${trade.condition}`);

            if (evaluateCondition(trade.condition, currentPrice)) {
                console.log(`🎯 Condition met for trade ${trade.id}!`);

                trade.currentPrice = currentPrice;
                trade.executedAt = new Date().toISOString();

                if (trade.action.toLowerCase() === 'buy') {
                    await executeBuyAsset(trade);
                } else if (trade.action.toLowerCase() === 'sell') {
                    console.log(`Executing sell for trade ${trade.id}`);
                }

                tradesToRemove.push(trade.id);

            } else {
                console.log(`⏳ Condition not met for trade ${trade.id}`);
            }

        } catch (error) {
            console.error(`Error processing trade ${trade.id}:`, error);
        }
    }

    // Remove executed trades
    tradesToRemove.forEach(tradeId => removeFromMonitoring(tradeId));

    console.log(`Completed checking trades. ${tradesToRemove.length} trades executed.`);

    // ✅ Stop monitoring if no trades left
    if (executedTrades.length === 0 && monitoringIntervalId) {
        clearInterval(monitoringIntervalId);
        monitoringIntervalId = null;
        console.log('✅ All trades executed. Monitoring stopped automatically.');
    }
};
module.exports.isMonitoringActive = () => {
    return monitoringIntervalId !== null;
};


const executeBuyAsset = async (trade) => {
    try {
        // Assuming you have a buyAsset function or API endpoint
        const buyData = {
            symbol: trade.symbol,
            assetName: trade.assetName, // You might want to get the full name
            quantity: trade.amount,
            price: trade.currentPrice,
            notes: `Conditional trade executed: ${trade.condition}`,
            userId: trade.userId
        };

        // Call your buy asset function here
        const result = await tradeServices.buyAssets(buyData);
        console.log(`Executing buy asset for trade ${trade.id}:`, buyData);

        return result;
    } catch (error) {
        console.error(`Error executing buy asset for trade ${trade.id}:`, error);
        throw error;
    }
};


// Function to add a conditional trade to monitoring
module.exports.addConditionalTrade = (trade) => {
    if (trade.condition) {
        pendingTrades.push(trade);
        console.log(`Added conditional trade to monitoring: ${trade.id}`);
    }
};

// Function to remove a trade from monitoring
const removeFromMonitoring = (tradeId) => {
    const index = executedTrades.findIndex(trade => trade.id === tradeId);
    if (index > -1) {
        executedTrades.splice(index, 1);
        console.log(`Removed trade ${tradeId} from monitoring`);
    }
};

// Function to parse and evaluate price conditions
const evaluateCondition = (condition, currentPrice) => {
    if (!condition || !currentPrice) return false;

    // Expected format: "price > 150" or "price < 100" or "price >= 200" etc.
    const conditionStr = condition.toLowerCase().replace(/\s+/g, ' ').trim();

    // Extract operator and target price using regex
    const match = conditionStr.match(/price\s*(>=|<=|>|<|=|==)\s*(\d+\.?\d*)/);

    if (!match) {
        console.warn(`Invalid condition format: ${condition}`);
        return false;
    }

    const operator = match[1];
    const targetPrice = parseFloat(match[2]);

    switch (operator) {
        case '>':
            return currentPrice > targetPrice;
        case '<':
            return currentPrice < targetPrice;
        case '>=':
            return currentPrice >= targetPrice;
        case '<=':
            return currentPrice <= targetPrice;
        case '=':
        case '==':
            return Math.abs(currentPrice - targetPrice) < 0.01; // Allow small floating point differences
        default:
            return false;
    }
};


// Function to stop monitoring
module.exports.stopTradeMonitoring = (intervalId) => {
    if (intervalId) {
        clearInterval(intervalId);
        console.log('Trade monitoring stopped');
    }
};

// Function to get all pending trades
module.exports.getPendingTrades = () => {
    return [...executedTrades]; // Return a copy
};

// Function to manually remove a pending trade
module.exports.cancelConditionalTrade = (tradeId) => {
    removeFromMonitoring(tradeId);
    return `Trade ${tradeId} cancelled and removed from monitoring`;
};

