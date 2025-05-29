// POST /api/trades/buy - Execute a buy order
// POST /api/trades/sell - Execute a sell order
// GET /api/trades/me - Get current user's trade history (with pagination)
// GET /api/trades/me/:id - Get specific trade details
// GET /api/trades/me/symbol/:symbol - Get trades for a specific asset
// PUT /api/trades/me/:id/cancel - Cancel a pending trade
// GET /api/trades/me/stats - Get trading statistics (total trades, profit/loss, etc.)
// GET /api/trades/me/recent - Get recent trades (last 10-20 trades)
// GET /api/trades - Get all trades (admin only)

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


module.exports = router;
