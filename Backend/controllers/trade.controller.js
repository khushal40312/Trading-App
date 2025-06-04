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
module.exports.getMyTradesBySymbol = async (req, res) => {

    const userId = req.user._id;
    const Symbol = req.params.symbol;
    try {
        const trade = await tradeModel.find({ symbol: Symbol.toUpperCase(), user: userId.toString() }).populate('portfolio')

        if (null) {
            return res.status(400).json({ error: "you don't have access to this trade history" })
        }

        return res.status(201).json({ trade })
    } catch (error) {
        console.error('Error in getMyTradesBySymbol:', error);
        return res.status(500).json({ error: 'Server error' });
    }
}
module.exports.cancelPendingTrade = async (req, res) => {
    const userId = req.user._id;
    const id = req.params.id;

    try {
        const trade = await tradeModel.findOneAndUpdate(
            { _id: id, status: "pending", user: userId },
            { $set: { status: "cancelled" } },
            { new: true }
        ).populate('portfolio');

        if (!trade) {
            return res.status(404).json({ message: "Trade not found or already processed" });
        }


        return res.status(200).json({ message: "Trade cancelled", trade });
    } catch (error) {
        console.error('Error in cancelPendingTrade:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
module.exports.getMyTradingStats = async (req, res) => {
    const userId = req.user._id;
  
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
  
      return res.status(200).json({
        success: true,
        data: {
          totalTrades,
          totalBuyTrades,
          totalSellTrades,
          totalInvested: Number(totalInvested.toFixed(2)),
          totalRealized: Number(totalRealized.toFixed(2)),
          totalProfitLoss: Number(totalProfitLoss.toFixed(2)),
          profitLossPercentage,
          winRate,
          averageTradeSize,
          largestGain: Number(largestGain.toFixed(2)),
          largestLoss: Number(largestLoss.toFixed(2)),
          mostTradedAssets,
          period: 'all'
        }
      });
  
    } catch (error) {
      console.error('Error in getMyTradingStats:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
  
