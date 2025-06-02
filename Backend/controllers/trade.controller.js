const { validationResult } = require("express-validator");
const portfolioModel = require('../models/portfolio.model.js');
const tradeModel = require('../models/Trade.model.js');
const userModel = require('../models/user.model.js');
const getStockQuote = require("../getStockQuote.js");






module.exports.buyAssets = async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() });
    }

    const { symbol, assetName, quantity, price, notes } = req.body;
    const userId = req.user.id;
    const tradeType = 'buy';
    const fees = 0.005 * (quantity * price);

    try {
        let portfolio = await portfolioModel.findOne({ user: userId });
        const user = await userModel.findById(userId);

        const netAmount = quantity * price + fees;

        if (user.balance < netAmount) {
            return res.status(401).json({ error: "Insufficient balance" });
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
        });

        await trade.execute(); // sets executedAt, status, and saves

        // Deduct balance
        user.balance -= trade.netAmount;
        await user.save();


        portfolio.upsertAsset(symbol, assetName, quantity, price);

        await portfolio.updatePrices(getStockQuote); // or update manually if no price API
        portfolio.calculateValue(); // recalculates P&L
        await portfolio.save();


        res.status(201).json({
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
        });


    } catch (error) {
        console.error('Buy asset error:', error);
        res.status(500).json({ error: 'Something went wrong while executing the trade.' });
    }
};
module.exports.sellAssets = async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() });
    }

    const { symbol, assetName, quantity, price, notes } = req.body;
    const userId = req.user.id;
    const tradeType = 'sell';
    const fees = 0.005 * (quantity * price);

    try {
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
        });

        await trade.execute();
        portfolio.removeAsset(symbol, quantity);
        await portfolio.updatePrices(getStockQuote);
        await portfolio.save();

        user.balance += trade.netAmount;
        await user.save();

        return res.status(201).json({
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
        });

    } catch (error) {
        console.error('Sell asset error:', error);
        res.status(500).json({ error: 'Something went wrong while executing the trade.' });
    }
};

module.exports.getMyTrades = async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() });
    }

    const userId = req.user._id; // assuming set by authMiddleware

    const {
        symbol,
        assetName,
        quantity,
        price,
        status,
        tradeType,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 20
    } = req.query;

    try {
        // 🔍 Build dynamic filter
        const filters = { user: userId };

        if (symbol) filters.symbol = symbol.toUpperCase();
        if (assetName) filters.assetName = assetName;
        if (quantity) filters.quantity = Number(quantity);
        if (price) filters.price = Number(price);
        if (status) filters.status = status;
        if (tradeType) filters.tradeType = tradeType;

        // 🔃 Sorting
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const skip = (Number(page) - 1) * Number(limit);

        // 📥 Query with filters, pagination, and population
        const trades = await tradeModel.find(filters)
            .sort(sort)
            .skip(skip)
            .limit(Number(limit))
            .populate('portfolio', 'currentValue totalProfitLoss');

        const total = await tradeModel.countDocuments(filters);

        return res.json({
            page: Number(page),
            limit: Number(limit),
            total,
            trades
        });

    } catch (err) {
        console.error('Error in getMyTrades:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};
module.exports.getMyTradesById = async (req, res) => {
    const userId = req.user._id;
    const id = req.params.id
    try {
        const trade = await tradeModel.findById(id).populate('portfolio')
   
        if (trade?.user.toString() !== userId.toString()) {
            return res.status(400).json({ error: "you don't have access to this trade history" })
        }
        return res.status(201).json({ trade })
    } catch (error) {
        console.error('Error in getMyTrades:', error);
        return res.status(500).json({ error: 'Server error' });
    }




}