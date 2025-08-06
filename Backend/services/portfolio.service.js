const portfolioModel = require('../models/portfolio.model');
const blacklistTokenModel = require('../models/blacklistToken.model');
const axios = require('axios');
const API_KEY = process.env.FINNHUB_API;
const COINMARKETCAP_API_KEY = 'a9bd5d89-f8cd-4a2c-af0b-9de77d9c5a55';


module.exports.findPortfolio = async (userId) => {

  return await portfolioModel.findOne({ user: userId })

}




module.exports.getCryptoTrendingPortfolio = async () => {
  try {
    const { data } = await axios.get('https://api.coingecko.com/api/v3/search/trending')


    return data;
  } catch (error) {
    console.error('Error fetching trending cryptocurrencies:', error.message);
    return { error: true, message: error.message };
  }
};




module.exports.getCurrency = async (name) => {

  try {  
    const { data } = await axios.get(` https://v6.exchangerate-api.com/v6/${process.env.EXCHANGERATE_API_KEY}/pair/USD/${name}`)

    return data.conversion_rate;
  } catch (error) {
    console.error(`Error fetching ${name}:`, error.message);

  }
}



