
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pendingTradeSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
  action: {
    type: String,
    enum: ['buy', 'sell'],
    required: true
  },
  symbol: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  condition: {
    type: String,
    
    required: true
  },
  orderType: {
    type: String,
    enum: ['market', 'limit', 'stop','conditional'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  assetName: {
    type: String,
    required: true
  },
  riskProfile: {
    type: String,
    enum: ['low', 'moderate', 'high'],
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED'],
    default: 'PENDING'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PendingTrade', pendingTradeSchema);
