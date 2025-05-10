# Trading App Project - Day 25 Progress

## 🚀 Today's Achievements

Today I focused on building the user authentication system for my paper trading application. I've implemented the core user model and set up the basic authentication routes.

### 📂 Project Structure

```
TRADING_APP_PROJECT/
├── Backend/
│   ├── config/
│   ├── controllers/
│   │   └── user.controller.js
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── blacklistToken.model.js
│   │   └── user.model.js
│   ├── node_modules/
│   ├── routes/
│   │   └── user.route.js
│   ├── services/
│   │   └── user.service.js
│   ├── .env
│   ├── app.js
│   ├── package-lock.json
│   ├── package.json
│   └── server.js
```

### ✅ Completed Tasks

1. **Created User Model**
   - Designed robust schema with validation
   - Implemented secure password handling with bcrypt
   - Added JWT token generation methods
   - Set up paper trading balance functionality
   - Created user settings and role management

2. **Set Up Authentication Routes**
   - User registration with validation
   - User login with secure password comparison
   - Logout functionality
   - User profile retrieval

3. **Implemented Authentication Middleware**
   - JWT token verification
   - Route protection for authenticated users

### 💻 Code Highlights

#### User Schema

The user schema includes:
- Structured name fields with validation
- Email validation using regex
- Secure password handling (hashing and select: false)
- Starting paper trading balance
- Portfolio and trades references
- User settings and theme preferences
- Role-based authorization
- Refresh token support

#### Authentication Methods

- `generateAuthToken()`: Creates a JWT for user authentication
- `comparePassword()`: Securely compares hashed passwords
- `hashPassword()`: Static method to hash passwords on registration

#### Routes

Implemented routes with validation:
- POST `/register`: Create new user account
- POST `/login`: Authenticate and receive token
- GET `/logout`: Invalidate current token
- GET `/profile`: Retrieve authenticated user profile

### 🔍 API Validation

Used express-validator to enforce:
- Valid email format
- Minimum name length (3 characters)
- Minimum password length (6 characters)

### 📝 Next Steps

1. **Complete Remaining User Routes**
   - Profile update functionality
   - Balance management
   - Token refresh mechanism
   - User settings management

2. **Portfolio Management**
   - Create portfolio model
   - Implement stock purchase/selling
   - Portfolio performance tracking

3. **Trade System**
   - Trade execution
   - Trade history
   - Performance analytics

4. **Front-end Development**
   - Create user authentication UI
   - Dashboard with portfolio overview
   - Trading interface

### 📊 Progress Overview

- ✅ Basic project structure: 100%
- ✅ User authentication system: 60%
- ⬜ Portfolio management: 0%
- ⬜ Trading system: 0%
- ⬜ Frontend development: 0%

## 💡 Learnings & Challenges

Today I gained experience with:
- Implementing secure password handling with bcrypt
- Setting up JWT-based authentication flow
- Creating MongoDB schemas with proper validation
- Building a modular Express.js application structure

Main challenge was designing a scalable user model that can accommodate future features while maintaining security best practices.

---

Looking forward to continuing development tomorrow with focus on completing the user management system and starting on the portfolio features!

#100DaysOfCode #TradingApp #NodeJS #MongoDB #ExpressJS

# 🚀 Day 26: Trading App - User Management API

## 📝 Project Overview
Building a paper trading application using the MERN stack (MongoDB, Express, React, Node.js) that simulates real trading experiences without financial risk. Perfect for learning trading strategies and practicing investment skills.

## 🔍 Today's Progress
Today I focused on completing the core user management API routes and implementing balance management functionality. This extends the authentication system I built yesterday with additional user profile capabilities.

### ✅ Completed Features
- **User Profile Management**
  - Profile retrieval via protected route
  - Profile update with field validation
  - Theme preferences (light/dark mode)
  - Notification settings management
- **Balance Management**
  - Balance checking endpoint
  - Balance addition functionality
  - Input validation for monetary values
  - Protected endpoints requiring authentication

## 📂 Project Structure
```
TRADING_APP_PROJECT/
├── Backend/
│   ├── config/
│   ├── controllers/
│   │   └── user.controller.js
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── blacklistToken.model.js
│   │   └── user.model.js
│   ├── routes/
│   │   └── user.route.js
│   ├── services/
│   │   └── user.service.js
│   ├── app.js
│   ├── server.js
```

## 💻 Code Implementation Details

### 📌 User Routes Implementation
```javascript
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const userController = require('../controllers/user.controller')
const authMiddleware= require('../middlewares/auth.middleware')

// Authentication routes
router.post('/register', [
    body("email").isEmail().withMessage('Invalid Email'),
    body('fullname.firstname').isLength({ min: 3 }).withMessage('First name must be at least 3 charater long'),
    body('password').isLength({ min: 6 }).withMessage('Password must be 6 Charater long')
], userController.registerUser)

router.post('/login', [
    body("email").isEmail().withMessage('Invalid Email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be 6 Charater long')
], userController.loginUser)

router.get('/logout', authMiddleware.authUser, userController.logoutUser)

// Profile management routes
router.get('/profile', authMiddleware.authUser, userController.getUserProfile)

router.put('/profile', [
    body('fullname.firstname').isLength({ min: 3 }).withMessage('First name must be at least 3 charater long'),
    body('settings.notifications').isBoolean().withMessage('Notifications must be a boolean').toBoolean(),
    body('settings.theme').isIn(["light","dark"]).withMessage('Invalid notification set'),
], authMiddleware.authUser, userController.updateUserProfile)

// Balance management routes
router.get('/balance', authMiddleware.authUser, userController.getUserBalance)

router.put('/balance', 
    body("balance").isInt().withMessage('Invalid amount'), 
    authMiddleware.authUser, 
    userController.addUserBalance
)

// Future routes (commented out for future implementation)
// router.post('/refresh-token', authMiddleware.authUser, userController.refreshUserToken)
// router.get('/settings', authMiddleware.authUser, userController.getUserSettings)
// router.put('/settings', authMiddleware.authUser, userController.updateUserSettings)

module.exports = router;
```

### 📌 User Profile Controller Methods
```javascript
module.exports.updateUserProfile = async (req, res) => {
    const error = validationResult(req)
    
    if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() });
    }
    const { fullname, settings } = req.body;
    
    try {
        const updatedUser = await userModel.findByIdAndUpdate(
            req.user.id,
            {
                fullname: {
                    firstname: fullname.firstname,
                    lastname: fullname.lastname,
                },
                settings: {
                    notifications: settings.notifications,
                    theme: settings.theme
                }
            },
            { new: true })
        
        res.status(200).json({ updatedUser })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
}
```

### 📌 Balance Management Controller Methods
```javascript
module.exports.getUserBalance = async (req, res) => {
    try {
        res.status(200).json({ balance: req.user.balance })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
}

module.exports.addUserBalance = async (req, res) => {
    const error = validationResult(req)
    
    if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() });
    }
    const { balance } = req.body
    try {
        const updatedBalance = await userModel.findByIdAndUpdate(req.user.id,
           { balance},
           {new:true}
        )
        res.status(200).json({ balance: updatedBalance.balance })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
}
```

## 🌟 Key Features
- **Robust Input Validation**: Using express-validator to ensure data integrity
- **Protected Routes**: Authentication middleware securing sensitive endpoints
- **User Settings**: Supporting theme preferences and notification settings
- **Clean Architecture**: Controller-based approach for separation of concerns
- **Error Handling**: Consistent error responses across all endpoints

## 📈 Progress Overview
- ✅ Project Structure: 100%
- ✅ Authentication System: 90%
- ✅ User Profile Management: 80% 
- ✅ Balance Management: 70%
- ⬜ Portfolio Management: 0%
- ⬜ Trading System: 0%
- ⬜ Frontend Development: 0%

## 🔮 Next Steps
1. **Complete Token Management**
   - Implement refresh token mechanism
   - Add token blacklisting for additional security

2. **Begin Portfolio Development**
   - Create portfolio schema
   - Implement stock purchasing functionality
   - Connect with external API for market data

3. **Trading System Implementation**
   - Build trade execution endpoints
   - Develop trade history tracking
   - Implement performance analytics

## 💡 Reflections
Today's work reinforced the importance of proper input validation and secure route protection. Building the balance management system required careful consideration of data integrity concerns that will be critical for the trading functionality ahead.

The modular approach I've taken with controllers and middlewares is already paying dividends in terms of code organization and maintainability.

## 🛠️ Technologies Used
- **Express.js**: Web framework
- **MongoDB**: Database (via Mongoose)
- **express-validator**: Input validation
- **JWT**: Authentication tokens
- **bcrypt**: Password hashing

## 📚 Learning Resources
- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [JWT Authentication Best Practices](https://auth0.com/blog/authentication-best-practices-for-node-js/)

---

#100DaysOfCoding #Day26 #MERN #NodeJS #Express #MongoDB #WebDevelopment #TradingApp #Authentication

# 🚀 Day 27: Trading App - Portfolio Management System

## 📝 Project Overview
A full-stack paper trading application built with the MERN stack that allows users to practice trading strategies with virtual money. The app provides real-time market data and portfolio tracking without financial risk.

## 🔍 Today's Progress
Today I focused on developing the portfolio management system, which forms the core of the trading application. I created a robust portfolio model, planned API endpoints, and tested integration with the Finnhub API for real-time market data.

### ✅ Completed Tasks
- **Portfolio Model Creation**
  - Designed comprehensive schema with asset tracking
  - Implemented methods for calculating portfolio value
  - Added performance history tracking
  - Created automated price update functionality
- **API Route Planning**
  - Designed comprehensive endpoint structure
  - Planned admin and user-specific routes
  - Outlined asset management functions
  - Structured analytics endpoints
- **External API Integration**
  - Successfully connected to Finnhub API
  - Tested real-time market data retrieval
  - Verified data format compatibility
  - Planned Socket.io integration for live updates

## 💻 Code Implementation Details

### 📊 Portfolio Schema
```javascript
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
```

### 📈 Portfolio Methods
```javascript
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
```

### 🔌 API Integration Test
```javascript
const axios = require('axios');

// Replace with your actual API key
const API_KEY = process.env.FINNHUB_API;
const SYMBOL = 'BINANCE:BTCUSDT'; // Example stock symbol

async function getStockQuote(symbol) {
  try {
    const response = await axios.get(`https://finnhub.io/api/v1/quote`, {
      params: {
        symbol,
        token: API_KEY
      }
    });
    
    console.log(`Stock quote for ${symbol}:`, response.data);
  } catch (error) {
    console.error('Error fetching stock quote:', error.message);
  }
}

getStockQuote(SYMBOL);
```

### 🛣️ Planned API Routes
```javascript
// GET /api/portfolios - Get all portfolios (admin only)
// GET /api/portfolios/me - Get current user's portfolio
// POST /api/portfolios - Create a new portfolio (if not created automatically with user)
// PUT /api/portfolios/me - Update portfolio metadata (like name, settings)
// GET /api/portfolios/me/assets - Get all assets in user's portfolio
// GET /api/portfolios/me/assets/:symbol - Get details of a specific asset
// PUT /api/portfolios/me/refresh - Refresh all asset prices in the portfolio
// GET /api/portfolios/me/performance - Get historical performance data
// GET /api/portfolios/me/summary - Get portfolio summary (totals, allocation)
// GET /api/portfolios/me/analytics - Get detailed portfolio analytics (diversification, risk)
```

## 🌟 Key Features
- **Real-time Value Calculation**: Automatic updates of portfolio and asset values
- **Performance Tracking**: Historical data points for visualizing growth over time
- **Detailed Asset Management**: Comprehensive tracking of individual investments
- **Profit/Loss Calculations**: Automatic calculations at both portfolio and asset levels
- **External API Integration**: Live market data from Finnhub

## 📈 Progress Overview
- ✅ Project Structure: 100%
- ✅ Authentication System: 90%
- ✅ User Profile Management: 90%
- ✅ Portfolio Model: 100%
- ⬜ Portfolio API Routes: 10% (planned)
- ⬜ Real-time Updates: 20% (API tested)
- ⬜ Trading System: 0%
- ⬜ Frontend Development: 0%

## 🔮 Next Steps
1. **Implement Portfolio API Endpoints**
   - Create controllers for all planned routes
   - Implement portfolio creation logic
   - Build asset management functionality

2. **Socket.io Integration**
   - Set up WebSocket connections
   - Implement real-time price updates
   - Create price change notifications

3. **Trading System Development**
   - Design trade execution flow
   - Implement buy/sell functionality
   - Create order history tracking

4. **Begin Frontend Development**
   - Design portfolio dashboard
   - Create assets listing view
   - Build performance charts

## 💡 Reflections
Today's work on the portfolio model highlighted the complexity of financial data management. Creating methods that automatically calculate derived values (like profit/loss percentages) will greatly simplify frontend development later.

The Finnhub API integration test was successful, confirming we'll be able to provide real-time market data. Adding Socket.io will enhance the experience with live updates without requiring constant API calls.

The portfolio schema design required careful consideration of performance optimization, especially for tracking historical data points that will grow over time.

## 🛠️ Technologies Used
- **MongoDB/Mongoose**: Database and schema modeling
- **Express.js**: API framework
- **Node.js**: Runtime environment
- **Finnhub API**: Market data provider
- **Socket.io**: (Planned) Real-time updates
- **Axios**: HTTP client for API requests

## 📚 Learning Resources
- [Finnhub API Documentation](https://finnhub.io/docs/api)
- [Socket.io Documentation](https://socket.io/docs/v4)
- [Mongoose Schema Design Best Practices](https://mongoosejs.com/docs/guide.html)

---

#100DaysOfCoding #Day27 #MERN #NodeJS #MongoDB #FinTech #TradingApp #PortfolioManagement #WebDevelopment #API