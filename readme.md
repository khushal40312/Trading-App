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