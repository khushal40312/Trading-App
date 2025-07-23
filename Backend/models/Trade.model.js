const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tradeSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  portfolio: {
    type: Schema.Types.ObjectId,
    ref: 'Portfolio',
    required: true
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true
  },
  assetName: {
    type: String,
    required: true
  },
  imageURL: {
    thumb: {
      type: String
    },
    small: {
      type: String

    },
    large: {
      type: String

    }
  },
  tradeType: {
    type: String,
    enum: ['buy', 'sell'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [0.0001, 'Quantity must be greater than 0']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price must be greater than 0']
  },
  totalAmount: {
    type: Number,

  },
  fees: {
    type: Number,
    default: 0
  },
  netAmount: {
    type: Number,

  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  executedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: 500
  },
  marketData: {
    marketPrice: {
      type: Number
    },
    priceChange24h: {
      type: Number
    },
    volume: {
      type: Number
    }
  }
});

// Calculate total and net amounts before saving
tradeSchema.pre('save', function (next) {
  this.totalAmount = this.quantity * this.price;
  this.netAmount = this.totalAmount + (this.tradeType === 'buy' ? this.fees : -this.fees);
  next();
});

// Method to execute the trade
tradeSchema.methods.execute = function () {
  this.status = 'completed';
  this.executedAt = new Date();
  return this.save();
};

// Method to cancel the trade
tradeSchema.methods.cancel = function () {
  if (this.status === 'pending') {
    this.status = 'cancelled';
    return this.save();
  }
  throw new Error('Cannot cancel a trade that is not pending');
};

// Static method to get user's trade history
tradeSchema.statics.getUserTrades = function (userId, limit = 20, page = 1) {
  const skip = (page - 1) * limit;
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('portfolio', 'currentValue totalProfitLoss');
};

// Static method to get trades by symbol
tradeSchema.statics.getTradesBySymbol = function (userId, symbol) {
  return this.find({
    user: userId,
    symbol: symbol.toUpperCase(),
    status: 'completed'
  }).sort({ executedAt: -1 });
};

const Trade = mongoose.model('Trade', tradeSchema);
module.exports = Trade;