
// GET /api/trades/me/symbol/:symbol - Get trades for a specific asset
// PUT /api/trades/me/:id/cancel - Cancel a pending trade
// GET /api/trades/me/stats - Get trading statistics (total trades, profit/loss, etc.)
// GET /api/trades/me/recent - Get recent trades (last 10-20 trades)
// GET /api/trades - Get all trades (admin only)

const { query } = require('express-validator');
const { body } = require('express-validator');
const express = require('express');
const router = express.Router();
const tradeController = require('../controllers/trade.controller')
const authMiddleware = require('../middlewares/auth.middleware')


router.post(
  '/buy',
  [
    body('symbol')
      .isUppercase()
      .isString()
      .notEmpty()
      .withMessage('Symbol must be an uppercase string.'),

    body('assetName')
      .isString()
      .isLength({ min: 3 })
      .withMessage('Asset name must be at least 3 characters long.'),

    body('quantity')
      .isNumeric()
      .custom(value => value > 0)
      .withMessage('Quantity must be a positive number.'),

    body('price')
      .isNumeric()
      .custom(value => value > 0)
      .withMessage('Price must be a positive number.')
  ],
  authMiddleware.authUser,
  tradeController.buyAssets
);

router.post(
  '/sell',
  [
    body('symbol')
      .isUppercase()
      .isString()
      .notEmpty()
      .withMessage('Symbol must be an uppercase string.'),

    body('assetName')
      .isString()
      .isLength({ min: 3 })
      .withMessage('Asset name must be at least 3 characters long.'),

    body('quantity')
      .isNumeric()
      .custom(value => value > 0)
      .withMessage('Quantity must be a positive number.'),

    body('price')
      .isNumeric()
      .custom(value => value > 0)
      .withMessage('Price must be a positive number.')
  ],
  authMiddleware.authUser,
  tradeController.sellAssets
);

router.get(
  '/me',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer.'),

    query('limit')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Limit must be a positive integer.'),

    query('status')
      .optional()
      .isIn(['completed', 'pending', 'cancelled'])
      .withMessage('Status must be one of: completed, pending, cancelled.'),

    query('tradeType')
      .optional()
      .isIn(['buy', 'sell'])
      .withMessage('Trade type must be either "buy" or "sell".'),

    query('symbol')
      .optional()
      .isUppercase()
      .isString()
      .notEmpty()
      .withMessage('Symbol must be an uppercase string.'),

    query('sortBy')
      .optional()
      .isIn(['createdAt', 'price', 'quantity'])
      .withMessage('SortBy must be one of: createdAt, price, quantity.'),

    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('SortOrder must be either "asc" or "desc".')
  ],
  authMiddleware.authUser,
  tradeController.getMyTrades
);
router.get('/me/pendingtrades', authMiddleware.authUser, tradeController.getAllPendingTrades)// admin
router.delete('/me/cancelPendingTrade/:id', authMiddleware.authUser, tradeController.cancelPendingTrades)
router.get('/me/all', authMiddleware.authUser, tradeController.getAllTrades)// admin
router.get('/me/stats', authMiddleware.authUser, tradeController.getMyTradingStats)
router.get('/me/symbol/:symbol', authMiddleware.authUser, tradeController.getMyTradesBySymbol)
router.put('/me/:id/cancel', authMiddleware.authUser, tradeController.cancelPendingTrade)
router.get('/me/:id', authMiddleware.authUser, tradeController.getMyTradesById)
router.get('/get-suggestions', tradeController.getSuggetions)
router.get('/geko/candles/:coingeckoId', authMiddleware.authUser, tradeController.getCandlesfromGeko)
router.get('/bitget/candles/:symbol', authMiddleware.authUser, tradeController.getCandlesfromBitget)






module.exports = router;
