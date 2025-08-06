const { validationResult } = require('express-validator');
const portfolioService = require('../services/portfolio.service.js');
const portfolioModel = require('../models/portfolio.model.js');
const getStockQuote = require('../getStockQuote.js');

module.exports.getPortfolio = async (req, res, next) => {
  try {

    const portfolio = await portfolioService.findPortfolio(req.user.id)
    res.status(200).json(portfolio)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
}
module.exports.getPortfolios = async (req, res) => {

  try {

    const portfolio = await portfolioModel.find({})
    res.status(200).json(portfolio)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
}
module.exports.getUserAssets = async (req, res) => {

  try {
    const portfolio = await portfolioModel.findOne({ user: req.user.id })

    res.status(200).json({ assets: portfolio.assets })
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
}
module.exports.getUserParticularAssets = async (req, res) => {
  try {

    const data = await portfolioModel.findOne({ user: req.user.id })
    const symbol = req.params.symbol.toUpperCase(); // normalize to uppercase
    const asset = data.assets.find(a => a.symbol === symbol);
    if (!asset) {

      res.status(200).json({
        asset: {

          quantity: 0
        }
      })

    } else {

      res.status(200).json({ asset })

    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
}
module.exports.upsertAsset = async (req, res) => {
  const { symbol, name, quantity, averageBuyPrice } = req.body;
  try {
    const portfolio = await portfolioModel.findOne({ user: req.user.id });
    const assetIndex = portfolio.assets.findIndex(a => a.symbol === symbol.toUpperCase());

    if (assetIndex !== -1) {
      // Update existing asset
      const existing = portfolio.assets[assetIndex];
      const totalQty = existing.quantity + quantity;
      const weightedAvgPrice = ((existing.quantity * existing.averageBuyPrice) + (quantity * averageBuyPrice)) / totalQty;

      existing.quantity = totalQty;
      existing.averageBuyPrice = weightedAvgPrice;
    } else {
      // Add new asset
      portfolio.assets.push({
        symbol: symbol.toUpperCase(),
        name,
        quantity,
        averageBuyPrice
      });
    }

    await portfolio.updatePrices(getStockQuote);
    await portfolio.save();
    res.status(200).json(portfolio);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add/update asset' });
  }
};
module.exports.refreshPortfolioPrices = async (req, res) => {
  try {
    const portfolio = await portfolioModel.findOne({ user: req.user.id });
    await portfolio.updatePrices(getStockQuote);
    await portfolio.save();
    res.status(200).json({ message: 'Portfolio refreshed', portfolio });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to refresh portfolio prices' });
  }
};
module.exports.getPerformanceHistory = async (req, res) => {
  try {
    const portfolio = await portfolioModel.findOne({ user: req.user.id });
    res.status(200).json({ history: portfolio.performanceHistory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch performance history' });
  }
};
module.exports.getPortfolioSummary = async (req, res) => {
  try {
    const portfolio = await portfolioModel.findOne({ user: req.user.id });
    const { totalInvestment, currentValue, totalProfitLoss, totalProfitLossPercentage } = portfolio;
    res.status(200).json({ totalInvestment, currentValue, totalProfitLoss, totalProfitLossPercentage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch portfolio summary' });
  }
};
module.exports.getPortfolioAnalytics = async (req, res) => {
  try {
    const portfolio = await portfolioModel.findOne({ user: req.user.id });

    const allocation = portfolio.assets.map(asset => ({
      symbol: asset.symbol,
      name: asset.name,
      allocation: portfolio.currentValue > 0
        ? (asset.currentValue / portfolio.currentValue) * 100
        : 0

    }));

    res.status(200).json({
      allocation,
      totalAssets: portfolio.assets.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};
module.exports.getDashboardStocks = async (req, res) => {
  try {
    const prices = await portfolioService.getCryptoTrendingPortfolio()
    res.status(200).json(prices);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stock data', error: err.message });
  }
};

module.exports.getCurrencyRates = async (req, res) => {
  const name = req.params.name.toUpperCase();
 
  try {
    const price = await portfolioService.getCurrency(name)

    res.status(201).json({ price })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching currency price', error: error.message });

  }





}