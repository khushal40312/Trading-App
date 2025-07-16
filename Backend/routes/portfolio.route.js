
const express = require('express');

const router = express.Router();
const portfolioController = require('../controllers/portfolio.controller')
const authMiddleware = require('../middlewares/auth.middleware')



router.get('/me', authMiddleware.authUser, portfolioController.getPortfolio)
router.get('/all', authMiddleware.authUser, portfolioController.getPortfolios)
router.get('/assets',authMiddleware.authUser,portfolioController.getUserAssets)
router.get('/assets/:symbol',authMiddleware.authUser,portfolioController.getUserParticularAssets)
router.put('/me/refresh', authMiddleware.authUser, portfolioController.refreshPortfolioPrices)
router.get('/me/performance', authMiddleware.authUser, portfolioController.getPerformanceHistory)
router.get('/me/summary', authMiddleware.authUser, portfolioController.getPortfolioSummary)
router.get('/me/analytics', authMiddleware.authUser, portfolioController.getPortfolioAnalytics)
router.get('/dashboard-stocks',authMiddleware.authUser, portfolioController.getDashboardStocks);
module.exports = router;
