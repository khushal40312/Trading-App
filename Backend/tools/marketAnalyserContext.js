const { getCoinMarkets, getTrendingCoins, getFilteredGlobalMarketData, fetchCryptoData, fetchTicker, fetchOHLC } = require("../services/ai.service");
const tavilyService = require("../services/tailvy.service");

// Constants
const TIMEFRAME_CONFIGS = {
    LONG: ["30", "90", "180", "365"],
    SHORT: ["1min", "3min", "5min", "15min", "30min", "1h", "4h", "12h", "1day"]
};

const PRICE_CHANGE_CONFIGS = {
    LONG: "30d",
    SHORT: "1h,24h",
    MID: "1h,24h,7d",
    DEFAULT: "1h,24h,7d,30d"
};

// Helper functions
const isLongTimeframe = (timeframe) => TIMEFRAME_CONFIGS.LONG.includes(timeframe);
const isShortTimeframe = (timeframe) => TIMEFRAME_CONFIGS.SHORT.includes(timeframe);
const isMidTimeframe = (timeframe) => !isShortTimeframe(timeframe) && !isLongTimeframe(timeframe);

/**
 * Fetch OHLC data for multiple symbols with proper error handling
 */
async function getOHLCData(coinIds, timeframe) {
    if (!coinIds?.length || !timeframe) {
        throw new Error('Missing required parameters for OHLC data');
    }

    const results = {};
    const errors = [];

    await Promise.allSettled(
        coinIds.map(async (coinId) => {
            try {
                results[coinId] = await fetchOHLC(coinId, "usd", Number(timeframe));
            } catch (error) {
                console.error(`Failed to fetch OHLC for ${coinId}:`, error.message);
                results[coinId] = { error: error.message };
                errors.push({ coinId, error: error.message });
            }
        })
    );

    return { data: results, errors };
}

/**
 * Fetch analysis data with optional indicators
 */
async function getAnalysisData(coinIds, withIndicators = false) {
    if (!coinIds?.length) {
        throw new Error('No coin IDs provided for analysis');
    }

    const results = {};
    const indicators = {};
    const errors = [];

    await Promise.allSettled(
        coinIds.map(async (coinId) => {
            try {
                results[coinId] = await fetchCryptoData(coinId);
                
                if (withIndicators) {
                    // Fixed: use coinId instead of coinIds array
                    indicators[coinId] = await fetchTicker(coinId);
                }
            } catch (error) {
                console.error(`Failed to fetch data for ${coinId}:`, error.message);
                results[coinId] = { error: error.message };
                errors.push({ coinId, error: error.message });
            }
        })
    );

    return { 
        results, 
        ...(withIndicators && { indicators }), 
        errors 
    };
}

/**
 * Handle general inquiries using Tavily search
 */
async function handleGeneralInquiry(query) {
    if (!query?.trim()) {
        return {
            type: "general_inquiry_error",
            message: "Please provide a specific question to search for.",
            error: "Empty query"
        };
    }

    try {
        const searchResult = await tavilyService.search(query, {
            search_depth: 'basic',
            max_results: 3,
            include_answer: true
        });

        if (!searchResult?.success) {
            return {
                type: "general_inquiry_error",
                message: "Sorry, I couldn't search for that information right now.",
                error: searchResult?.error || "Search service unavailable"
            };
        }

        const { data } = searchResult;

        return {
            type: "general_inquiry_response",
            query: query.trim(),
            answer: data?.answer || "I found some relevant information for you.",
            sources: data?.results?.map(result => ({
                title: result.title,
                url: result.url,
                content: result.content,
                score: result.score
            })) || [],
            searchMetadata: {
                search_time: data?.response_time,
                results_count: data?.results?.length || 0
            }
        };

    } catch (error) {
        console.error('Error in handleGeneralInquiry:', error);
        return {
            type: "general_inquiry_error",
            message: "Sorry, there was an error processing your request.",
            error: error.message
        };
    }
}

/**
 * Get market data configuration based on timeframe
 */
function getMarketDataConfig(timeframe, dataTypes = []) {
    const config = {
        vs_currency: "usd",
        sparkline: false,
        price_change_percentage: PRICE_CHANGE_CONFIGS.DEFAULT
    };

    if (dataTypes.includes('only_current_price')) {
        config.price_change_percentage = "1h";
        return config;
    }

    if (isLongTimeframe(timeframe)) {
        config.price_change_percentage = PRICE_CHANGE_CONFIGS.LONG;
        config.sparkline = false;
    } else if (isShortTimeframe(timeframe)) {
        config.price_change_percentage = PRICE_CHANGE_CONFIGS.SHORT;
        config.sparkline = false;
    } else if (isMidTimeframe(timeframe)) {
        config.price_change_percentage = PRICE_CHANGE_CONFIGS.MID;
        config.sparkline = true;
    }

    return config;
}

/**
 * Process price analysis intent
 */
async function processPriceAnalysis(marketClassification) {
    const { requiredData } = marketClassification;
    const symbolsArr = requiredData?.symbols?.map(s => s.toLowerCase()) || [];
    const timeframe = requiredData?.timeframes;
    const dataTypes = requiredData?.dataTypes || [];

    // Handle trending coins request
    if (!symbolsArr.length && dataTypes.includes('only_trending_coins')) {
        const coinData = await getTrendingCoins();
        return { type: "trending_coins", coinData };
    }

    if (!symbolsArr.length) {
        throw new Error("No symbols provided for price analysis");
    }

    const symbols = symbolsArr.join(",");
    const config = getMarketDataConfig(timeframe, dataTypes);
    config.symbols = symbols;

    const marketData = await getCoinMarkets(config);

    // Handle current price only requests
    if (dataTypes.length === 1 && dataTypes.includes('only_current_price')) {
        return { type: "market_data", marketData };
    }

    // Handle long timeframe with OHLC data
    if (isLongTimeframe(timeframe)) {
        const coinIds = marketData.map(c => c.id.toLowerCase());
        const ohlcResult = await getOHLCData(coinIds, timeframe);
        return { 
            type: "market_with_ohlc", 
            marketData, 
            ohlcData: ohlcResult.data,
            errors: ohlcResult.errors
        };
    }

    return { type: "market_data", marketData };
}

/**
 * Process trend analysis intent
 */
async function processTrendAnalysis(marketClassification, input) {
    const { requiredData } = marketClassification;
    const symbolsArr = requiredData?.symbols?.map(s => s.toLowerCase()) || [];
    const timeframe = requiredData?.timeframes;
    const dataTypes = requiredData?.dataTypes || [];
    const includeIndicators = dataTypes.includes("technical_indicators");

    // Handle trending coins request
    if (!symbolsArr.length && dataTypes.includes('only_trending_coins')) {
        const coinData = await getTrendingCoins();
        return { type: "trending_coins", coinData };
    }

    // Handle general inquiry if no symbols and not trending coins
    if (!symbolsArr.length && !dataTypes.includes('only_trending_coins')) {
        const query = `${input} bitget market` || "general crypto information";
        return await handleGeneralInquiry(query);
    }

    const symbols = symbolsArr.join(",");
    const config = getMarketDataConfig(timeframe);
    config.symbols = symbols;

    const marketData = await getCoinMarkets(config);
    const coinIds = marketData.map(c => c.id.toLowerCase());

    // Handle different timeframe scenarios
    if (isShortTimeframe(timeframe)) {
        if (includeIndicators) {
            const analysisResult = await getAnalysisData(coinIds, true);
            return { 
                type: "market_with_indicator", 
                marketData, 
                analysisData: analysisResult.results, 
                indicationResults: analysisResult.indicators,
                errors: analysisResult.errors
            };
        }
        return { type: "market_data", marketData };
    }

    if (isMidTimeframe(timeframe)) {
        const analysisResult = await getAnalysisData(coinIds, includeIndicators);
        return { 
            type: "market_with_indicator", 
            marketData, 
            analysisData: analysisResult.results,
            ...(includeIndicators && { indicationResults: analysisResult.indicators }),
            errors: analysisResult.errors
        };
    }

    // Long timeframe
    const ohlcResult = await getOHLCData(coinIds, timeframe);
    const response = { 
        type: "market_with_ohlc", 
        marketData, 
        ohlcData: ohlcResult.data,
        errors: [...(ohlcResult.errors || [])]
    };

    if (includeIndicators) {
        const analysisResult = await getAnalysisData(coinIds, true);
        response.indicationResults = analysisResult.indicators;
        response.errors.push(...(analysisResult.errors || []));
    }

    return response;
}

/**
 * Main market analyzer context
 */
const marketAnalyserContext = {
    name: "marketAnalyserContext",
    description: "Extract market context with improved error handling and structure",

    func: async ({ marketClassification, input }) => {
        try {
            // Validate input
            if (!marketClassification?.intent) {
                throw new Error("Missing market classification or intent");
            }

            const { intent, requiredData } = marketClassification;

            switch (intent) {
                case "price_analysis":
                    return await processPriceAnalysis(marketClassification);

                case "trend_analysis":
                    return await processTrendAnalysis(marketClassification, input);

                case "forecast_request": {
                    const symbolsArr = requiredData?.symbols?.map(s => s.toLowerCase()) || [];
                    const timeframe = requiredData?.timeframes;

                    if (!symbolsArr.length) {
                        throw new Error("No symbols provided for forecast");
                    }
                    
                    if (!isLongTimeframe(timeframe)) {
                        return { 
                            type: "error",
                            message: "Forecasts only supported for long timeframes (30, 90, 180, 365 days)" 
                        };
                    }

                    const symbols = symbolsArr.join(",");
                    const marketData = await getCoinMarkets({
                        vs_currency: "usd",
                        symbols,
                        price_change_percentage: PRICE_CHANGE_CONFIGS.DEFAULT,
                        sparkline: false,
                    });

                    const coinIds = marketData.map(c => c.id.toLowerCase());
                    const [ohlcResult, analysisResult] = await Promise.all([
                        getOHLCData(coinIds, timeframe),
                        getAnalysisData(coinIds, false)
                    ]);

                    return { 
                        type: "market_with_ohlc", 
                        marketData, 
                        ohlcData: ohlcResult.data, 
                        analysisData: analysisResult.results,
                        errors: [...(ohlcResult.errors || []), ...(analysisResult.errors || [])]
                    };
                }

                case "market_research": {
                    const [coinData, globalData] = await Promise.all([
                        getTrendingCoins(),
                        getFilteredGlobalMarketData()
                    ]);
                    return { type: "trending_coins_with_global", coinData, globalData };
                }

                case "general_inquiry": {
                    const query = input?.trim() || "general crypto information";
                    return await handleGeneralInquiry(query);
                }

                default:
                    return { 
                        type: "error",
                        message: `Unsupported intent: ${intent}. Available intents: price_analysis, trend_analysis, forecast_request, market_research, general_inquiry.`
                    };
            }
        } catch (error) {
            console.error("ERROR DURING CONTEXT MAKING:", error);
            return { 
                type: "error",
                message: "Failed to process market analysis request",
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            };
        }
    },
};

module.exports = { marketAnalyserContext };