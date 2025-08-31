const pendingTradesModel = require('../models/pendingTrades.model')
const tradeServices = require('../services/trade.service');
const COINGECKO_URL = "https://api.coingecko.com/api/v3/coins";
const axios = require("axios");


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

async function getPendingTradesFromDB() {
    try {
        const trades = await pendingTradesModel.find({ status: 'PENDING' })
            .sort({ createdAt: -1 });
        return trades;
    } catch (err) {
        console.error("Error fetching trades for monitoring:", err);
        throw err;
    }
}
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

/**
 * Fetch OHLC data from CoinGecko with optional downsampling
 * @param {string} coinId - CoinGecko coin ID (e.g., 'bitcoin', 'ethereum')
 * @param {string} vsCurrency - Target currency (e.g., 'usd')
 * @param {number|string} days - Number of days (1, 7, 30, 90, 180, 365, 'max')
 * @param {number} step - Keep every nth data point (default 5 = skip 4, keep 1)
 */
async function fetchOHLC(coinId, vsCurrency = "usd", days = 30, step) {
    try {
        // Auto decide step if not given
        if (!step) {
            if (days >= 365) step = 14;
            else if (days >= 180) step = 7;
            else step = 4;
        }

        const url = `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=${vsCurrency}&days=${days}`;
        const { data } = await axios.get(url);

        if (!Array.isArray(data)) {
            throw new Error("Invalid OHLC response");
        }

        // Downsample: keep every nth candle
        const sampled = data.filter((_, index) => index % step === 0);

        // Format into objects for clarity
        return sampled.map(([time, open, high, low, close]) => ({
            time,
            open,
            high,
            low,
            close
        }));

    } catch (err) {
        console.error("Error fetching OHLC:", err.message);
        return [];
    }
}


function parseCryptoData(data) {
    if (!data || !data.id) {
        throw new Error("Invalid crypto data");
    }

    return {
        id: data.id,
        name: data.name,
        symbol: data.symbol.toUpperCase(),
        hashingAlgorithm: data.hashing_algorithm || "N/A",
        genesisDate: data.genesis_date || "Unknown",
        market: {
            priceUSD: data.market_data?.current_price?.usd ?? null,
            marketCapUSD: data.market_data?.market_cap?.usd ?? null,
            volume24hUSD: data.market_data?.total_volume?.usd ?? null,
            ath: data.market_data?.ath?.usd ?? null,
            athChangePercent: data.market_data?.ath_change_percentage?.usd ?? null,
            athDate: data.market_data?.ath_date?.usd ?? null,
            atl: data.market_data?.atl?.usd ?? null,
            atlChangePercent: data.market_data?.atl_change_percentage?.usd ?? null,
            atlDate: data.market_data?.atl_date?.usd ?? null,
            priceChange24h: data.market_data?.price_change_24h ?? null,
            priceChange24hPercent: data.market_data?.price_change_percentage_24h ?? null,
        },
        performance: {
            change7d: data.market_data?.price_change_percentage_7d ?? null,
            change14d: data.market_data?.price_change_percentage_14d ?? null,
            change30d: data.market_data?.price_change_percentage_30d ?? null,
            change60d: data.market_data?.price_change_percentage_60d ?? null,
            change200d: data.market_data?.price_change_percentage_200d ?? null,
            change1y: data.market_data?.price_change_percentage_1y ?? null,
        },
        community: {
            redditSubscribers: data.community_data?.reddit_subscribers ?? 0,
            twitterFollowers: data.community_data?.twitter_followers ?? 0,
            sentimentUp: data.sentiment_votes_up_percentage ?? 0,
            sentimentDown: data.sentiment_votes_down_percentage ?? 0,
        },
        links: {
            homepage: data.links?.homepage?.[0] ?? "",
            whitepaper: data.links?.whitepaper ?? "",
            blockchainExplorer: data.links?.blockchain_site?.[0] ?? "",
            github: data.links?.repos_url?.github?.[0] ?? "",
            subreddit: data.links?.subreddit_url ?? "",
        }
    };
}
/**
 * Fetch crypto data from CoinGecko and return cleaned summary
 * @param {string} coinId - Example: "bitcoin", "ethereum"
 * @param {string} apiKey - Your CoinGecko API key
 * @returns {Promise<Object>} Cleaned crypto data
 */
async function fetchCryptoData(coinId) {
    try {
        const response = await axios.get(`${COINGECKO_URL}/${coinId}`, {
            params: {
                localization: false,
                tickers: false,
                market_data: true,
                community_data: false,
                developer_data: false,
                sparkline: false,
                dex_pair_format: "symbol",
            },
            headers: {
                accept: "application/json",
                "x-cg-demo-api-key": process.env.COINGECKO_API_KEY,
            },
        });

        return parseCryptoData(response.data);
    } catch (error) {
        console.error("Error fetching crypto data:", error.message);
        throw error;
    }
}

async function fetchTicker(coinId) {
    try {
        const url = `https://api.coingecko.com/api/v3/coins/${coinId}/tickers`;

        const response = await axios.get(url, {
            params: {
                exchange_ids: 'bitget',
                include_exchange_logo: false,
                depth: false,
            },
            headers: {
                accept: "application/json",
                "x-cg-demo-api-key": process.env.COINGECKO_API_KEY,
            },
        });

        const tickers = response.data?.tickers || [];
        const ticker = tickers.find(
            (t) => t.target === 'USDT'
        );

        return ticker || null;
    } catch (error) {
        console.error(`Error fetching ${base}/${target} ticker from ${exchange}:`, error.message);
        throw error;
    }
}

async function getTrendingCoins() {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/search/trending', {
            headers: {
                'Accept': 'application/json',
                'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
            },
            timeout: 30000
        });

        // Extract coins array and simplify price_change_percentage_24h to only include USD
        const coins = response.data.coins
            .slice(0, 7) // ✅ only keep top 7 items
            .map(coinData => {
                const coin = { ...coinData };

                // Only keep USD from price_change_percentage_24h if it exists
                if (coin.item.data && coin.item.data.price_change_percentage_24h) {
                    coin.item.data.price_change_percentage_24h = {
                        usd: coin.item.data.price_change_percentage_24h.usd
                    };
                }

                return coin;
            });

        return coins;

    } catch (error) {
        if (error.response) {
            throw new Error(`CoinGecko API Error: ${error.response.status} - ${error.response.data?.error || error.response.statusText}`);
        } else if (error.request) {
            throw new Error('Network error: Unable to reach CoinGecko API');
        } else {
            throw new Error(`Error: ${error.message}`);
        }
    }
}


async function getFilteredGlobalMarketData() {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/global', {
            headers: {
                'Accept': 'application/json',
                'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
            },
            timeout: 30000
        });

        const data = response.data.data;

        // Filtered subset: include usd, inr, btc for market cap
        const filteredData = {


            active_cryptocurrencies: data.active_cryptocurrencies,
            upcoming_icos: data.upcoming_icos, ongoing_icos: data.ongoing_icos, ended_icos: data.ended_icos, markets: data.markets,
            total_market_cap: {
                usd: data.total_market_cap.usd,
                inr: data.total_market_cap.inr,   // 👈 added INR here
                btc: data.total_market_cap.btc,
            },
            total_volume: {
                usd: data.total_volume.usd,
                inr: data.total_volume.inr,       // 👈 also include INR here for consistency
                btc: data.total_volume.btc,
            },
            market_cap_percentage: {
                btc: data.market_cap_percentage.btc,
                usdt: data.market_cap_percentage.usdt,
            },
            market_cap_change_percentage_24h_usd: data.market_cap_change_percentage_24h_usd, updated_at: data.updated_at
        };

        return filteredData


    } catch (error) {
        if (error.response) {
            throw new Error(`CoinGecko API Error: ${error.response.status} - ${error.response.data?.error || error.response.statusText}`);
        } else if (error.request) {
            throw new Error('Network error: Unable to reach CoinGecko API');
        } else {
            throw new Error(`Error: ${error.message}`);
        }
    }
}







module.exports = { getMarketSentiment,getRiskProfile,getPendingTradesFromDB,executeBuyAsset,executeSellAsset,getCoinMarkets,fetchOHLC ,fetchCryptoData,fetchTicker,getTrendingCoins,getFilteredGlobalMarketData}