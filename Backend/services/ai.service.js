const pendingTradesModel = require('../models/pendingTrades.model')
const getStockQuote = require("../getStockQuote");
const redisClient = require("../config/redisClient");
const { memoryTool } = require("../tools/memoryTool");
const portfolioModel = require("../models/portfolio.model")
const tradeModel = require('../models/Trade.model');
const { getPendingTradesFromDB, executeBuyAsset, executeSellAsset } = require("../utils/aiServicesFunc");

let executedTrades = []; // In-memory store
let monitoringIntervalId = null; // Store interval ID globally



// initializeMonitoring on Server Restart
async function initializeMonitoring(getStockQuote, intervalSeconds = 10) {
    try {
        const pendingTrades = await getPendingTradesFromDB();

        if (pendingTrades.length === 0) {
            console.log("No pending trades found. Monitoring will not start.");
            return;
        }

        // Map DB "price" field → memory "currentPrice"
        executedTrades = pendingTrades.map(trade => ({
            ...trade.toObject(),         // convert mongoose doc to plain object
            currentPrice: trade.price,   // overwrite with currentPrice field
        }));

        console.log(`Loaded ${executedTrades.length} pending trades into memory.`);

        // Start monitoring since we have trades
        startTradeMonitoring(getStockQuote, intervalSeconds);

    } catch (err) {
        console.error("Error initializing trade monitoring:", err);
    }
}

//execute Trade according to conditions and add into Execute trade for monitoring
const executeTrade = async ({ finalJson, oldMemory, sessionId }) => {
    const { action, symbol, amount, condition, assetName, userId, orderType, riskProfile } = finalJson;

    const currentPrice = await getStockQuote(symbol);

    if (condition === 'currentPrice' || condition === 'context.currentPrice') {
        const pending = await pendingTradesModel.create({
            userId, action, symbol, amount, condition,
            orderType, price: currentPrice, assetName, riskProfile,
            status: "CONFIRMED"
        });
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
// Provide a Temp bill to user 
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
// Start monitoring
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
//Check and Execute trades if there condition met with circumstances
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
                   const executedTrade= await executeBuyAsset(trade);
                    const order = await pendingTradesModel.findByIdAndUpdate(
                        trade.id,
                        { status: "CONFIRMED" },
                        { new: true }
                    );
                    notificationWSS.sendNotification(executedTrade.user, {
                        message: `Executed Trade ${executedTrade.trade.quantity} ${executedTrade.trade.symbol} Price ${executedTrade.trade.price} fees ${executedTrade.trade.fees} `,
                        _id: order._id,
                    })

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
//to check monitoring status
const isMonitoringActive = () => {
    return monitoringIntervalId !== null;
};

// Function to remove a trade from monitoring
const removeFromMonitoring = (tradeId) => {
    const index = executedTrades.findIndex(trade => String(trade._id) === String(tradeId));
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
//Functions for getting and adding recent data from redis to LLM memory context and vice versa  
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
        await redisClient.setEx(`session:data:${userId}:${sessionId}`, 900, JSON.stringify(sessionData));
        console.log(`Session stored in Redis: session:${userId}:${sessionId}`);
    } catch (error) {
        console.error('Failed to store session in Redis:', error);
    }
};
const storeSessionStructureInRedis = async (structure, userId, sessionId) => {
    try {

        let ab = await redisClient.setEx(`session:data:${userId}:${sessionId}`, 900, JSON.stringify(structure));
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

module.exports = {removeFromMonitoring, initializeMonitoring,  storeSessionStructureInRedis, findPortfolio, appendPendingTrade, appendInteraction, storeSessionInRedis, executeTrade, isMonitoringActive, startTradeMonitoring, getLatest3Interactions, getLatest3Trades, getLatest2TradesandInteractions, getLast5Trades, getLast5PendingTrades }



