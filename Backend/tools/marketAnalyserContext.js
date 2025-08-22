const { getCoinMarkets } = require("../services/ai.service");
const { fetchOHLC } = require("../services/fetchOHLC"); // make sure you exported it

const marketAnalyserContext = {
    name: "marketAnalyserContext",
    description: "Extract market context",

    func: async ({ user, marketClassification }) => {
        try {
            const symbolsArr = (marketClassification.requiredData.symbols || [])
                .map(sym => sym.toLowerCase());

            if (!symbolsArr.length) {
                throw new Error("No symbols provided for market analysis");
            }

            // Join symbols for CoinGecko getCoinMarkets
            const symbols = symbolsArr.join(",");

            // CASE 1: Non-1M timeframe → just getCoinMarkets
            if (marketClassification.intent === "price_analysis" &&
                marketClassification.requiredData.timeframes !== "30" || marketClassification.requiredData.timeframes !== "90" || marketClassification.requiredData.timeframes !== "180" || marketClassification.requiredData.timeframes !== "365") {

                const data = await getCoinMarkets({
                    vs_currency: "usd",
                    symbols,
                    price_change_percentage: "1h,24h,7d,30d",
                    sparkline: true
                });

                return { type: "market_data", data };
            }

       
            if (marketClassification.intent === "price_analysis" &&
                marketClassification.requiredData.timeframes == "30" || marketClassification.requiredData.timeframes == "90" || marketClassification.requiredData.timeframes == "180" || marketClassification.requiredData.timeframes == "365") {

                const marketData = await getCoinMarkets({
                    vs_currency: "usd",
                    symbols,
                    price_change_percentage: "30d",
                    sparkline: false
                });

                let ohlcResults = {};

                // If more than one symbol → loop and fetch OHLC one by one
                for (const sym of symbolsArr) {
                    try {
                        const ohlc = await fetchOHLC(sym, "usd", Number(marketClassification.requiredData.timeframes));
                        ohlcResults[sym] = ohlc;
                    } catch (err) {
                        console.error(`Failed to fetch OHLC for ${sym}:`, err.message);
                        ohlcResults[sym] = { error: err.message };
                    }
                }

                return {
                    type: "market_with_ohlc",
                    marketData,
                    ohlcData: ohlcResults
                };
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
