

const getStockQuote = require('../getStockQuote')
const  {retrieveMemoryTool}  = require("./retriveMemoryTool");
// const { getMarketSentiment, getRiskProfile } = require("../services/ai.service");
const { getMarketSentiment,getRiskProfile } = require('../utils/aiServicesFunc');
const tradeServices = require('../services/trade.service')
const {
    
    findPortfolio
  } = require("../services/ai.service");
const extractTradingContext = {
    name: "extractTradingContext",
    description: "Extract Trading context",

    func: async ({ user, entities }) => {
        try {
            let sentimentWithName = await getMarketSentiment(entities.symbol)
            const { Sentiment, assetName } = sentimentWithName;

            const context = {
                user,
                portfolio: await findPortfolio(user.id),
                currentPrice: await getStockQuote(entities.symbol),
                marketSentiment: Sentiment,
                userHistory: await tradeServices.getTradingHistory(user.id, entities.symbol),
                riskProfile: await getRiskProfile(user.id),
                assetName
            };

            
            return context;

        } catch (error) {
            console.log("ERROR DURING CONTEXT MAKING ", error.message)
            return {
                user,
                portfolio: null,
                currentPrice: null,
                marketSentiment: null,
                userHistory: [],
                riskProfile: null,
                assetName: null,
                error: error.message
            };
        }
    }


};
module.exports = { extractTradingContext }


