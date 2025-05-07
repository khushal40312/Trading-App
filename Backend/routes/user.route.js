const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const userController = require('../controllers/user.controller')





router.post('/register', [
    body("email").isEmail().withMessage('Invalid Email'),
    body('fullname.firstname').isLength({ min: 3 }).withMessage('First name must be at least 3 charater long'),
    body('password').isLength({ min: 6 }).withMessage('Password must be 6 Charater long')
],
    userController.registerUser
)
router.post('/login', [
    body("email").isEmail().withMessage('Invalid Email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be 6 Charater long')
], userController.loginUser)
router.get('/logout', authMiddleware.authUser, userController.logoutUser)

router.get('/profile', authMiddleware.authUser, userController.getUserProfile)
// router.put('/profile', authMiddleware.authUser, userController.updateUserProfile)
// router.get('/balance', authMiddleware.authUser, userController.getUserBalance)
// router.put('/balance', authMiddleware.authUser, userController.addUserBalance)
// router.post('/refresh-token', authMiddleware.authUser, userController.refreshUserToken)
// router.get('/settings', authMiddleware.authUser, userController.getUserSettings)
// router.put('/settings', authMiddleware.authUser, userController.updateUserSettings)















