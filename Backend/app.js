const dotenv = require('dotenv')
dotenv.config();
const express = require('express');
const cors = require('cors');
const connectToDb = require('./config/db');
connectToDb();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cors())