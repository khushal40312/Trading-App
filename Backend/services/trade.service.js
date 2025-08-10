const { default: axios } = require("axios");
const tradeModel = require('../models/Trade.model')
const portfolioModel = require('../models/portfolio.model')
const userModel = require('../models/user.model');
const getStockQuote = require("../getStockQuote");




module.exports.getSuggestion = async (input) => {
    try {
        const bitgetRes = await axios.get("https://api.bitget.com/api/v2/spot/public/coins");
        const bitgetCoins = bitgetRes.data.data;

        const upper = input.toUpperCase();
        const lower = input.toLowerCase();

        const match = bitgetCoins.find(
            (coin) => coin.coin.toLowerCase() === lower
        );

        if (!match) {
            return { error: `Coin "${input}" not found in Bitget.` };
        }

        const chain = match.chains?.find((c) => !!c.contractAddress); // get any chain with contract
        // Try contract-based lookup first if available
        if (chain?.contractAddress) {
            const network = chain.chain.toLowerCase(); // e.g. ETH, BSC, BASE, etc.
            const contract = chain.contractAddress;

            try {
                const tokenInfoRes = await axios.get(
                    `https://api.coingecko.com/api/v3/onchain/networks/${network}/tokens/${contract}/info`,
                    {
                        headers: {
                            accept: 'application/json',
                            'x-cg-demo-api-key': process.env.COINGECKO_API_KEY,
                        },
                    }
                );


                const info = tokenInfoRes.data.data?.attributes;
                console.log(info)
                return {
                    name: info.name,
                    symbol: info.symbol,
                    bitgetSymbol: match.symbol,
                    coingeckoId: info.coingecko_coin_id,
                    image: info.image?.large || info.image_url,
                    description: info.description,
                    source: "coingecko_onchain",

                };
            } catch (contractErr) {
                console.warn(`Fallback to search: ${contractErr.message}`);
            }
        }

        // Fallback to search by symbol if contract-based lookup failed
        const geckoRes = await axios.get("https://api.coingecko.com/api/v3/search", {
            params: { query: match.coin },
            headers: {
                accept: 'application/json',
                'x-cg-demo-api-key': process.env.COINGECKO_API_KEY,
            },
        });

        const matchedGecko = geckoRes.data.coins.find(
            (c) => c.symbol.toLowerCase() === match.coin.toLowerCase()
        );

        if (!matchedGecko) {
            return {
                name: match.name,
                symbol: match.coin,
                bitgetSymbol: match.symbol,
                coingecko: null,
                image: null,
                source: "bitget_only",
            };
        }

        return {
            name: matchedGecko.name,
            symbol: matchedGecko.symbol.toUpperCase(),
            bitgetSymbol: match.symbol,
            coingeckoId: matchedGecko.id,
            image: matchedGecko.large,
            source: "coingecko_search",
        };
    } catch (err) {
        console.error("Error in getSuggestion:", err.message);
        return { error: true, message: err.message };
    }
};

module.exports.getCandlesfromCoingeko = async (payload) => {
    const { coingeckoId, days } = payload;
    try {
        const response = await axios.get(
            `https://api.coingecko.com/api/v3/coins/${coingeckoId}/ohlc?vs_currency=usd&days=${days}`,
            {
                headers: {
                    accept: 'application/json',
                    'x-cg-demo-api-key': process.env.COINGEKO_API // Replace with your actual CoinGecko key
                }
            }
        );

        return response.data


    } catch (error) {
        console.log(error, "error during fetching CK candles ")
    }





}
module.exports.getCandlesfromBitget = async (payload) => {

    const { symbol, interval, startTime, endTime } = payload;
    try {
        const response = await axios.get(
            `https://api.bitget.com/api/v2/spot/market/candles`,
            {

                params: {
                    symbol: `${symbol}USDT`,
                    granularity: interval,
                    startTime,
                    endTime,
                    limit: 100,
                },
            }
        );


        return response.data.data;


    } catch (error) {
        console.log(error, "error during fetching BG candles ")
    }
}
module.exports.getImages = async (symbol) => {
    // console.log(symbol)

    if (!symbol) return
    try {
        const response = await axios.get(
            `https://api.coingecko.com/api/v3/coins/${symbol}`,
            {
                headers: {
                    accept: 'application/json',
                    'x-cg-demo-api-key': process.env.COINGEKO_API // Replace with your actual CoinGecko key
                },
                params: {

                    localization: false,
                    tickers: false,
                    market_data: false,
                    community_data: false,
                    developer_data: false,
                    sparkline: false
                },
            }
        );


        return response.data.image;


    } catch (error) {
        console.log(error, "error during fetching images ")
    }





}
module.exports.getCoinData = async (symbol) => {
    // console.log(symbol)

    if (!symbol) return
    try {
        const response = await axios.get(
            `https://api.coingecko.com/api/v3/coins/${symbol}`,
            {
                headers: {
                    accept: 'application/json',
                    'x-cg-demo-api-key': process.env.COINGEKO_API // Replace with your actual CoinGecko key
                },
                params: {

                    localization: false,
                    tickers: false,
                    market_data: false,
                    community_data: false,
                    developer_data: false,
                    sparkline: false
                },
            }
        );


        return response.data;


    } catch (error) {
        console.log(error, "error during fetching data ")
    }





}

module.exports.getTradingHistory = async (id, symbol) => {

    try {

        const trades = await tradeModel.find({
            user: id,
            symbol: symbol
        });
        return trades;

    } catch (error) {
        console.log("error during fetching tradehistory", error)
    }


}


module.exports.getMyTradingStats= async(userId)=>{

    try {
        const trades = await tradeModel.find({ user: userId }).populate('portfolio');

        if (!trades || trades.length === 0) {
            return res.status(200).json({ success: true, data: {} });
        }

        const buyTrades = trades.filter(t => t.tradeType === 'buy');
        const sellTrades = trades.filter(t => t.tradeType === 'sell');

        const totalTrades = trades.length;
        const totalBuyTrades = buyTrades.length;
        const totalSellTrades = sellTrades.length;

        const totalInvested = trades.reduce((sum, t) => {
            return t.tradeType === 'buy' ? sum + (t.totalAmount || (t.quantity * t.price)) : sum;
        }, 0);

        const totalRealized = trades.reduce((sum, t) => {
            return t.tradeType === 'sell' ? sum + (t.totalAmount || (t.quantity * t.price)) : sum;
        }, 0);

        const totalProfitLoss = totalRealized - totalInvested;
        const profitLossPercentage = totalInvested > 0
            ? Number(((totalProfitLoss / totalInvested) * 100).toFixed(2))
            : 0;

        const winningTrades = trades.filter(t => t.tradeType === 'sell' && t.netAmount > t.totalAmount).length;
        const winRate = Number(((winningTrades / totalTrades) * 100).toFixed(2));

        const averageTradeSize = Number((
            trades.reduce((sum, t) => sum + (t.totalAmount || (t.quantity * t.price)), 0) / totalTrades
        ).toFixed(2));

        const profitLossValues = trades
            .filter(t => t.tradeType === 'sell')
            .map(t => (t.netAmount || 0) - (t.totalAmount || (t.quantity * t.price)));

        const largestGain = profitLossValues.length ? Math.max(...profitLossValues) : 0;
        const largestLoss = profitLossValues.length ? Math.min(...profitLossValues) : 0;

        const assetStats = {};
        trades.forEach(t => {
            if (!assetStats[t.symbol]) {
                assetStats[t.symbol] = { symbol: t.symbol, trades: 0, totalAmount: 0 };
            }
            assetStats[t.symbol].trades += 1;
            assetStats[t.symbol].totalAmount += (t.totalAmount || (t.quantity * t.price));
        });

        const mostTradedAssets = Object.values(assetStats)
            .sort((a, b) => b.trades - a.trades)
            .slice(0, 5);

        return  {
                totalTrades,
                totalInvested: Number(totalInvested.toFixed(2)),
                totalProfitLoss: Number(totalProfitLoss.toFixed(2)),
                profitLossPercentage,
                averageTradeSize,
                largestGain: Number(largestGain.toFixed(2)),
                largestLoss: Number(largestLoss.toFixed(2)),
                mostTradedAssets,
            }
        

    } catch (error) {
        console.error('Error in getMyTradingStats:', error);

    }



}

 module.exports.buyAssets= async (payload) => {
    const { symbol, assetName, quantity, price, notes ,userId} = payload
    
    const tradeType = 'buy';
    const fees = 0.005 * (quantity * price);
    
    try {
        const imageURL= await getImages(assetName);
        
        let portfolio = await portfolioModel.findOne({ user: userId });
        const user = await userModel.findById(userId);

        const netAmount = quantity * price + fees;

        if (user.balance < netAmount) {
            return { error: "Insufficient balance" }
        }

        if (!portfolio) {
            portfolio = await portfolioModel.create({ user: userId });
        }

        const trade = new tradeModel({
            user: userId,
            portfolio: portfolio._id,
            symbol,
            assetName,
            tradeType,
            quantity,
            price,
            fees,
            notes,
            imageURL
        });

        await trade.execute(); // sets executedAt, status, and saves

        // Deduct balance and push trade ID
        user.balance -= trade.netAmount;
        user.trades.push(trade._id);
        await user.save();
        

        portfolio.upsertAsset(symbol, assetName, quantity, price,imageURL);

        await portfolio.updatePrices(getStockQuote); // or update manually if no price API
        portfolio.calculateValue(); // recalculates P&L
        await portfolio.save();


       return {
            message: 'Trade executed successfully',
            trade,
            balance: user.balance,
            portfolioSummary: {
                currentValue: portfolio.currentValue,
                totalInvestment: portfolio.totalInvestment,
                totalProfitLoss: portfolio.totalProfitLoss,
                totalProfitLossPercentage: portfolio.totalProfitLossPercentage,
                assets: portfolio.assets,
                imageURL
            }
        }


    } catch (error) {
        console.error('Buy asset error:', error);
        
    }
 }
 module.exports.sellAssets= async (payload) => {
    const { symbol, assetName, quantity, price, notes ,userId} = payload
    
    const tradeType = 'sell';
    const fees = 0.005 * (quantity * price);
    
    try {
        const imageURL= await getImages(assetName);

        const user = await userModel.findById(userId);
        let portfolio = await portfolioModel.findOne({ user: userId });

        if (!portfolio) {
            return res.status(404).json({ error: "Portfolio not found." });
        }

        const asset = portfolio.assets.find(a => a.symbol === symbol.toUpperCase());
        if (!asset) {
            return res.status(400).json({ error: `Asset ${symbol} not found in portfolio.` });
        }
        if (asset.quantity < quantity) {
            return res.status(400).json({ error: `Not enough quantity to sell. Available: ${asset.quantity}` });
        }

        const trade = new tradeModel({
            user: userId,
            portfolio: portfolio._id,
            symbol,
            assetName,
            tradeType,
            quantity,
            price,
            fees,
            notes,
            imageURL
        });

        await trade.execute();
        portfolio.removeAsset(symbol, quantity);
        await portfolio.updatePrices(getStockQuote);
        await portfolio.save();

        user.balance += trade.netAmount;
        user.trades.push(trade._id);
        await user.save();

        return {
            message: 'Trade executed successfully',
            trade,
            balance: user.balance,
            portfolioSummary: {
                currentValue: portfolio.currentValue,
                totalInvestment: portfolio.totalInvestment,
                totalProfitLoss: portfolio.totalProfitLoss,
                totalProfitLossPercentage: portfolio.totalProfitLossPercentage,
                assets: portfolio.assets,
            }
        }

    } catch (error) {
        console.error('Sell asset error:', error);
    }
 }
 const getImages = async (symbol) => {
    // console.log(symbol)

    if (!symbol) return
    try {
        const response = await axios.get(
            `https://api.coingecko.com/api/v3/coins/${symbol}`,
            {
                headers: {
                    accept: 'application/json',
                    'x-cg-demo-api-key': process.env.COINGEKO_API // Replace with your actual CoinGecko key
                },
                params: {

                    localization: false,
                    tickers: false,
                    market_data: false,
                    community_data: false,
                    developer_data: false,
                    sparkline: false
                },
            }
        );


        return response.data.image;


    } catch (error) {
        console.log(error, "error during fetching images ")
    }





}
