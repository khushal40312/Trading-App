
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const portfolioController = require('../controllers/portfolio.controller')
const authMiddleware = require('../middlewares/auth.middleware')



router.get('/me', authMiddleware.authUser, portfolioController.getPortfolio)
router.get('/all', authMiddleware.authUser, portfolioController.getPortfolios)
router.get('/assets',authMiddleware.authUser,portfolioController.getUserAssets)
router.get('/assets/:symbol',authMiddleware.authUser,portfolioController.getUserParticularAssets)



// PUT /api/portfolios/me/refresh - Refresh all asset prices in the portfolio
// GET /api/portfolios/me/performance - Get historical performance data
// GET /api/portfolios/me/summary - Get portfolio summary (totals, allocation)
// GET /api/portfolios/me/analytics - Get detailed portfolio analytics (diversification, risk)
module.exports = router;
