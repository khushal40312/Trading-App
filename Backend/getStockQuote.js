const axios = require('axios');
const API_KEY = process.env.FINNHUB_API;
const cron = require('node-cron');
const Portfolio= require("./models/portfolio.model")


async function getStockQuote(symbol) {
  try {
    const { data } = await axios.get(`https://finnhub.io/api/v1/quote`, {
      params: {
        symbol,
        token: API_KEY
      }
    });
    return data.c; // current price
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error.message);
    throw error;
  }
}
module.exports = getStockQuote;




cron.schedule('0 */1 * * *', async () => {
  const portfolios = await Portfolio.find({});
  for (const portfolio of portfolios) {
    await portfolio.updatePrices(getStockQuote);
    await portfolio.save();
  }
  console.log('Portfolio prices updated every 1 hours.');
});

module.exports = getStockQuote;
