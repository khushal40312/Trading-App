const { getCoinMarkets, getTrendingCoins, getFilteredGlobalMarketData } = require("../services/ai.service");
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

            // CASE 1: under-1M timeframe → just getCoinMarkets
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
                const coinIds = (marketData || [])
                    .map(sym => sym.id.toLowerCase());
                // If more than one symbol → loop and fetch OHLC one by one
                for (const sym of coinIds) {
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
            let includeTechIndicator = marketClassification.requiredData.dataTypes.includes('technical_indicators')

            if (!includeTechIndicator && marketClassification.intent === "trend_analysis" &&
                marketClassification.requiredData.timeframes !== "30" || marketClassification.requiredData.timeframes !== "90" || marketClassification.requiredData.timeframes !== "180" || marketClassification.requiredData.timeframes !== "365") {

                const marketData = await getCoinMarkets({
                    vs_currency: "usd",
                    symbols,
                    price_change_percentage: "1h,24h,7d,30d",
                    sparkline: true
                });
                let dataResults = {};

                const coinIds = (marketData || [])
                    .map(sym => sym.id.toLowerCase());

                for (const sym of coinIds) {
                    try {
                        const data = await fetchCryptoData(sym);

                        dataResults[sym] = data;
                    } catch (err) {
                        console.error(`Failed to fetch OHLC for ${sym}:`, err.message);
                        dataResults[sym] = { error: err.message };
                    }


                }
                return {
                    type: "market_with_indicator",
                    marketData,
                    analysisData: dataResults
                };
            }
            if (!includeTechIndicator && marketClassification.intent === "trend_analysis" &&
                marketClassification.requiredData.timeframes == "30" || marketClassification.requiredData.timeframes == "90" || marketClassification.requiredData.timeframes == "180" || marketClassification.requiredData.timeframes == "365") {

                const marketData = await getCoinMarkets({
                    vs_currency: "usd",
                    symbols,
                    price_change_percentage: "1h,24h,7d,30d",
                    sparkline: false
                });

                let ohlcResults = {};
                const coinIds = (marketData || [])
                    .map(sym => sym.id.toLowerCase());
                // If more than one symbol → loop and fetch OHLC one by one
                for (const sym of coinIds) {
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
            if (includeTechIndicator && marketClassification.intent === "trend_analysis" &&
                marketClassification.requiredData.timeframes !== "30" || marketClassification.requiredData.timeframes !== "90" || marketClassification.requiredData.timeframes !== "180" || marketClassification.requiredData.timeframes !== "365") {

                const marketData = await getCoinMarkets({
                    vs_currency: "usd",
                    symbols,
                    price_change_percentage: "1h,24h,7d,30d",
                    sparkline: true
                });
                let dataResults = {};
                let indicationResults = {};


                const coinIds = (marketData || [])
                    .map(sym => sym.id.toLowerCase());

                for (const sym of coinIds) {
                    try {
                        const data = await fetchCryptoData(sym);
                        const dataForIndicator = await fetchTicker(coinIds);
                        indicationResults[sym] = dataForIndicator;

                        dataResults[sym] = data;
                    } catch (err) {
                        console.error(`Failed to fetch OHLC for ${sym}:`, err.message);
                        dataResults[sym] = { error: err.message };
                    }


                }
                return {
                    type: "market_with_indicator",
                    marketData,
                    analysisData: dataResults,
                    indicationResults: indicationResults
                };
            }
            if (includeTechIndicator && marketClassification.intent === "trend_analysis" &&
                marketClassification.requiredData.timeframes == "30" || marketClassification.requiredData.timeframes == "90" || marketClassification.requiredData.timeframes == "180" || marketClassification.requiredData.timeframes == "365") {

                const marketData = await getCoinMarkets({
                    vs_currency: "usd",
                    symbols,
                    price_change_percentage: "1h",
                    sparkline: false
                });

                let ohlcResults = {};
                let indicationResults = {};

                const coinIds = (marketData || [])
                    .map(sym => sym.id.toLowerCase());
                // If more than one symbol → loop and fetch OHLC one by one
                for (const sym of coinIds) {
                    try {
                        const dataForIndicator = await fetchTicker(coinIds);
                        indicationResults[sym] = dataForIndicator;
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
                    ohlcData: ohlcResults,
                    indicationResults: indicationResults

                };
            }
            if (marketClassification.intent === "market_research") {

                const coinData = await getTrendingCoins()
                const globalData = await getFilteredGlobalMarketData()

                return { type: "trending_coins_with_global", coinData: coinData, globalData: globalData };
            }
            if (!includeTechIndicator && marketClassification.intent === "trend_analysis" &&
                marketClassification.requiredData.timeframes !== "30" || marketClassification.requiredData.timeframes !== "90" || marketClassification.requiredData.timeframes !== "180" || marketClassification.requiredData.timeframes !== "365") {

                const marketData = await getCoinMarkets({
                    vs_currency: "usd",
                    symbols,
                    price_change_percentage: "1h,24h,7d,30d",
                    sparkline: true
                });
                let dataResults = {};

                const coinIds = (marketData || [])
                    .map(sym => sym.id.toLowerCase());

                for (const sym of coinIds) {
                    try {
                        const data = await fetchCryptoData(sym);

                        dataResults[sym] = data;
                    } catch (err) {
                        console.error(`Failed to fetch OHLC for ${sym}:`, err.message);
                        dataResults[sym] = { error: err.message };
                    }


                }
                return {
                    type: "market_with_indicator",
                    marketData,
                    analysisData: dataResults
                };
            }
            if (!includeTechIndicator && marketClassification.intent === "forecast_request" &&
                marketClassification.requiredData.timeframes == "30" || marketClassification.requiredData.timeframes == "90" || marketClassification.requiredData.timeframes == "180" || marketClassification.requiredData.timeframes == "365") {

                const marketData = await getCoinMarkets({
                    vs_currency: "usd",
                    symbols,
                    price_change_percentage: "1h,24h,7d,30d",
                    sparkline: false
                });

                let ohlcResults = {};
                let dataResults = {};

                const coinIds = (marketData || [])
                    .map(sym => sym.id.toLowerCase());
                // If more than one symbol → loop and fetch OHLC one by one
                for (const sym of coinIds) {
                    try {
                        const data = await fetchCryptoData(sym);

                        const ohlc = await fetchOHLC(sym, "usd", Number(marketClassification.requiredData.timeframes));
                        ohlcResults[sym] = ohlc;
                        dataResults[sym] = data;

                    } catch (err) {
                        console.error(`Failed to fetch OHLC for ${sym}:`, err.message);
                        ohlcResults[sym] = { error: err.message };
                    }
                }

                return {
                    type: "market_with_ohlc",
                    marketData: dataResults,
                    ohlcData: ohlcResults
                };
            }

            if (marketClassification.intent == "general_inquiry") return "general Question"
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
// getTrendingCoins