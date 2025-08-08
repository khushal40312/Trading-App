const { model } = require("../aiModel/gemini");
const { memoryTool } = require("./memoryTool");
const portfolioServices = require('../services/portfolio.service')
const { getStockQuote } = require('../getStockQuote')
const { retrieveMemoryTool } = require("./retriveMemoryTool");
const { getMarketSentiment, getRiskProfile } = require("../services/ai.service");
const tradeServices = require('../services/trade.service')

const checkPendingTrades = {
    name: "PendingTradeChecker",
    description: "check any Pending trade with status awaiting confirmation",

    func: async ({ input, user,entities }) => {

        
        // let sentimentWithName = await getMarketSentiment(entities.symbol)
        // const { Sentiment, assetName } = sentimentWithName;
        // const context = {
        //     user: user,
        //     portfolio: await portfolioServices.findPortfolio(user.id),
        //     currentPrice: await getStockQuote(entities.symbol),
        //     marketSentiment: Sentiment,
        //     userHistory: await tradeServices.getTradingHistory(user.id, entities.symbol),
        //     riskProfile: await getRiskProfile(user.id),
        //     assetName: assetName

        // };

        return context;



    }

};
module.exports = { extractTradingContext }


