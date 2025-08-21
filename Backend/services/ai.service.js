
const tradeServices = require('../services/trade.service');
const { v4: uuidv4 } = require('uuid');
const pendingTradesModel = require('../models/pendingTrades.model')
const getStockQuote = require("../getStockQuote");
const redisClient = require("../config/redisClient");
const { memoryTool } = require("../tools/memoryTool");
const portfolioModel = require("../models/portfolio.model")
const tradeModel = require('../models/Trade.model')
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



let executedTrades = []; // In-memory store
let monitoringIntervalId = null; // Store interval ID globally


const executeTrade = async ({ finalJson, oldMemory, sessionId }) => {
    const { action, symbol, amount, condition, assetName, userId, orderType, riskProfile } = finalJson;

    const currentPrice = await getStockQuote(symbol);

    if (condition === 'currentPrice' || condition === 'context.currentPrice') {
        const pending = await pendingTradesModel.create({
            userId, action, symbol, amount, condition,
            orderType, price: currentPrice, assetName, riskProfile,
            status: "CONFIRMED"
        });
        console.log("pendingID", pending.id)
        const tradeData = {
            id: pending.id,
            symbol,
            assetName,
            quantity: amount,
            price: currentPrice,
            notes: `Trade executed: ${condition}`,
            userId
        };

        const data = (action === 'buy')
            ? await executeBuyAsset(tradeData)
            : await executeSellAsset(tradeData);

        const receipt = {
            trade: {
                id: data.trade.id || 'N/A',
                tradeType: action,
                price: currentPrice,
                symbol,
                orderType,
                executedAt: new Date(),
                amount
            },
            orderType
        };

        const format = formatTradeConfirmation(receipt, condition);
        await memoryTool.func({ Conversations: { oldMemory, format }, userId, dataType: 'TRADING' });
        const sessionData = {
            pendingTrades: [
            ],
            interaction: [

            ]
        };
        await redisClient.setEx(`session:data:${userId}:${sessionId}`, 900, JSON.stringify(sessionData));

        return { reply: format }
    } else {
        // Pending conditional trade
        const pending = await pendingTradesModel.create({
            userId, action, symbol, amount, condition,
            orderType, price: currentPrice, assetName, riskProfile,
            status: "PENDING"
        });

        const trade = {
            id: pending.id,
            userId,
            action,
            symbol,
            amount,
            condition,
            orderType,
            currentPrice,
            timestamp: pending.createdAt,
            assetName
        };

        executedTrades.push(trade);

        const receipt = {
            trade: {
                id: pending.id,
                tradeType: action,
                price: currentPrice,
                symbol,
                orderType,
                executedAt: pending.createdAt,
                amount
            },
            orderType
        };

        const format = formatTradeConfirmation(receipt, condition);
        await memoryTool.func({ Conversations: { oldMemory, format }, userId, dataType: 'TRADING' });
        const sessionData = {
            pendingTrades: [
            ],
            interaction: [

            ]
        };
        await redisClient.setEx(`session:data:${userId}:${sessionId}`, 900, JSON.stringify(sessionData));

        return { reply: format }
    }
};

// const monitoringInterval = startTradeMonitoring(getStockQuote, 1);

const formatTradeConfirmation = (trade, condition) => {
    return `
  ✅ Trade Executed!
  🔹 ID: ${trade.trade.id}
  🔹 Action: ${trade.trade.tradeType.toUpperCase()} At ${trade.trade.price} , ${trade.trade.amount}  ${trade.trade.symbol}
  🔹 Type: ${trade.orderType}
  🔹 Condition: ${condition || "None"}
  📅 Time: ${trade.trade.executedAt.toString()}
  `;
};


const startTradeMonitoring = (getStockQuote, intervalMinutes = 10) => {
    console.log(`Starting trade monitoring every ${intervalMinutes} seconds...`);

    const intervalMs = intervalMinutes * 1000;

    monitoringIntervalId = setInterval(async () => {
        try {
            await checkAndExecuteTrades(getStockQuote);
        } catch (error) {
            console.error('Error in trade monitoring:', error);
        }
    }, intervalMs);

    return monitoringIntervalId;
};

const checkAndExecuteTrades = async (getStockQuote) => {
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
                    await pendingTradesModel.findByIdAndUpdate(
                        trade.id,
                        { status: "CONFIRMED" },
                        { new: true }
                    );

                } else if (trade.action.toLowerCase() === 'sell') {
                    await executeSellAsset(trade);

                    await pendingTradesModel.findByIdAndUpdate(
                        trade.id,
                        { status: "CONFIRMED" },
                        { new: true }
                    );

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

const isMonitoringActive = () => {
    return monitoringIntervalId !== null;
};


const executeBuyAsset = async (trade) => {

    try {
        // Assuming you have a buyAsset function or API endpoint
        const buyData = {
            symbol: trade.symbol,
            assetName: trade.assetName, // You might want to get the full name
            quantity: trade.quantity ? trade.quantity : trade.amount,
            price: trade.price ? trade.price : trade.currentPrice,
            notes: `Conditional trade executed: ${trade.condition}`,
            userId: trade.userId,

        };

        // Call your buy asset function here
        const result = await tradeServices.buyAssets(buyData);
        console.log(`Executing buy asset for trade ${trade.id}:`);

        return result;
    } catch (error) {
        console.error(`Error executing buy asset for trade ${trade.id}:`, error);
        throw error;
    }
};
const executeSellAsset = async (trade) => {
    try {
        // Assuming you have a sell function or API endpoint
        const sellData = {
            symbol: trade.symbol,
            assetName: trade.assetName, // You might want to get the full name
            quantity: trade.quantity ? trade.quantity : trade.amount,
            price: trade.price ? trade.price : trade.currentPrice,
            notes: `Conditional trade executed: ${trade.condition}`,
            userId: trade.userId,

        };

        // Call your buy asset function here
        const result = await tradeServices.sellAssets(sellData);
        console.log(`Executing buy asset for trade ${trade.id}:`);

        return result;
    } catch (error) {
        console.error(`Error executing buy asset for trade ${trade.id}:`, error);
        throw error;
    }
};

// Function to add a conditional trade to monitoring
const addConditionalTrade = (trade) => {
    if (trade.condition) {
        executeTrade.push(trade);
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
const stopTradeMonitoring = (intervalId) => {
    if (intervalId) {
        clearInterval(intervalId);
        console.log('Trade monitoring stopped');
    }
};

// Function to get all pending trades
const getPendingTrades = () => {
    return [...executedTrades]; // Return a copy
};

// Function to manually remove a pending trade
module.exports.cancelConditionalTrade = (tradeId) => {
    removeFromMonitoring(tradeId);
    return `Trade ${tradeId} cancelled and removed from monitoring`;
};

const storeSessionInRedis = async (state) => {
    try {
        const userId = state.user.id;
        const sessionId = state.sessionId;
        const sessionData = {
            pendingTrades: [
                {
                    entities: state.entities,
                    context: state.context,
                    tradeClassification: state.tradeClassification,
                    category: state.category,
                    sessionId,
                    userId: state.user.id,
                    status: "WAITING_FOR_CONFIRMATION",
                    timestamp: new Date().toISOString()
                }],
            interaction: [
                {
                    input: state.input,
                    reply: state.reply,
                    timestamp: new Date().toISOString()
                }
            ]
        };

        // Store in Redis with 15 minutes (900 seconds) expiry
        let ab = await redisClient.setEx(`session:data:${userId}:${sessionId}`, 900, JSON.stringify(sessionData));
        console.log(ab)
        console.log(`Session stored in Redis: session:${userId}:${sessionId}`);
    } catch (error) {
        console.error('Failed to store session in Redis:', error);
    }
};

const storeSessionStructureInRedis = async (structure, userId, sessionId) => {
    try {

        let ab = await redisClient.setEx(`session:data:${userId}:${sessionId}`, 900, JSON.stringify(structure));
        console.log(ab)
        console.log(`Session stored in Redis: session:${userId}:${sessionId}`);

    } catch (error) {
        console.error('Failed to store session in Redis:', error);
    }
};
const appendPendingTrade = async (userId, sessionId, newTrade) => {
    const key = `session:data:${userId}:${sessionId}`;
    let sessionStr = await redisClient.get(key);
    if (!sessionStr) return false;
    let sessionData = JSON.parse(sessionStr);

    // Add the new pending trade
    sessionData.pendingTrades.push({
        ...newTrade,
        timestamp: new Date().toISOString()
    });

    // Save back to Redis with same expiry (need to reset expiry)
    await redisClient.setEx(key, 900, JSON.stringify(sessionData));
    return true;
};
const appendInteraction = async (userId, sessionId, newInteraction) => {
    const key = `session:data:${userId}:${sessionId}`;
    let sessionStr = await redisClient.get(key);
    if (!sessionStr) return false;

    let sessionData = JSON.parse(sessionStr);

    // Add the new interaction
    sessionData.interaction.push({
        ...newInteraction,
        timestamp: new Date().toISOString()
    });

    // Save back
    await redisClient.setEx(key, 900, JSON.stringify(sessionData));
    return true;
};
const getLatest3Interactions = async (userId, sessionId) => {
    const key = `session:data:${userId}:${sessionId}`;
    let sessionStr = await redisClient.get(key);
    if (!sessionStr) return [];

    let sessionData = JSON.parse(sessionStr);

    // Return last 3
    return sessionData.interaction.slice(-3);
};
const getLatest3Trades = async (userId, sessionId) => {
    const key = `session:data:${userId}:${sessionId}`;
    let sessionStr = await redisClient.get(key);
    if (!sessionStr) return [];

    let sessionData = JSON.parse(sessionStr);

    // Return last 3
    return sessionData.pendingTrades.slice(-3);
};
const getLatest2TradesandInteractions = async (userId, sessionId) => {
    const key = `session:data:${userId}:${sessionId}`;
    let sessionStr = await redisClient.get(key);
    if (!sessionStr) return [];

    let sessionData = JSON.parse(sessionStr);

    // Return last 3
    return {
        trades: sessionData.pendingTrades.slice(-2),
        interactions: sessionData.interaction.slice(-3)
    };
};
async function getLast5Trades(userId) {
    try {
        const trades = await tradeModel.find({ user: userId })
            .sort({ createdAt: -1 }) // newest first
            .limit(5)
            .lean(); // return plain JS objects

        return trades;
    } catch (err) {
        console.error("Error fetching trades:", err);
        throw err;
    }
}

async function getLast5PendingTrades(userId) {
    try {
        const trades = await pendingTradesModel.find({
            user: userId,
            status: 'PENDING'
        }).sort({ createdAt: -1 }) // newest first
            .limit(5)
            .lean(); // return plain JS objects

        return trades;
    } catch (err) {
        console.error("Error fetching trades:", err);
        throw err;
    }
}
const findPortfolio = async (userId) => {
    return await portfolioModel
        .findOne({ user: userId })
        .select("-performanceHistory");
};



const axios = require("axios");

async function getCoinMarkets(options = {}) {
    if (!options.vs_currency) {
        throw new Error("vs_currency is required (e.g. 'usd')");
    }

    try {
        const response = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
            headers: { accept: 'application/json', 'x-cg-demo-api-key': process.env.COINGECKO_API_KEY },
            params: {
                vs_currency: options.vs_currency,
                symbols: options.symbols,
                category: options.category,
                sparkline: options.sparkline || false,
                price_change_percentage: options.price_change_percentage,
                locale: options.locale || "en",
                precision: options.precision || "full",
            },
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching market data:", error.response?.data || error.message);
        throw error;
    }
}








module.exports = { getCoinMarkets,storeSessionStructureInRedis, findPortfolio, getRiskProfile, appendPendingTrade, appendInteraction, getMarketSentiment, storeSessionInRedis, executeTrade, isMonitoringActive, startTradeMonitoring, getLatest3Interactions, getLatest3Trades, getLatest2TradesandInteractions, getLast5Trades, getLast5PendingTrades }



