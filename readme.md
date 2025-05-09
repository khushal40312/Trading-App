
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