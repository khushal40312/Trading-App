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
const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Authentication routes
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("fullname.firstname")
      .isLength({ min: 3 })
      .withMessage("First name must be at least 3 charater long"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be 6 Charater long"),
  ],
  userController.registerUser
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be 6 Charater long"),
  ],
  userController.loginUser
);

router.get("/logout", authMiddleware.authUser, userController.logoutUser);

// Profile management routes
router.get("/profile", authMiddleware.authUser, userController.getUserProfile);

router.put(
  "/profile",
  [
    body("fullname.firstname")
      .isLength({ min: 3 })
      .withMessage("First name must be at least 3 charater long"),
    body("settings.notifications")
      .isBoolean()
      .withMessage("Notifications must be a boolean")
      .toBoolean(),
    body("settings.theme")
      .isIn(["light", "dark"])
      .withMessage("Invalid notification set"),
  ],
  authMiddleware.authUser,
  userController.updateUserProfile
);

// Balance management routes
router.get("/balance", authMiddleware.authUser, userController.getUserBalance);

router.put(
  "/balance",
  body("balance").isInt().withMessage("Invalid amount"),
  authMiddleware.authUser,
  userController.addUserBalance
);

// Future routes (commented out for future implementation)
// router.post('/refresh-token', authMiddleware.authUser, userController.refreshUserToken)
// router.get('/settings', authMiddleware.authUser, userController.getUserSettings)
// router.put('/settings', authMiddleware.authUser, userController.updateUserSettings)

module.exports = router;
```

### 📌 User Profile Controller Methods

```javascript
module.exports.updateUserProfile = async (req, res) => {
  const error = validationResult(req);

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
          theme: settings.theme,
        },
      },
      { new: true }
    );

    res.status(200).json({ updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
```

### 📌 Balance Management Controller Methods

```javascript
module.exports.getUserBalance = async (req, res) => {
  try {
    res.status(200).json({ balance: req.user.balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports.addUserBalance = async (req, res) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.status(400).json({ error: error.array() });
  }
  const { balance } = req.body;
  try {
    const updatedBalance = await userModel.findByIdAndUpdate(
      req.user.id,
      { balance },
      { new: true }
    );
    res.status(200).json({ balance: updatedBalance.balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
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
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const portfolioSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  assets: [
    {
      symbol: {
        type: String,
        required: true,
        uppercase: true,
      },
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: [0, "Quantity cannot be negative"],
      },
      averageBuyPrice: {
        type: Number,
        required: true,
        min: [0, "Average buy price cannot be negative"],
      },
      currentPrice: {
        type: Number,
        default: 0,
      },
      currentValue: {
        type: Number,
        default: 0,
      },
      profitLoss: {
        type: Number,
        default: 0,
      },
      profitLossPercentage: {
        type: Number,
        default: 0,
      },
    },
  ],
  totalInvestment: {
    type: Number,
    default: 0,
  },
  currentValue: {
    type: Number,
    default: 0,
  },
  totalProfitLoss: {
    type: Number,
    default: 0,
  },
  totalProfitLossPercentage: {
    type: Number,
    default: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  performanceHistory: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      value: {
        type: Number,
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
```

### 📈 Portfolio Methods

```javascript
// Method to calculate current portfolio value
portfolioSchema.methods.calculateValue = function () {
  let totalValue = 0;
  let totalInvestment = 0;

  this.assets.forEach((asset) => {
    const currentValue = asset.quantity * asset.currentPrice;
    const investment = asset.quantity * asset.averageBuyPrice;

    asset.currentValue = currentValue;
    asset.profitLoss = currentValue - investment;
    asset.profitLossPercentage =
      investment > 0 ? (asset.profitLoss / investment) * 100 : 0;

    totalValue += currentValue;
    totalInvestment += investment;
  });

  this.currentValue = totalValue;
  this.totalInvestment = totalInvestment;
  this.totalProfitLoss = totalValue - totalInvestment;
  this.totalProfitLossPercentage =
    totalInvestment > 0 ? (this.totalProfitLoss / totalInvestment) * 100 : 0;
  this.lastUpdated = Date.now();

  // Add current value to performance history
  this.performanceHistory.push({
    date: new Date(),
    value: totalValue,
  });

  return this.currentValue;
};

// Method to update asset prices
portfolioSchema.methods.updatePrices = async function (getPriceFunction) {
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
const axios = require("axios");

// Replace with your actual API key
const API_KEY = process.env.FINNHUB_API;
const SYMBOL = "BINANCE:BTCUSDT"; // Example stock symbol

async function getStockQuote(symbol) {
  try {
    const response = await axios.get(`https://finnhub.io/api/v1/quote`, {
      params: {
        symbol,
        token: API_KEY,
      },
    });

    console.log(`Stock quote for ${symbol}:`, response.data);
  } catch (error) {
    console.error("Error fetching stock quote:", error.message);
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

# 🚀 Day 28: Trading App - Portfolio API Controllers

## 📝 Project Overview

Building a comprehensive paper trading application using the MERN stack that enables users to practice trading strategies with virtual money. The app provides real-time market data integration and detailed portfolio tracking without financial risk.

## 🔍 Today's Progress

Today I focused on implementing the portfolio API controllers that bridge the portfolio model with the frontend application. These controllers handle portfolio retrieval, asset management, and provide the foundation for portfolio operations.

### ✅ Completed Tasks

- **Portfolio Controller Implementation**
  - User-specific portfolio retrieval
  - Admin portfolio overview functionality
  - User asset listing with detailed information
  - Error handling for all endpoints
- **Route Configuration**
  - Protected endpoints with authentication middleware
  - RESTful API structure following best practices
  - Clean separation between user and admin routes
- **Service Layer Integration**
  - Connected controllers with portfolio service layer
  - Maintained separation of concerns architecture

## 💻 Code Implementation Details

### 📊 Portfolio Controllers

```javascript
const { validationResult } = require("express-validator");
const portfolioService = require("../services/portfolio.service.js");
const Portfolio = require("../models/portfolio.model.js");

module.exports.getPortfolio = async (req, res, next) => {
  try {
    const portfolio = await portfolioService.findPortfolio(req.user.id);
    res.status(200).json(portfolio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports.getPortfolios = async (req, res) => {
  try {
    const portfolio = await Portfolio.find({});
    res.status(200).json(portfolio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports.getUserAssets = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user.id });
    console.log(portfolio.assets);

    res.status(200).json({ assets: portfolio.assets });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
```

### 🛣️ API Routes

```javascript
router.get("/me", authMiddleware.authUser, portfolioController.getPortfolio);
router.get("/all", authMiddleware.authUser, portfolioController.getPortfolios);
router.get(
  "/assets",
  authMiddleware.authUser,
  portfolioController.getUserAssets
);
```

## 📂 Project Structure Update

```
TRADING_APP_PROJECT/
├── Backend/
│   ├── config/
│   ├── controllers/
│   │   ├── user.controller.js
│   │   └── portfolio.controller.js ✨ NEW
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── blacklistToken.model.js
│   │   ├── user.model.js
│   │   └── portfolio.model.js
│   ├── routes/
│   │   ├── user.route.js
│   │   └── portfolio.route.js ✨ NEW
│   ├── services/
│   │   ├── user.service.js
│   │   └── portfolio.service.js ✨ NEW
│   ├── app.js
│   ├── server.js
```

## 🌟 Key Features Implemented

- **User Portfolio Retrieval**: Secure endpoint to fetch authenticated user's portfolio
- **Admin Portfolio Overview**: Administrative endpoint to view all portfolios
- **Asset Management**: Dedicated endpoint for retrieving user's assets with detailed information
- **Service Layer Architecture**: Proper separation between controllers and business logic
- **Error Handling**: Consistent error responses across all endpoints
- **Authentication Protection**: All routes secured with JWT middleware

## 📈 API Endpoints Overview

### 🔒 Protected User Routes

| Method | Endpoint                 | Description                  | Auth Required |
| ------ | ------------------------ | ---------------------------- | ------------- |
| `GET`  | `/api/portfolios/me`     | Get current user's portfolio | ✅            |
| `GET`  | `/api/portfolios/assets` | Get user's assets list       | ✅            |
| `GET`  | `/api/portfolios/all`    | Get all portfolios (admin)   | ✅            |

### 📊 Response Examples

```javascript
// GET /me - Portfolio Response
{
  "user": "user_id",
  "assets": [...],
  "totalInvestment": 10000,
  "currentValue": 10500,
  "totalProfitLoss": 500,
  "totalProfitLossPercentage": 5.0,
  "lastUpdated": "2024-01-15T10:30:00Z",
  "performanceHistory": [...]
}

// GET /assets - Assets Response
{
  "assets": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "quantity": 10,
      "averageBuyPrice": 150.00,
      "currentPrice": 155.00,
      "currentValue": 1550.00,
      "profitLoss": 50.00,
      "profitLossPercentage": 3.33
    }
  ]
}
```

## 📈 Progress Overview

- ✅ Project Structure: 100%
- ✅ Authentication System: 95%
- ✅ User Profile Management: 90%
- ✅ Portfolio Model: 100%
- ✅ Portfolio API Controllers: 40%
- ⬜ Real-time Updates: 20%
- ⬜ Trading System: 0%
- ⬜ Frontend Development: 0%

## 🔮 Next Steps

1. **Complete Portfolio API**

   - Implement portfolio refresh functionality
   - Add portfolio summary endpoint
   - Create performance analytics endpoint
   - Build portfolio update capabilities

2. **Enhanced Error Handling**

   - Add specific error codes
   - Implement better validation responses
   - Create portfolio-not-found handling

3. **Real-time Features**

   - Integrate Socket.io for live updates
   - Implement price streaming
   - Add portfolio value notifications

4. **Trading System Development**
   - Create buy/sell order controllers
   - Implement trade execution logic
   - Build trade history tracking

## 💡 Reflections

Today's work on the portfolio controllers reinforced the importance of a clean service layer architecture. By keeping the controllers thin and delegating business logic to services, the code remains maintainable and testable.

The asset retrieval functionality will be crucial for the frontend dashboard, providing all the necessary data for portfolio visualization and individual asset tracking.

Error handling consistency across all endpoints ensures a reliable API experience, which is essential for a financial application where data integrity is paramount.

## 🛠️ Technologies Used

- **Express.js**: Web framework and routing
- **MongoDB/Mongoose**: Database operations
- **JWT**: Authentication middleware
- **express-validator**: Input validation
- **Node.js**: Runtime environment

## 🔧 Testing the API

```bash
# Get user portfolio
GET /api/portfolios/me
Authorization: Bearer <jwt_token>

# Get user assets
GET /api/portfolios/assets
Authorization: Bearer <jwt_token>

# Get all portfolios (admin)
GET /api/portfolios/all
Authorization: Bearer <jwt_token>
```

## 📚 Learning Resources

- [Express.js Controller Patterns](https://expressjs.com/en/guide/routing.html)
- [RESTful API Design Best Practices](https://restfulapi.net/)
- [Error Handling in Express.js](https://expressjs.com/en/guide/error-handling.html)

---

#100DaysOfCoding #Day28 #MERN #NodeJS #Express #MongoDB #TradingApp #API #Controllers #PortfolioManagement

# day 29

---

## 📈 GET `/:symbol` - Fetch Asset by Symbol

### Description

This route retrieves asset information from the user's portfolio based on the provided asset symbol (e.g., `AAPL`, `GOOGL`, `TSLA`).

---

### 🔗 Endpoint

GET /:symbol

### 🔧 URL Parameters

| Param  | Type   | Description                             |
| ------ | ------ | --------------------------------------- |
| symbol | string | Ticker symbol of the asset (e.g., AAPL) |

---

### ✅ Example Request

---

GET /AAPL

### 📦 Example Response

```json
{
  "symbol": "AAPL",
  "quantity": 10,
  "currentPrice": 175
}
{
  "error": "Asset with symbol 'XYZ' not found."
}
```

# 💡 Notes

- The symbol parameter is case-insensitive.

- This route currently uses in-memory mock data. For production, integrate with a database like MongoDB.

# Day 30: Trading App - Complete Portfolio Management & Trade Schema

## Project Overview

Paper trading application built with MERN stack allowing users to practice trading strategies with virtual money and real-time market data.

## Today's Progress

Completed the portfolio management system with advanced controllers and created a comprehensive trade schema for upcoming trading functionality.

## Completed Portfolio Controllers

### Asset Management

```javascript
module.exports.upsertAsset = async (req, res) => {
  const { symbol, name, quantity, averageBuyPrice } = req.body;
  try {
    const portfolio = await portfolioModel.findOne({ user: req.user.id });
    const assetIndex = portfolio.assets.findIndex(
      (a) => a.symbol === symbol.toUpperCase()
    );
    if (assetIndex !== -1) {
      // Update existing asset with weighted average calculation
      const existing = portfolio.assets[assetIndex];
      const totalQty = existing.quantity + quantity;
      const weightedAvgPrice =
        (existing.quantity * existing.averageBuyPrice +
          quantity * averageBuyPrice) /
        totalQty;

      existing.quantity = totalQty;
      existing.averageBuyPrice = weightedAvgPrice;
    } else {
      // Add new asset
      portfolio.assets.push({
        symbol: symbol.toUpperCase(),
        name,
        quantity,
        averageBuyPrice,
      });
    }

    await portfolio.updatePrices(getStockQuote);
    await portfolio.save();
    res.status(200).json(portfolio);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add/update asset" });
  }
};
```

### Portfolio Operations

```javascript
module.exports.refreshPortfolioPrices = async (req, res) => {
  try {
    const portfolio = await portfolioModel.findOne({ user: req.user.id });
    await portfolio.updatePrices(getStockQuote);
    await portfolio.save();
    res.status(200).json({ message: "Portfolio refreshed", portfolio });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to refresh portfolio prices" });
  }
};

module.exports.getPerformanceHistory = async (req, res) => {
  try {
    const portfolio = await portfolioModel.findOne({ user: req.user.id });
    res.status(200).json({ history: portfolio.performanceHistory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch performance history" });
  }
};

module.exports.getPortfolioSummary = async (req, res) => {
  try {
    const portfolio = await portfolioModel.findOne({ user: req.user.id });
    const {
      totalInvestment,
      currentValue,
      totalProfitLoss,
      totalProfitLossPercentage,
    } = portfolio;
    res
      .status(200)
      .json({
        totalInvestment,
        currentValue,
        totalProfitLoss,
        totalProfitLossPercentage,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch portfolio summary" });
  }
};

module.exports.getPortfolioAnalytics = async (req, res) => {
  try {
    const portfolio = await portfolioModel.findOne({ user: req.user.id });

    const allocation = portfolio.assets.map((asset) => ({
      symbol: asset.symbol,
      name: asset.name,
      allocation: (asset.currentValue / portfolio.currentValue) * 100,
    }));

    res.status(200).json({
      allocation,
      totalAssets: portfolio.assets.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};
```

## Trade Schema Design

### Schema Structure

```javascript
const tradeSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  portfolio: {
    type: Schema.Types.ObjectId,
    ref: "Portfolio",
    required: true,
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true,
  },
  assetName: {
    type: String,
    required: true,
  },
  tradeType: {
    type: String,
    enum: ["buy", "sell"],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [0.0001, "Quantity must be greater than 0"],
  },
  price: {
    type: Number,
    required: true,
    min: [0, "Price must be greater than 0"],
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  fees: {
    type: Number,
    default: 0,
  },
  netAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "cancelled"],
    default: "pending",
  },
  executedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    maxlength: 500,
  },
  marketData: {
    marketPrice: {
      type: Number,
    },
    priceChange24h: {
      type: Number,
    },
    volume: {
      type: Number,
    },
  },
});
```

### Trade Methods

```javascript
// Calculate total and net amounts before saving
tradeSchema.pre("save", function (next) {
  this.totalAmount = this.quantity * this.price;
  this.netAmount =
    this.totalAmount + (this.tradeType === "buy" ? this.fees : -this.fees);
  next();
});

// Method to execute the trade
tradeSchema.methods.execute = function () {
  this.status = "completed";
  this.executedAt = new Date();
  return this.save();
};

// Method to cancel the trade
tradeSchema.methods.cancel = function () {
  if (this.status === "pending") {
    this.status = "cancelled";
    return this.save();
  }
  throw new Error("Cannot cancel a trade that is not pending");
};

// Static method to get user's trade history
tradeSchema.statics.getUserTrades = function (userId, limit = 20, page = 1) {
  const skip = (page - 1) * limit;
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate("portfolio", "currentValue totalProfitLoss");
};

// Static method to get trades by symbol
tradeSchema.statics.getTradesBySymbol = function (userId, symbol) {
  return this.find({
    user: userId,
    symbol: symbol.toUpperCase(),
    status: "completed",
  }).sort({ executedAt: -1 });
};
```

## Implemented API Routes

### Portfolio Routes

```javascript
router.put(
  "/me/refresh",
  authMiddleware.authUser,
  portfolioController.refreshPortfolioPrices
);
router.get(
  "/me/performance",
  authMiddleware.authUser,
  portfolioController.getPerformanceHistory
);
router.get(
  "/me/summary",
  authMiddleware.authUser,
  portfolioController.getPortfolioSummary
);
router.get(
  "/me/analytics",
  authMiddleware.authUser,
  portfolioController.getPortfolioAnalytics
);
```

## Complete API Endpoint Structure

### User Management

- `POST /api/users/register` - User registration
- `POST /api/users/login` - User authentication
- `GET /api/users/logout` - User logout
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/balance` - Get user balance
- `PUT /api/users/balance` - Update user balance

### Portfolio Management

- `GET /api/portfolios/me` - Get user portfolio
- `GET /api/portfolios/all` - Get all portfolios (admin)
- `GET /api/portfolios/assets` - Get user assets
- `PUT /api/portfolios/me/refresh` - Refresh portfolio prices
- `GET /api/portfolios/me/performance` - Get performance history
- `GET /api/portfolios/me/summary` - Get portfolio summary
- `GET /api/portfolios/me/analytics` - Get portfolio analytics

### Trade Management (Planned)

- `POST /api/trades` - Execute new trade
- `GET /api/trades` - Get user trade history
- `GET /api/trades/:id` - Get specific trade details
- `PUT /api/trades/:id/cancel` - Cancel pending trade
- `GET /api/trades/symbol/:symbol` - Get trades by symbol

## Key Features Implemented

- **Weighted Average Calculation**: Proper asset cost basis tracking
- **Real-time Price Updates**: Integration with external market data
- **Performance Tracking**: Historical portfolio value tracking
- **Portfolio Analytics**: Asset allocation and diversification metrics
- **Trade Management**: Comprehensive trade schema with status tracking
- **Error Handling**: Consistent error responses across all endpoints

## Progress Overview

- ✅ Project Structure: 100%
- ✅ Authentication System: 95%
- ✅ User Profile Management: 90%
- ✅ Portfolio Model: 100%
- ✅ Portfolio API Controllers: 90%
- ✅ Trade Schema: 100%
- ⬜ Trade Controllers: 0%
- ⬜ Real-time Updates: 20%
- ⬜ Frontend Development: 0%

## Next Steps

1. Implement trade execution controllers
2. Build buy/sell order processing
3. Create trade history endpoints
4. Add Socket.io for real-time updates
5. Begin frontend development

## Project Structure

```
TRADING_APP_PROJECT/
├── Backend/
│   ├── controllers/
│   │   ├── user.controller.js
│   │   └── portfolio.controller.js
│   ├── models/
│   │   ├── user.model.js
│   │   ├── portfolio.model.js
│   │   └── trade.model.js
│   ├── routes/
│   │   ├── user.route.js
│   │   └── portfolio.route.js
│   ├── services/
│   │   ├── user.service.js
│   │   └── portfolio.service.js
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── app.js
│   └── server.js
```

# Trading API Documentation

## Day 31 Progress Summary

**Date:** May 29, 2025  
**Focus:** Buy Assets Route Implementation & Documentation

### Today's Achievements

- ✅ Implemented comprehensive `/buy` route with full validation
- ✅ Added robust error handling and user balance verification
- ✅ Integrated portfolio management with automatic asset updates
- ✅ Added fee calculation system (0.5% transaction fee)
- ✅ Implemented trade execution tracking with status updates
- ✅ Added real-time portfolio value calculations and P&L tracking
- ✅ Enhanced response format with complete portfolio summary

### Key Features Implemented

- **Input Validation:** Symbol format, asset name length, positive numbers for quantity/price
- **Authentication:** Protected route with user authentication middleware
- **Balance Management:** Automatic balance deduction with insufficient funds protection
- **Portfolio Integration:** Dynamic asset creation/updates with price tracking
- **Trade Logging:** Complete trade history with execution timestamps
- **Fee System:** Transparent fee calculation and deduction

---

## API Routes Documentation

### POST /buy - Buy Assets

Execute a buy trade for financial assets with automatic portfolio management.

#### Route Definition

```javascript
router.post('/buy', [validation middleware], authMiddleware.authUser, tradeController.buyAssets)
```

#### Authentication

- **Required:** Yes
- **Type:** Bearer Token / Session-based
- **Middleware:** `authMiddleware.authUser`

#### Input Validation Rules

| Field       | Type   | Validation           | Description                       |
| ----------- | ------ | -------------------- | --------------------------------- |
| `symbol`    | String | Uppercase, Non-empty | Stock/Asset symbol (e.g., "AAPL") |
| `assetName` | String | Min 3 characters     | Full name of the asset            |
| `quantity`  | Number | Positive number      | Number of shares/units to buy     |
| `price`     | Number | Positive number      | Price per share/unit              |
| `notes`     | String | Optional             | Additional trade notes            |

#### Request Body Example

```json
{
  "symbol": "AAPL",
  "assetName": "Apple Inc.",
  "quantity": 10,
  "price": 150.25,
  "notes": "Long-term investment"
}
```

#### Success Response (201 Created)

```json
{
  "message": "Trade executed successfully",
  "trade": {
    "_id": "trade_id_here",
    "user": "user_id_here",
    "portfolio": "portfolio_id_here",
    "symbol": "AAPL",
    "assetName": "Apple Inc.",
    "tradeType": "buy",
    "quantity": 10,
    "price": 150.25,
    "fees": 7.51,
    "netAmount": 1510.01,
    "notes": "Long-term investment",
    "executedAt": "2025-05-29T10:30:00.000Z",
    "status": "executed"
  },
  "balance": 8489.99,
  "portfolioSummary": {
    "currentValue": 25750.8,
    "totalInvestment": 24500.0,
    "totalProfitLoss": 1250.8,
    "totalProfitLossPercentage": 5.11,
    "assets": [
      {
        "symbol": "AAPL",
        "assetName": "Apple Inc.",
        "quantity": 25,
        "averagePrice": 148.5,
        "currentPrice": 152.3,
        "totalInvestment": 3712.5,
        "currentValue": 3807.5,
        "profitLoss": 95.0,
        "profitLossPercentage": 2.56
      }
    ]
  }
}
```

#### Error Responses

**400 Bad Request - Validation Errors**

```json
{
  "error": [
    {
      "type": "field",
      "msg": "Symbol must be an uppercase string.",
      "path": "symbol",
      "location": "body"
    }
  ]
}
```

**401 Unauthorized - Insufficient Balance**

```json
{
  "error": "Insufficient balance"
}
```

**500 Internal Server Error**

```json
{
  "error": "Something went wrong while executing the trade."
}
```

#### Business Logic Flow

1. **Validation:** Input validation using express-validator
2. **Authentication:** Verify user authentication and extract user ID
3. **Balance Check:** Verify user has sufficient balance for trade + fees
4. **Portfolio Setup:** Create portfolio if doesn't exist for user
5. **Trade Creation:** Create trade record with calculated fees (0.5% of trade value)
6. **Trade Execution:** Execute trade and update status/timestamp
7. **Balance Update:** Deduct net amount from user balance
8. **Portfolio Update:** Add/update asset in portfolio with new quantity/price
9. **Price Refresh:** Update current prices using stock quote API
10. **P&L Calculation:** Recalculate portfolio value and profit/loss metrics
11. **Response:** Return comprehensive trade and portfolio summary

#### Fee Structure

- **Transaction Fee:** 0.5% of trade value
- **Calculation:** `fees = 0.005 * (quantity * price)`
- **Net Amount:** `quantity * price + fees`

#### Dependencies

- `portfolioModel`: Portfolio management operations
- `tradeModel`: Trade record creation and execution
- `userModel`: User balance management
- `getStockQuote`: Real-time price fetching

#### Related Models

- **Trade Model:** Stores individual trade records
- **Portfolio Model:** Manages user asset holdings
- **User Model:** Handles user balance and authentication

---

## Development Notes

### Current Implementation Status

- **Route Setup:** ✅ Complete
- **Validation:** ✅ Comprehensive input validation
- **Error Handling:** ✅ All edge cases covered
- **Database Integration:** ✅ Full CRUD operations
- **Authentication:** ✅ Secure user verification
- **Testing:** 🔄 Ready for integration testing

### Next Steps (Day 32)

- [ ] Implement sell assets route
- [ ] Add portfolio rebalancing features
- [ ] Create trade history endpoint
- [ ] Add real-time price updates
- [ ] Implement stop-loss functionality

### Technical Debt

- Consider adding request rate limiting
- Implement more sophisticated fee structures
- Add trade validation against market hours
- Consider adding trade preview functionality

---

## Code Quality Metrics

- **Error Coverage:** 100% of identified edge cases
- **Input Validation:** Comprehensive with clear error messages
- **Response Format:** Consistent and informative
- **Database Operations:** Atomic transactions where needed
- **Security:** Authentication required, input sanitized

## Day 32 Progress Summary

**Date:** May 30, 2025  
**Focus:** Sell Assets Route Implementation & Portfolio Management

### Today's Achievements

- ✅ Implemented complete `/sell` route with portfolio validation
- ✅ Added asset ownership verification and quantity checks
- ✅ Created `removeAsset` portfolio method with automatic cleanup
- ✅ Integrated balance crediting system for sell trades
- ✅ Added comprehensive error handling for sell-specific scenarios
- ✅ Maintained consistent fee structure and response format

### Key Features Added

- **Asset Validation:** Ownership verification and quantity availability checks
- **Portfolio Management:** Smart asset removal with automatic cleanup when quantity reaches zero
- **Balance Updates:** Automatic balance crediting with net proceeds
- **Error Handling:** Portfolio not found, asset not found, insufficient quantity scenarios

---

## API Routes Documentation

### POST /buy - Buy Assets

[Previous buy route documentation remains unchanged]

### POST /sell - Sell Assets

Execute a sell trade for owned portfolio assets with automatic balance crediting.

#### Route Definition

```javascript
router.post('/sell', [validation middleware], authMiddleware.authUser, tradeController.sellAssets)
```

#### Input Validation

Same validation rules as `/buy` route - symbol, assetName, quantity, price requirements.

#### Request Body Example

```json
{
  "symbol": "AAPL",
  "assetName": "Apple Inc.",
  "quantity": 5,
  "price": 155.5,
  "notes": "Taking profits"
}
```

#### Success Response (201 Created)

```json
{
  "message": "Trade executed successfully",
  "trade": {
    "_id": "trade_id_here",
    "user": "user_id_here",
    "portfolio": "portfolio_id_here",
    "symbol": "AAPL",
    "assetName": "Apple Inc.",
    "tradeType": "sell",
    "quantity": 5,
    "price": 155.5,
    "fees": 3.89,
    "netAmount": 773.61,
    "notes": "Taking profits",
    "executedAt": "2025-05-30T10:30:00.000Z",
    "status": "executed"
  },
  "balance": 9263.6,
  "portfolioSummary": {
    "currentValue": 22943.3,
    "totalInvestment": 21787.5,
    "totalProfitLoss": 1155.8,
    "totalProfitLossPercentage": 5.31,
    "assets": [
      {
        "symbol": "AAPL",
        "assetName": "Apple Inc.",
        "quantity": 20,
        "averagePrice": 148.5,
        "currentPrice": 155.5,
        "totalInvestment": 2970.0,
        "currentValue": 3110.0,
        "profitLoss": 140.0,
        "profitLossPercentage": 4.71
      }
    ]
  }
}
```

#### Sell-Specific Error Responses

**404 Not Found - No Portfolio**

```json
{
  "error": "Portfolio not found."
}
```

**400 Bad Request - Asset Not Found**

```json
{
  "error": "Asset AAPL not found in portfolio."
}
```

**400 Bad Request - Insufficient Quantity**

```json
{
  "error": "Not enough quantity to sell. Available: 3"
}
```

#### Business Logic Flow

1. **Validation:** Standard input validation
2. **Portfolio Check:** Verify user has a portfolio
3. **Asset Verification:** Check if asset exists in portfolio
4. **Quantity Check:** Verify sufficient quantity available
5. **Trade Execution:** Create and execute sell trade
6. **Asset Update:** Remove sold quantity using `removeAsset` method
7. **Balance Credit:** Add net proceeds to user balance
8. **Portfolio Refresh:** Update prices and recalculate P&L

#### Portfolio removeAsset Method

```javascript
portfolioSchema.methods.removeAsset = function (symbol, quantityToRemove) {
  // Finds asset by symbol
  // Validates sufficient quantity
  // Reduces quantity or removes asset completely if quantity becomes 0
  // Recalculates portfolio value
};
```

Execute a buy trade for financial assets with automatic portfolio management.

#### Route Definition

```javascript
router.post('/buy', [validation middleware], authMiddleware.authUser, tradeController.buyAssets)
```

#### Authentication

- **Required:** Yes
- **Type:** Bearer Token / Session-based
- **Middleware:** `authMiddleware.authUser`

#### Input Validation Rules

| Field       | Type   | Validation           | Description                       |
| ----------- | ------ | -------------------- | --------------------------------- |
| `symbol`    | String | Uppercase, Non-empty | Stock/Asset symbol (e.g., "AAPL") |
| `assetName` | String | Min 3 characters     | Full name of the asset            |
| `quantity`  | Number | Positive number      | Number of shares/units to buy     |
| `price`     | Number | Positive number      | Price per share/unit              |
| `notes`     | String | Optional             | Additional trade notes            |

#### Request Body Example

```json
{
  "symbol": "AAPL",
  "assetName": "Apple Inc.",
  "quantity": 10,
  "price": 150.25,
  "notes": "Long-term investment"
}
```

#### Success Response (201 Created)

```json
{
  "message": "Trade executed successfully",
  "trade": {
    "_id": "trade_id_here",
    "user": "user_id_here",
    "portfolio": "portfolio_id_here",
    "symbol": "AAPL",
    "assetName": "Apple Inc.",
    "tradeType": "buy",
    "quantity": 10,
    "price": 150.25,
    "fees": 7.51,
    "netAmount": 1510.01,
    "notes": "Long-term investment",
    "executedAt": "2025-05-29T10:30:00.000Z",
    "status": "executed"
  },
  "balance": 8489.99,
  "portfolioSummary": {
    "currentValue": 25750.8,
    "totalInvestment": 24500.0,
    "totalProfitLoss": 1250.8,
    "totalProfitLossPercentage": 5.11,
    "assets": [
      {
        "symbol": "AAPL",
        "assetName": "Apple Inc.",
        "quantity": 25,
        "averagePrice": 148.5,
        "currentPrice": 152.3,
        "totalInvestment": 3712.5,
        "currentValue": 3807.5,
        "profitLoss": 95.0,
        "profitLossPercentage": 2.56
      }
    ]
  }
}
```

#### Error Responses

**400 Bad Request - Validation Errors**

```json
{
  "error": [
    {
      "type": "field",
      "msg": "Symbol must be an uppercase string.",
      "path": "symbol",
      "location": "body"
    }
  ]
}
```

**401 Unauthorized - Insufficient Balance**

```json
{
  "error": "Insufficient balance"
}
```

**500 Internal Server Error**

```json
{
  "error": "Something went wrong while executing the trade."
}
```

#### Business Logic Flow

1. **Validation:** Input validation using express-validator
2. **Authentication:** Verify user authentication and extract user ID
3. **Balance Check:** Verify user has sufficient balance for trade + fees
4. **Portfolio Setup:** Create portfolio if doesn't exist for user
5. **Trade Creation:** Create trade record with calculated fees (0.5% of trade value)
6. **Trade Execution:** Execute trade and update status/timestamp
7. **Balance Update:** Deduct net amount from user balance
8. **Portfolio Update:** Add/update asset in portfolio with new quantity/price
9. **Price Refresh:** Update current prices using stock quote API
10. **P&L Calculation:** Recalculate portfolio value and profit/loss metrics
11. **Response:** Return comprehensive trade and portfolio summary

#### Fee Structure

- **Transaction Fee:** 0.5% of trade value
- **Calculation:** `fees = 0.005 * (quantity * price)`
- **Net Amount:** `quantity * price + fees`

#### Dependencies

- `portfolioModel`: Portfolio management operations
- `tradeModel`: Trade record creation and execution
- `userModel`: User balance management
- `getStockQuote`: Real-time price fetching

#### Related Models

- **Trade Model:** Stores individual trade records
- **Portfolio Model:** Manages user asset holdings
- **User Model:** Handles user balance and authentication

---

## Development Notes

### Current Implementation Status

- **Route Setup:** ✅ Complete
- **Validation:** ✅ Comprehensive input validation
- **Error Handling:** ✅ All edge cases covered
- **Database Integration:** ✅ Full CRUD operations
- **Authentication:** ✅ Secure user verification
- **Testing:** 🔄 Ready for integration testing

### Next Steps (Day 33)

- [ ] Implement trade history endpoint (`GET /trades`)
- [ ] Add portfolio dashboard route (`GET /portfolio`)
- [ ] Create trade analytics and reporting
- [ ] Add stop-loss and limit order functionality
- [ ] Implement real-time price alerts

### Technical Debt

- Add transaction rollback for failed operations
- Implement trade confirmation/preview endpoints
- Add batch trading operations
- Consider implementing trade cancellation

---

## Code Quality Metrics

- **Error Coverage:** 100% of identified edge cases
- **Input Validation:** Comprehensive with clear error messages
- **Response Format:** Consistent and informative
- **Database Operations:** Atomic transactions where needed
- **Security:** Authentication required, input sanitized

# Trading API Documentation

## Day 33 Progress Summary

**Date:** May 31, 2025  
**Focus:** Trade History & Query System Implementation

### Today's Achievements

- ✅ Implemented `/me` route for comprehensive trade history retrieval
- ✅ Added dynamic filtering system (symbol, status, type, price, quantity)
- ✅ Built pagination and sorting functionality with validation
- ✅ Integrated portfolio data population for enriched responses
- ✅ Added query parameter validation with comprehensive error handling

### Key Features Added

- **Advanced Filtering:** Multi-parameter search with dynamic query building
- **Pagination:** Efficient data retrieval with page/limit controls
- **Sorting:** Flexible sorting by date, price, or quantity (asc/desc)
- **Data Population:** Portfolio context included in trade responses

---

## API Routes Documentation

### POST /buy - Buy Assets

[Previous buy route documentation remains unchanged]

### POST /sell - Sell Assets

Execute a sell trade for owned portfolio assets with automatic balance crediting.

#### Route Definition

```javascript
router.post('/sell', [validation middleware], authMiddleware.authUser, tradeController.sellAssets)
```

#### Input Validation

Same validation rules as `/buy` route - symbol, assetName, quantity, price requirements.

#### Request Body Example

```json
{
  "symbol": "AAPL",
  "assetName": "Apple Inc.",
  "quantity": 5,
  "price": 155.5,
  "notes": "Taking profits"
}
```

#### Success Response (201 Created)

```json
{
  "message": "Trade executed successfully",
  "trade": {
    "_id": "trade_id_here",
    "user": "user_id_here",
    "portfolio": "portfolio_id_here",
    "symbol": "AAPL",
    "assetName": "Apple Inc.",
    "tradeType": "sell",
    "quantity": 5,
    "price": 155.5,
    "fees": 3.89,
    "netAmount": 773.61,
    "notes": "Taking profits",
    "executedAt": "2025-05-30T10:30:00.000Z",
    "status": "executed"
  },
  "balance": 9263.6,
  "portfolioSummary": {
    "currentValue": 22943.3,
    "totalInvestment": 21787.5,
    "totalProfitLoss": 1155.8,
    "totalProfitLossPercentage": 5.31,
    "assets": [
      {
        "symbol": "AAPL",
        "assetName": "Apple Inc.",
        "quantity": 20,
        "averagePrice": 148.5,
        "currentPrice": 155.5,
        "totalInvestment": 2970.0,
        "currentValue": 3110.0,
        "profitLoss": 140.0,
        "profitLossPercentage": 4.71
      }
    ]
  }
}
```

#### Sell-Specific Error Responses

**404 Not Found - No Portfolio**

```json
{
  "error": "Portfolio not found."
}
```

**400 Bad Request - Asset Not Found**

```json
{
  "error": "Asset AAPL not found in portfolio."
}
```

**400 Bad Request - Insufficient Quantity**

```json
{
  "error": "Not enough quantity to sell. Available: 3"
}
```

#### Business Logic Flow

1. **Validation:** Standard input validation
2. **Portfolio Check:** Verify user has a portfolio
3. **Asset Verification:** Check if asset exists in portfolio
4. **Quantity Check:** Verify sufficient quantity available
5. **Trade Execution:** Create and execute sell trade
6. **Asset Update:** Remove sold quantity using `removeAsset` method
7. **Balance Credit:** Add net proceeds to user balance
8. **Portfolio Refresh:** Update prices and recalculate P&L

### GET /me - Get Trade History

Retrieve user's trade history with advanced filtering, sorting, and pagination.

#### Route Definition

```javascript
router.get('/me', [query validation middleware], authMiddleware.authUser, tradeController.getMyTrades)
```

#### Query Parameters

| Parameter   | Type    | Default   | Validation                  | Description                |
| ----------- | ------- | --------- | --------------------------- | -------------------------- |
| `page`      | Integer | 1         | Min: 1                      | Page number for pagination |
| `limit`     | Integer | 20        | Min: 1                      | Records per page           |
| `symbol`    | String  | -         | Uppercase                   | Filter by asset symbol     |
| `assetName` | String  | -         | Any string                  | Filter by asset name       |
| `quantity`  | Number  | -         | Positive                    | Filter by exact quantity   |
| `price`     | Number  | -         | Positive                    | Filter by exact price      |
| `status`    | String  | -         | completed/pending/cancelled | Filter by trade status     |
| `tradeType` | String  | -         | buy/sell                    | Filter by trade type       |
| `sortBy`    | String  | createdAt | createdAt/price/quantity    | Sort field                 |
| `sortOrder` | String  | desc      | asc/desc                    | Sort direction             |

#### Request Example

```
GET /api/trades/me?symbol=AAPL&tradeType=buy&page=1&limit=10&sortBy=createdAt&sortOrder=desc
```

#### Success Response (200 OK)

```json
{
  "page": 1,
  "limit": 10,
  "total": 25,
  "trades": [
    {
      "_id": "trade_id_here",
      "user": "user_id_here",
      "portfolio": {
        "_id": "portfolio_id_here",
        "currentValue": 25750.8,
        "totalProfitLoss": 1250.8
      },
      "symbol": "AAPL",
      "assetName": "Apple Inc.",
      "tradeType": "buy",
      "quantity": 10,
      "price": 150.25,
      "fees": 7.51,
      "netAmount": 1510.01,
      "status": "completed",
      "notes": "Long-term investment",
      "createdAt": "2025-05-31T10:30:00.000Z",
      "executedAt": "2025-05-31T10:30:05.000Z"
    }
  ]
}
```

#### Business Logic Features

- **Dynamic Filtering:** Builds query object based on provided parameters
- **Portfolio Population:** Includes current portfolio value and P&L context
- **Efficient Pagination:** Skip/limit with total count for UI pagination
- **Flexible Sorting:** Multiple sort fields with ascending/descending options

Execute a buy trade for financial assets with automatic portfolio management.

#### Route Definition

```javascript
router.post('/buy', [validation middleware], authMiddleware.authUser, tradeController.buyAssets)
```

#### Authentication

- **Required:** Yes
- **Type:** Bearer Token / Session-based
- **Middleware:** `authMiddleware.authUser`

#### Input Validation Rules

| Field       | Type   | Validation           | Description                       |
| ----------- | ------ | -------------------- | --------------------------------- |
| `symbol`    | String | Uppercase, Non-empty | Stock/Asset symbol (e.g., "AAPL") |
| `assetName` | String | Min 3 characters     | Full name of the asset            |
| `quantity`  | Number | Positive number      | Number of shares/units to buy     |
| `price`     | Number | Positive number      | Price per share/unit              |
| `notes`     | String | Optional             | Additional trade notes            |

#### Request Body Example

```json
{
  "symbol": "AAPL",
  "assetName": "Apple Inc.",
  "quantity": 10,
  "price": 150.25,
  "notes": "Long-term investment"
}
```

#### Success Response (201 Created)

```json
{
  "message": "Trade executed successfully",
  "trade": {
    "_id": "trade_id_here",
    "user": "user_id_here",
    "portfolio": "portfolio_id_here",
    "symbol": "AAPL",
    "assetName": "Apple Inc.",
    "tradeType": "buy",
    "quantity": 10,
    "price": 150.25,
    "fees": 7.51,
    "netAmount": 1510.01,
    "notes": "Long-term investment",
    "executedAt": "2025-05-29T10:30:00.000Z",
    "status": "executed"
  },
  "balance": 8489.99,
  "portfolioSummary": {
    "currentValue": 25750.8,
    "totalInvestment": 24500.0,
    "totalProfitLoss": 1250.8,
    "totalProfitLossPercentage": 5.11,
    "assets": [
      {
        "symbol": "AAPL",
        "assetName": "Apple Inc.",
        "quantity": 25,
        "averagePrice": 148.5,
        "currentPrice": 152.3,
        "totalInvestment": 3712.5,
        "currentValue": 3807.5,
        "profitLoss": 95.0,
        "profitLossPercentage": 2.56
      }
    ]
  }
}
```

#### Error Responses

**400 Bad Request - Validation Errors**

```json
{
  "error": [
    {
      "type": "field",
      "msg": "Symbol must be an uppercase string.",
      "path": "symbol",
      "location": "body"
    }
  ]
}
```

**401 Unauthorized - Insufficient Balance**

```json
{
  "error": "Insufficient balance"
}
```

**500 Internal Server Error**

```json
{
  "error": "Something went wrong while executing the trade."
}
```

#### Business Logic Flow

1. **Validation:** Input validation using express-validator
2. **Authentication:** Verify user authentication and extract user ID
3. **Balance Check:** Verify user has sufficient balance for trade + fees
4. **Portfolio Setup:** Create portfolio if doesn't exist for user
5. **Trade Creation:** Create trade record with calculated fees (0.5% of trade value)
6. **Trade Execution:** Execute trade and update status/timestamp
7. **Balance Update:** Deduct net amount from user balance
8. **Portfolio Update:** Add/update asset in portfolio with new quantity/price
9. **Price Refresh:** Update current prices using stock quote API
10. **P&L Calculation:** Recalculate portfolio value and profit/loss metrics
11. **Response:** Return comprehensive trade and portfolio summary

#### Fee Structure

- **Transaction Fee:** 0.5% of trade value
- **Calculation:** `fees = 0.005 * (quantity * price)`
- **Net Amount:** `quantity * price + fees`

#### Dependencies

- `portfolioModel`: Portfolio management operations
- `tradeModel`: Trade record creation and execution
- `userModel`: User balance management
- `getStockQuote`: Real-time price fetching

#### Related Models

- **Trade Model:** Stores individual trade records
- **Portfolio Model:** Manages user asset holdings
- **User Model:** Handles user balance and authentication

---

## Development Notes

### Current Implementation Status

- **Route Setup:** ✅ Complete
- **Validation:** ✅ Comprehensive input validation
- **Error Handling:** ✅ All edge cases covered
- **Database Integration:** ✅ Full CRUD operations
- **Authentication:** ✅ Secure user verification
- **Testing:** 🔄 Ready for integration testing

### Next Steps (Day 34)

- [ ] Implement portfolio dashboard route (`GET /portfolio`)
- [ ] Add trade analytics and summary statistics
- [ ] Create portfolio performance metrics endpoint
- [ ] Add export functionality for trade history
- [ ] Implement real-time portfolio value updates

### Technical Debt

- Add caching for frequently accessed trade data
- Implement database indexing for filter performance
- Add trade history data export (CSV/PDF)
- Consider implementing trade search by date ranges

---

## Code Quality Metrics

- **Error Coverage:** 100% of identified edge cases
- **Input Validation:** Comprehensive with clear error messages
- **Response Format:** Consistent and informative
- **Database Operations:** Atomic transactions where needed
- **Security:** Authentication required, input sanitized


# Trading API Documentation

## Day 33 Progress Summary

**Date:** May 31, 2025  
**Focus:** Trade History System & Individual Trade Access

### Today's Achievements
- ✅ Implemented `/me` route for comprehensive trade history retrieval
- ✅ Added `/me/:id` route for individual trade access with ownership validation
- ✅ Built dynamic filtering system (symbol, status, type, price, quantity)
- ✅ Added pagination and sorting functionality with validation
- ✅ Integrated portfolio data population for enriched responses
- ✅ Added secure trade access control with user verification

### Key Features Added
- **Advanced Filtering:** Multi-parameter search with dynamic query building
- **Individual Trade Access:** Secure single trade retrieval with ownership checks
- **Pagination:** Efficient data retrieval with page/limit controls
- **Sorting:** Flexible sorting by date, price, or quantity (asc/desc)
- **Access Control:** User-specific trade access validation

### Next Phase Routes Planned
- `/me/symbol/:symbol` - Asset-specific trade history
- `/me/:id/cancel` - Trade cancellation functionality  
- `/me/stats` - Trading statistics and analytics
- `/me/recent` - Quick access to recent trades

---

## API Routes Documentation

### POST /buy - Buy Assets
[Previous buy route documentation remains unchanged]

### POST /sell - Sell Assets

Execute a sell trade for owned portfolio assets with automatic balance crediting.

#### Route Definition
```javascript
router.post('/sell', [validation middleware], authMiddleware.authUser, tradeController.sellAssets)
```

#### Input Validation
Same validation rules as `/buy` route - symbol, assetName, quantity, price requirements.

#### Request Body Example
```json
{
  "symbol": "AAPL",
  "assetName": "Apple Inc.",
  "quantity": 5,
  "price": 155.50,
  "notes": "Taking profits"
}
```

#### Success Response (201 Created)
```json
{
  "message": "Trade executed successfully",
  "trade": {
    "_id": "trade_id_here",
    "user": "user_id_here",
    "portfolio": "portfolio_id_here",
    "symbol": "AAPL",
    "assetName": "Apple Inc.",
    "tradeType": "sell",
    "quantity": 5,
    "price": 155.50,
    "fees": 3.89,
    "netAmount": 773.61,
    "notes": "Taking profits",
    "executedAt": "2025-05-30T10:30:00.000Z",
    "status": "executed"
  },
  "balance": 9263.60,
  "portfolioSummary": {
    "currentValue": 22943.30,
    "totalInvestment": 21787.50,
    "totalProfitLoss": 1155.80,
    "totalProfitLossPercentage": 5.31,
    "assets": [
      {
        "symbol": "AAPL",
        "assetName": "Apple Inc.",
        "quantity": 20,
        "averagePrice": 148.50,
        "currentPrice": 155.50,
        "totalInvestment": 2970.00,
        "currentValue": 3110.00,
        "profitLoss": 140.00,
        "profitLossPercentage": 4.71
      }
    ]
  }
}
```

#### Sell-Specific Error Responses

**404 Not Found - No Portfolio**
```json
{
  "error": "Portfolio not found."
}
```

**400 Bad Request - Asset Not Found**
```json
{
  "error": "Asset AAPL not found in portfolio."
}
```

**400 Bad Request - Insufficient Quantity**
```json
{
  "error": "Not enough quantity to sell. Available: 3"
}
```

#### Business Logic Flow
1. **Validation:** Standard input validation
2. **Portfolio Check:** Verify user has a portfolio
3. **Asset Verification:** Check if asset exists in portfolio
4. **Quantity Check:** Verify sufficient quantity available
5. **Trade Execution:** Create and execute sell trade
6. **Asset Update:** Remove sold quantity using `removeAsset` method
7. **Balance Credit:** Add net proceeds to user balance
8. **Portfolio Refresh:** Update prices and recalculate P&L

### GET /me - Get Trade History

Retrieve user's trade history with advanced filtering, sorting, and pagination.

#### Route Definition
```javascript
router.get('/me', [query validation middleware], authMiddleware.authUser, tradeController.getMyTrades)
```

#### Query Parameters
| Parameter | Type | Default | Validation | Description |
|-----------|------|---------|------------|-------------|
| `page` | Integer | 1 | Min: 1 | Page number for pagination |
| `limit` | Integer | 20 | Min: 1 | Records per page |
| `symbol` | String | - | Uppercase | Filter by asset symbol |
| `assetName` | String | - | Any string | Filter by asset name |
| `quantity` | Number | - | Positive | Filter by exact quantity |
| `price` | Number | - | Positive | Filter by exact price |
| `status` | String | - | completed/pending/cancelled | Filter by trade status |
| `tradeType` | String | - | buy/sell | Filter by trade type |
| `sortBy` | String | createdAt | createdAt/price/quantity | Sort field |
| `sortOrder` | String | desc | asc/desc | Sort direction |

#### Request Example
```
GET /api/trades/me?symbol=AAPL&tradeType=buy&page=1&limit=10&sortBy=createdAt&sortOrder=desc
```

#### Success Response (200 OK)
```json
{
  "page": 1,
  "limit": 10,
  "total": 25,
  "trades": [
    {
      "_id": "trade_id_here",
      "user": "user_id_here",
      "portfolio": {
        "_id": "portfolio_id_here",
        "currentValue": 25750.80,
        "totalProfitLoss": 1250.80
      },
      "symbol": "AAPL",
      "assetName": "Apple Inc.",
      "tradeType": "buy",
      "quantity": 10,
      "price": 150.25,
      "fees": 7.51,
      "netAmount": 1510.01,
      "status": "completed",
      "notes": "Long-term investment",
      "createdAt": "2025-05-31T10:30:00.000Z",
      "executedAt": "2025-05-31T10:30:05.000Z"
    }
  ]
}
```

### GET /me/:id - Get Individual Trade

Retrieve a specific trade by ID with ownership validation.

#### Route Definition
```javascript
router.get('/me/:id', authMiddleware.authUser, tradeController.getMyTradesById)
```

#### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | MongoDB ObjectId of the trade |

#### Request Example
```
GET /api/trades/me/64b8f2c3a1b2c3d4e5f67890
```

#### Success Response (201 Created)
```json
{
  "trade": {
    "_id": "64b8f2c3a1b2c3d4e5f67890",
    "user": "user_id_here",
    "portfolio": {
      "_id": "portfolio_id_here",
      "currentValue": 25750.80,
      "totalInvestment": 24500.00,
      "totalProfitLoss": 1250.80,
      "assets": [...],
      "user": "user_id_here"
    },
    "symbol": "AAPL",
    "assetName": "Apple Inc.",
    "tradeType": "buy",
    "quantity": 10,
    "price": 150.25,
    "fees": 7.51,
    "netAmount": 1510.01,
    "status": "completed",
    "notes": "Long-term investment",
    "createdAt": "2025-05-31T10:30:00.000Z",
    "executedAt": "2025-05-31T10:30:05.000Z"
  }
}
```

#### Error Responses

**400 Bad Request - Access Denied**
```json
{
  "error": "you don't have access to this trade history"
}
```

**500 Internal Server Error**
```json
{
  "error": "Server error"
}
```

#### Security Features
- **Ownership Validation:** Verifies trade belongs to authenticated user
- **Population:** Full portfolio data included for context
- **Access Control:** Prevents users from accessing other users' trades

Execute a buy trade for financial assets with automatic portfolio management.

#### Route Definition
```javascript
router.post('/buy', [validation middleware], authMiddleware.authUser, tradeController.buyAssets)
```

#### Authentication
- **Required:** Yes
- **Type:** Bearer Token / Session-based
- **Middleware:** `authMiddleware.authUser`

#### Input Validation Rules

| Field | Type | Validation | Description |
|-------|------|------------|-------------|
| `symbol` | String | Uppercase, Non-empty | Stock/Asset symbol (e.g., "AAPL") |
| `assetName` | String | Min 3 characters | Full name of the asset |
| `quantity` | Number | Positive number | Number of shares/units to buy |
| `price` | Number | Positive number | Price per share/unit |
| `notes` | String | Optional | Additional trade notes |

#### Request Body Example
```json
{
  "symbol": "AAPL",
  "assetName": "Apple Inc.",
  "quantity": 10,
  "price": 150.25,
  "notes": "Long-term investment"
}
```

#### Success Response (201 Created)
```json
{
  "message": "Trade executed successfully",
  "trade": {
    "_id": "trade_id_here",
    "user": "user_id_here",
    "portfolio": "portfolio_id_here",
    "symbol": "AAPL",
    "assetName": "Apple Inc.",
    "tradeType": "buy",
    "quantity": 10,
    "price": 150.25,
    "fees": 7.51,
    "netAmount": 1510.01,
    "notes": "Long-term investment",
    "executedAt": "2025-05-29T10:30:00.000Z",
    "status": "executed"
  },
  "balance": 8489.99,
  "portfolioSummary": {
    "currentValue": 25750.80,
    "totalInvestment": 24500.00,
    "totalProfitLoss": 1250.80,
    "totalProfitLossPercentage": 5.11,
    "assets": [
      {
        "symbol": "AAPL",
        "assetName": "Apple Inc.",
        "quantity": 25,
        "averagePrice": 148.50,
        "currentPrice": 152.30,
        "totalInvestment": 3712.50,
        "currentValue": 3807.50,
        "profitLoss": 95.00,
        "profitLossPercentage": 2.56
      }
    ]
  }
}
```

#### Error Responses

**400 Bad Request - Validation Errors**
```json
{
  "error": [
    {
      "type": "field",
      "msg": "Symbol must be an uppercase string.",
      "path": "symbol",
      "location": "body"
    }
  ]
}
```

**401 Unauthorized - Insufficient Balance**
```json
{
  "error": "Insufficient balance"
}
```

**500 Internal Server Error**
```json
{
  "error": "Something went wrong while executing the trade."
}
```

#### Business Logic Flow

1. **Validation:** Input validation using express-validator
2. **Authentication:** Verify user authentication and extract user ID
3. **Balance Check:** Verify user has sufficient balance for trade + fees
4. **Portfolio Setup:** Create portfolio if doesn't exist for user
5. **Trade Creation:** Create trade record with calculated fees (0.5% of trade value)
6. **Trade Execution:** Execute trade and update status/timestamp
7. **Balance Update:** Deduct net amount from user balance
8. **Portfolio Update:** Add/update asset in portfolio with new quantity/price
9. **Price Refresh:** Update current prices using stock quote API
10. **P&L Calculation:** Recalculate portfolio value and profit/loss metrics
11. **Response:** Return comprehensive trade and portfolio summary

#### Fee Structure
- **Transaction Fee:** 0.5% of trade value
- **Calculation:** `fees = 0.005 * (quantity * price)`
- **Net Amount:** `quantity * price + fees`

#### Dependencies
- `portfolioModel`: Portfolio management operations
- `tradeModel`: Trade record creation and execution
- `userModel`: User balance management
- `getStockQuote`: Real-time price fetching

#### Related Models
- **Trade Model:** Stores individual trade records
- **Portfolio Model:** Manages user asset holdings
- **User Model:** Handles user balance and authentication

---

## Development Notes

### Current Implementation Status
- **Route Setup:** ✅ Complete
- **Validation:** ✅ Comprehensive input validation
- **Error Handling:** ✅ All edge cases covered
- **Database Integration:** ✅ Full CRUD operations
- **Authentication:** ✅ Secure user verification
- **Testing:** 🔄 Ready for integration testing

---

## Upcoming Routes (Next Implementation Phase)

### Planned Trade Management Routes

#### GET /me/symbol/:symbol - Asset-Specific Trade History
- Filter all trades for a specific asset symbol
- Useful for tracking performance of individual stocks
- Same pagination and sorting as main trade history

#### PUT /me/:id/cancel - Trade Cancellation
- Cancel pending trades before execution
- Validation for trade status (only pending trades)
- Automatic balance/portfolio restoration

#### GET /me/stats - Trading Statistics
- Total trades count (buy/sell breakdown)
- Portfolio performance metrics
- Profit/loss summaries and percentages
- Most traded assets and trading patterns

#### GET /me/recent - Recent Trades
- Quick access to last 10-20 trades
- Optimized for dashboard displays
- No pagination needed for recent activity

#### GET / - All Trades (Admin Only)
- System-wide trade monitoring
- Admin-level access control
- Platform trading statistics and oversight

### Implementation Priority
1. **Asset-specific filtering** - High demand for stock performance tracking
2. **Trade statistics** - Essential for user dashboards and analytics
3. **Recent trades** - Quick access for active traders
4. **Trade cancellation** - Risk management feature
5. **Admin overview** - Platform monitoring and analytics

### Next Steps (Day 34)
- [ ] Implement `/me/symbol/:symbol` for asset-specific trade history
- [ ] Add `/me/stats` for comprehensive trading statistics
- [ ] Create `/me/recent` for quick recent trades access
- [ ] Begin `/me/:id/cancel` trade cancellation functionality
- [ ] Add performance optimization with database indexing

### Technical Debt
- Add database indexing for trade queries (user, symbol, status)
- Implement caching for frequently accessed trade statistics
- Add input validation for MongoDB ObjectId format
- Consider implementing soft delete for cancelled trades

---

## Code Quality Metrics
- **Error Coverage:** 100% of identified edge cases
- **Input Validation:** Comprehensive with clear error messages
- **Response Format:** Consistent and informative
- **Database Operations:** Atomic transactions where needed
- **Security:** Authentication required, input sanitized