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
