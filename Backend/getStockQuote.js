const axios = require('axios');
const cron = require('node-cron');
const Portfolio= require("./models/portfolio.model")


async function getStockQuote(symbol) {
  try {
    const { data } = await axios.get(`https://api.bitget.com/api/v2/spot/market/tickers?symbol=${symbol}USDT`)
    // a9bd5d89-f8cd-4a2c-af0b-9de77d9c5a55
    
    return Number(data.data[0].lastPr); // current price
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error.message);
    throw error;
  }
}
module.exports = getStockQuote;




cron.schedule('*/5 * * * *', async () => {
  const portfolios = await Portfolio.find({});
  for (const portfolio of portfolios) {
    await portfolio.updatePrices(getStockQuote);
    await portfolio.save();
  }
  console.log('Portfolio prices updated every 5 minutes.');
});

module.exports = getStockQuote;
