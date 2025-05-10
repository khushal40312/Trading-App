const axios = require('axios');

// Replace with your actual API key
const API_KEY = process.env.FINNHUB_API;
const SYMBOL = 'BINANCE:BTCUSDT'; // Example stock symbol

async function getStockQuote(symbol) {
  try {
    const response = await axios.get(`https://finnhub.io/api/v1/quote`, {
      params: {
        symbol,
        token: API_KEY
      }
    });

    console.log(`Stock quote for ${symbol}:`, response.data);
  } catch (error) {
    console.error('Error fetching stock quote:', error.message);
  }
}

getStockQuote(SYMBOL); 