const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware')
const aiController= require('../controllers/ai.controller')
const dotenv =  require("dotenv");

dotenv.config();



router.post('/chat',authMiddleware.authUser,aiController.aiChat)
module.exports = router;
