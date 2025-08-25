const getStockQuote = require("../getStockQuote");
const { executeTrade, isMonitoringActive, startTradeMonitoring } = require("../services/ai.service");

const tradeExecutionTool = {
    name: "tradeExecutionTool",
    description: "execute Trade or add them for monitoring",

    func: async ({ finalJson ,sessionId}) => {
        try {
            if (finalJson.jsonObject.condition == 'currentPrice' || finalJson.jsonObject.condition == 'context.currentPrice') {
                const response = await executeTrade({ finalJson: finalJson.jsonObject, oldMemory: finalJson.oldMemory,sessionId })
                return response
            } else {
                let monitoringStatus = isMonitoringActive()
                if (monitoringStatus) {

                    const response = await executeTrade({ finalJson: finalJson.jsonObject, oldMemory: finalJson.oldMemory,sessionId })
                    return response;

                } else if (!monitoringStatus) {

                    const response = await executeTrade({ finalJson: finalJson.jsonObject, oldMemory: finalJson.oldMemory,sessionId })
                    startTradeMonitoring(getStockQuote, 10)
                    return response;

                }


            }
        } catch (err) {
            console.error("Error during executeTrade ", err.message);
            return "error During Trade Execution";
        }
    }
};

module.exports = { tradeExecutionTool };
