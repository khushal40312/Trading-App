const portfolioModel = require('../models/portfolio.model');
const blacklistTokenModel = require('../models/blacklistToken.model');
const axios = require('axios');
const API_KEY = process.env.FINNHUB_API;
const COINMARKETCAP_API_KEY = 'a9bd5d89-f8cd-4a2c-af0b-9de77d9c5a55';


module.exports.findPortfolio = async (userId) => {
  // console.log(user.id)
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


// module.exports.getStockQuotePortfolio= async (symbol)=> {
//     try {
//         const { data } = await axios.get('https://finnhub.io/api/v1/quote', {
//           params: {
//             symbol: `BINANCE:${symbol}`,
//             token: API_KEY
//           }
//         });

//         return { symbol, price: data.c }; // c = current price
//       } catch (error) {
//         console.error(`Error fetching ${symbol}:`, error.message);
//         return { symbol, price: null, error: true };
//       }
// }
module.exports.getCurrency = async (name) => {

  try {
    const { data } = await axios.get(`https://api.fastforex.io/fetch-one?from=USD&to=${name}&api_key=${process.env.FASTFOREX_API_KEY}`)

    return data.result;
  } catch (error) {
    console.error(`Error fetching ${name}:`, error.message);

  }
}




