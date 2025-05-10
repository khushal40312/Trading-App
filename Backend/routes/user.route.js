const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const userController = require('../controllers/user.controller')
const authMiddleware= require('../middlewares/auth.middleware')




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
router.put('/profile', [
    body('fullname.firstname').isLength({ min: 3 }).withMessage('First name must be at least 3 charater long'),
    body('settings.notifications').isBoolean().withMessage('Notifications must be a boolean').toBoolean(),
    body('settings.theme').isIn(["light","dark"]).withMessage('Invalid notification set'),
], authMiddleware.authUser, userController.updateUserProfile)
router.get('/balance', userController.getUserBalance)
router.put('/balance', body("balance").isInt().withMessage('Invalid amount'), authMiddleware.authUser, authMiddleware.authUser, userController.addUserBalance)












module.exports = router;




