const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const userController = require('../controllers/user.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const multer = require('multer');
const { cloudinary } = require('../config/cloudnary.js');
const {CloudinaryStorage}= require('multer-storage-cloudinary')
// Multer storage setup


const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'profile_picture',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const upload = multer({ storage });




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
    body('settings.theme').isIn(["light", "dark"]).withMessage('Invalid theme set'),
    body('settings.currency').isIn(["USDT", "INR"]).withMessage('Invalid currency set'),

], authMiddleware.authUser, userController.updateUserProfile)
router.get('/balance', authMiddleware.authUser, userController.getUserBalance)
router.put('/balance', [body('password').isLength({ min: 6 }).withMessage('Password must be 6 Charater long'),
body("balance").isInt().withMessage('Invalid amount'), body("email").isEmail().withMessage('Invalid Email'),
body('password').isLength({ min: 6 }).withMessage('Password must be 6 Charater long')], authMiddleware.authUser, userController.addUserBalance)

router.post(
    '/update-profileIMG',
    authMiddleware.authUser,
    upload.single('picture'), // this handles file upload from form field `picture`
    userController.updateProfileIMG
  );





module.exports = router;




