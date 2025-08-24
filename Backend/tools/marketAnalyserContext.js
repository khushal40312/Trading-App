const { getCoinMarkets, getTrendingCoins, getFilteredGlobalMarketData, fetchCryptoData, fetchTicker, fetchOHLC } = require("../services/ai.service");
const tavilyService = require("../services/tailvy.service");

const longTimeframes = ["30", "90", "180", "365"];
const singleDayTimeframes = ["1min", "3min", "5min", "15min", "30min", "1h", "4h", "12h", "1day"];

const isLong = (t) => longTimeframes.includes(t);
const isShort = (t) => singleDayTimeframes.includes(t);
const isMid = (tf) => !isShort(tf) && !isLong(tf);

async function getOHLCData(coinIds, timeframe) {
    const results = {};
    for (const sym of coinIds) {
        try {
            results[sym] = await fetchOHLC(sym, "usd", Number(timeframe));
        } catch (err) {
            console.error(`Failed to fetch OHLC for ${sym}:`, err.message);
            results[sym] = { error: err.message };
        }
    }
    return results;
}

async function getAnalysisData(coinIds, withIndicators = false) {
    const results = {};
    const indicators = {};
    for (const sym of coinIds) {
        try {
            results[sym] = await fetchCryptoData(sym);
            if (withIndicators) {
                indicators[sym] = await fetchTicker(coinIds);
            }
        } catch (err) {
            results[sym] = { error: err.message };
        }
    }
    return withIndicators ? { results, indicators } : { results };
}

/**
 * Handle general inquiries using Tavily search
 * @param {string} query - The user's general query
 * @param {string} context - Additional context about the query
 * @returns {Promise<Object>} Search results and formatted response
 */
async function handleGeneralInquiry(query, context = '') {
    try {
        // Determine if it's crypto-related
        const cryptoKeywords = ['crypto', 'bitcoin', 'ethereum', 'blockchain', 'defi', 'nft', 'altcoin', 'trading', 'wallet', 'mining'];
        const isCryptoRelated = cryptoKeywords.some(keyword =>
            query.toLowerCase().includes(keyword) || context.toLowerCase().includes(keyword)
        );

        let searchResult;

        if (isCryptoRelated) {
            // Use crypto-specific search for better results
            searchResult = await tavilyService.searchCryptoGeneral(query);
        } else {
            // Use general search
            searchResult = await tavilyService.search(query, {
                search_depth: 'basic',
                max_results: 3,
                include_answer: true
            });
        }

        if (!searchResult.success) {
            return {
                type: "general_inquiry_error",
                message: "Sorry, I couldn't search for that information right now.",
                error: searchResult.error
            };
        }

        const { data } = searchResult;

        return {
            type: "general_inquiry_response",
            query: query,
            answer: data.answer || "I found some relevant information for you.",
            sources: data.results ? data.results.map(result => ({
                title: result.title,
                url: result.url,
                content: result.content,
                score: result.score
            })) : [],
            searchMetadata: {
                search_time: data.response_time,
                results_count: data.results ? data.results.length : 0
            }
        };

    } catch (error) {
        console.error('Error in handleGeneralInquiry:', error.message);
        return {
            type: "general_inquiry_error",
            message: "Sorry, there was an error processing your request.",
            error: error.message
        };
    }
}

const marketAnalyserContext = {
    name: "marketAnalyserContext",
    description: "Extract market context",

    func: async ({ marketClassification, input }) => {
        try {
            const symbolsArr = (marketClassification.requiredData?.symbols || []).map((s) => s.toLowerCase());
            const timeframe = marketClassification.requiredData?.timeframes;
            const includeIndicators = marketClassification.requiredData?.dataTypes?.includes("technical_indicators");

            switch (marketClassification.intent) {
                case "price_analysis": {
                    if (!symbolsArr.length) throw new Error("No symbols provided for price analysis");

                    const symbols = symbolsArr.join(",");

                    if (marketClassification.requiredData?.dataTypes?.length === 1 && marketClassification.requiredData?.dataTypes.includes('only_current_price')) {

                        const marketData = await getCoinMarkets({
                            vs_currency: "usd",
                            symbols,
                            price_change_percentage: "1h",
                            sparkline: false,
                        });

                        return { type: "market_data", marketData };

                    } else {


                        const marketData = await getCoinMarkets({
                            vs_currency: "usd",
                            symbols,
                            price_change_percentage: isLong(timeframe) ? "30d" : "1h,24h,7d,30d",
                            sparkline: !isLong(timeframe),
                        });
                        // only_curent_price

                        if (isLong(timeframe)) {
                            const coinIds = marketData.map((c) => c.id.toLowerCase());
                            const ohlcData = await getOHLCData(coinIds, timeframe);
                            return { type: "market_with_ohlc", marketData, ohlcData };
                        }
                        return { type: "market_data", marketData };
                    }
                }

                case "trend_analysis": {
                    if (!symbolsArr.length) {
                        const query = input+'bitget market' || "general crypto information";
                        const context = marketClassification.contextualNotes || "";
    
                        return await handleGeneralInquiry(query, context);

                    };

                    const symbols = symbolsArr.join(",");
                    const marketData = await getCoinMarkets({
                        vs_currency: "usd",
                        symbols,
                        price_change_percentage: isLong(timeframe) ? "1h,24h,7d,30d"
                            : isShort(timeframe) ? "1h,24h"
                                : "1h,24h,7d",
                        sparkline: isShort(timeframe) ? false : !isLong(timeframe),
                    });

                    const coinIds = marketData.map((c) => c.id.toLowerCase());

                    if (isShort(timeframe)) {
                        if (includeIndicators) {
                            const { results, indicators } = await getAnalysisData(coinIds, true);
                            return { type: "market_with_indicator", marketData, analysisData: results, indicationResults: indicators };
                        }
                        return { type: "market_data", marketData };
                    }

                    if (isMid(timeframe)) {
                        const { results, indicators } = await getAnalysisData(coinIds, includeIndicators);
                        return { type: "market_with_indicator", marketData, analysisData: results, indicationResults: indicators };
                    }

                    // long timeframe
                    const ohlcData = await getOHLCData(coinIds, timeframe);
                    if (includeIndicators) {
                        const { indicators } = await getAnalysisData(coinIds, true);
                        return { type: "market_with_ohlc", marketData, ohlcData, indicationResults: indicators };
                    }
                    return { type: "market_with_ohlc", marketData, ohlcData };
                }


                case "forecast_request": {
                    if (!symbolsArr.length) throw new Error("No symbols provided for forecast");
                    if (!isLong(timeframe)) return { message: "Forecasts only supported for long timeframes" };

                    const symbols = symbolsArr.join(",");
                    const marketData = await getCoinMarkets({
                        vs_currency: "usd",
                        symbols,
                        price_change_percentage: "1h,24h,7d,30d",
                        sparkline: false,
                    });

                    const coinIds = marketData.map((c) => c.id.toLowerCase());
                    const ohlcData = await getOHLCData(coinIds, timeframe);
                    const { results } = await getAnalysisData(coinIds, false);
                    return { type: "market_with_ohlc", marketData, ohlcData, analysisData: results };
                }

                case "market_research": {
                    const coinData = await getTrendingCoins();
                    const globalData = await getFilteredGlobalMarketData();
                    return { type: "trending_coins_with_global", coinData, globalData };
                }

                case "general_inquiry": {
                    // Extract the actual query from marketClassification
                    const query = input || "general crypto information";
                    const context = marketClassification.contextualNotes || "";

                    return await handleGeneralInquiry(query, context);
                }
                default:
                    return { message: "No market data requested for this context." };
            }
        } catch (error) {
            console.error("ERROR DURING CONTEXT MAKING", error.message);
            return { error: error.message };
        }
    },
};

module.exports = { marketAnalyserContext };