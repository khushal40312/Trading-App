const { default: axios } = require("axios");

const getImages = async (symbol) => {
    

    if (!symbol) return
    try {
        const response = await axios.get(
            `https://api.coingecko.com/api/v3/coins/${symbol}`,
            {
                headers: {
                    accept: 'application/json',
                    'x-cg-demo-api-key': process.env.COINGEKO_API // Replace with your actual CoinGecko key
                },
                params: {

                    localization: false,
                    tickers: false,
                    market_data: false,
                    community_data: false,
                    developer_data: false,
                    sparkline: false
                },
            }
        );


        return response.data.image;


    } catch (error) {
        console.log(error, "error during fetching images ")
    }

}
module.exports={getImages}