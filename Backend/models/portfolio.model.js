const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const portfolioSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assets: [{
    symbol: {
      type: String,
      required: true,
      uppercase: true
    },
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative']
    },
    averageBuyPrice: {
      type: Number,
      required: true,
      min: [0, 'Average buy price cannot be negative']
    },
    currentPrice: {
      type: Number,
      default: 0
    },
    currentValue: {
      type: Number,
      default: 0
    },
    profitLoss: {
      type: Number,
      default: 0
    },
    profitLossPercentage: {
      type: Number,
      default: 0
    }
  }],
  totalInvestment: {
    type: Number,
    default: 0
  },
  currentValue: {
    type: Number,
    default: 0
  },
  totalProfitLoss: {
    type: Number,
    default: 0
  },
  totalProfitLossPercentage: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  performanceHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    value: {
      type: Number,
      required: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Method to calculate current portfolio value
portfolioSchema.methods.calculateValue = function() {
  let totalValue = 0;
  let totalInvestment = 0;
  
  this.assets.forEach(asset => {
    const currentValue = asset.quantity * asset.currentPrice;
    const investment = asset.quantity * asset.averageBuyPrice;
    
    asset.currentValue = currentValue;
    asset.profitLoss = currentValue - investment;
    asset.profitLossPercentage = investment > 0 ? (asset.profitLoss / investment) * 100 : 0;
    
    totalValue += currentValue;
    totalInvestment += investment;
  });
  
  this.currentValue = totalValue;
  this.totalInvestment = totalInvestment;
  this.totalProfitLoss = totalValue - totalInvestment;
  this.totalProfitLossPercentage = totalInvestment > 0 ? (this.totalProfitLoss / totalInvestment) * 100 : 0;
  this.lastUpdated = Date.now();
  
  // Add current value to performance history
  this.performanceHistory.push({
    date: new Date(),
    value: totalValue
  });
  
  return this.currentValue;
};

// Method to update asset prices
portfolioSchema.methods.updatePrices = async function(getPriceFunction) {
  for (const asset of this.assets) {
    try {
      asset.currentPrice = await getPriceFunction(asset.symbol);
    } catch (error) {
      console.error(`Failed to update price for ${asset.symbol}:`, error);
    }
  }
  this.calculateValue();
};

const Portfolio = mongoose.model('Portfolio', portfolioSchema);
module.exports = Portfolio;