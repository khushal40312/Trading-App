const dotenv = require('dotenv')
dotenv.config();
const express = require('express');
const cors = require('cors');
const connectToDb = require('./config/db');
const userRoutes= require('./routes/user.route')
connectToDb();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use('/users',userRoutes)


module.exports = app;