const dotenv = require('dotenv')
dotenv.config();
const express = require('express');
const cors = require('cors');
const connectToDb = require('./config/db');
const userRoutes = require('./routes/user.route')
const portfolioRoutes = require('./routes/portfolio.route.js')
const tradeRoutes = require('./routes/trade.route.js')




connectToDb();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use('/users', userRoutes)
app.use('/portfolios', portfolioRoutes)
app.use('/trades', tradeRoutes)
app.get('/', (req, res) => {
    res.status(200).json({ success: true })


})

module.exports = app;