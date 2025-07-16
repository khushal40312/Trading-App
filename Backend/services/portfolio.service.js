const portfolioModel = require('../models/portfolio.model');
const blacklistTokenModel = require('../models/blacklistToken.model');
const axios = require('axios');
const API_KEY = process.env.FINNHUB_API;


module.exports.findPortfolio = async (userId) => {
// console.log(user.id)
return await portfolioModel.findOne({user:userId})

}



module.exports.getStockQuotePortfolio= async (symbol)=> {
    try {
        const { data } = await axios.get('https://finnhub.io/api/v1/quote', {
          params: {
            symbol: `BINANCE:${symbol}`,
            token: API_KEY
          }
        });
      
        return { symbol, price: data.c }; // c = current price
      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error.message);
        return { symbol, price: null, error: true };
      }
}

