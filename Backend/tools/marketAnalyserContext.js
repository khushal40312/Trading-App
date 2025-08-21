const { getCoinMarkets } = require("../services/ai.service");


const marketAnalyserContext = {
    name: "marketAnalyserContext",
    description: "Extract market context",

    func: async ({ user, marketClassification }) => {
        try {
            if (
                marketClassification.intent === "price_analysis" &&
                marketClassification.requiredData.timeframes !== "1M"
            ) {
                // map array of symbols to lowercase & join with commas
                const symbols = (marketClassification.requiredData.symbols || [])
                    .map(sym => sym.toLowerCase())
                    .join(",");

                if (!symbols) {
                    throw new Error("No symbols provided for market analysis");
                }

                const data = await getCoinMarkets({
                    vs_currency: "usd",
                    symbols: symbols, // dynamic from context
                    price_change_percentage: "1h,24h,7d,30d",
                    sparkline: true
                });

                return data;
            }

            return { message: "No market data requested for this context." };
        } catch (error) {
            console.log("ERROR DURING CONTEXT MAKING ", error.message);
            return {
                error: error.message
            };
        }
    }
};

module.exports = { marketAnalyserContext };
