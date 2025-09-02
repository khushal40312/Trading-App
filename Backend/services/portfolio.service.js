const portfolioModel = require('../models/portfolio.model');
const axios = require('axios');



module.exports.findPortfolio = async (userId) => {
  return await portfolioModel.findOne({ user: userId })
}

module.exports.getCryptoTrendingPortfolio = async () => {
  try {
    // 1. Get trending coins from Coingecko
    const { data } = await axios.get(
      "https://api.coingecko.com/api/v3/search/trending", {
        headers: {
          'Accept': 'application/json',
          'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
        },
      timeout: 30000
    }
    );

    // 2. Get all coins from Bitget
    const bitgetRes = await axios.get(
      "https://api.bitget.com/api/v2/spot/public/coins"
    );

    // Extract only coin symbols from Bitget response
    const bitgetCoins = new Set(bitgetRes.data.data.map(item => item.coin.toUpperCase()));
    // 3. Filter trending coins that also exist in Bitget
    const filteredTrending = data.coins
      .filter(item => bitgetCoins.has(item.item.symbol.toUpperCase()))
      .map(item => ({
        item: {
          coingeckoId: item.item.id,
          name: item.item.name,
          symbol: item.item.symbol,
          image: item.item.thumb,
          // small: item.item.small,
          // large: item.item.large,
          slug: item.item.slug,
          price_btc: item.item.price_btc,
          data: {
            price_change_percentage_24h: {
              usd: item.item.data.price_change_percentage_24h.usd,

            },
            current_price: item.item.data.price,
            sparkline: item.item.data.sparkline,
          },
        }
      }));

    return filteredTrending;
  } catch (error) {
    console.error("Error fetching trending cryptocurrencies:", error.message);
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


