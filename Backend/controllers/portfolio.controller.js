const { validationResult } = require('express-validator');
// const portfolioModel = require('../models/portfolio.model');
const portfolioService = require('../services/portfolio.service.js');
const portfolioModal = require('../models/portfolio.model.js');


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

        const portfolio = await portfolioModal.find({})
        res.status(200).json(portfolio)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
}
module.exports.getUserAssets = async (req, res) => {

    try {
        const portfolio = await portfolioModal.findOne({ user: req.user.id })

        res.status(200).json({ assets: portfolio.assets })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
}
module.exports.getUserParticularAssets = async (req, res) => {
    try {

        const data = await portfolioModal.findOne({ user: req.user.id })
        const symbol = req.params.symbol.toUpperCase(); // normalize to uppercase
        const asset = data.assets.find(a => a.symbol === symbol);
        res.status(200).json({ asset })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
}