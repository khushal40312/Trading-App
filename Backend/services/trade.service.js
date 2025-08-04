const { default: axios } = require("axios");



module.exports.getSuggestion = async (input) => {
    try {
        const bitgetRes = await axios.get("https://api.bitget.com/api/v2/spot/public/coins");
        const bitgetCoins = bitgetRes.data.data;

        const upper = input.toUpperCase();
        const lower = input.toLowerCase();

        const match = bitgetCoins.find(
            (coin) => coin.coin.toLowerCase() === lower
        );

        if (!match) {
            return { error: `Coin "${input}" not found in Bitget.` };
        }

        const chain = match.chains?.find((c) => !!c.contractAddress); // get any chain with contract
        // Try contract-based lookup first if available
        if (chain?.contractAddress) {
            const network = chain.chain.toLowerCase(); // e.g. ETH, BSC, BASE, etc.
            const contract = chain.contractAddress;

            try {
                const tokenInfoRes = await axios.get(
                    `https://api.coingecko.com/api/v3/onchain/networks/${network}/tokens/${contract}/info`,
                    {
                        headers: {
                            accept: 'application/json',
                            'x-cg-demo-api-key': process.env.COINGECKO_API_KEY,
                        },
                    }
                );


                const info = tokenInfoRes.data.data?.attributes;
                return {
                    name: info.name,
                    symbol: info.symbol,
                    bitgetSymbol: match.symbol,
                    coingeckoId: info.coingecko_coin_id,
                    image: info.image?.large || info.image_url,
                    description: info.description,
                    source: "coingecko_onchain",

                };
            } catch (contractErr) {
                console.warn(`Fallback to search: ${contractErr.message}`);
            }
        }

        // Fallback to search by symbol if contract-based lookup failed
        const geckoRes = await axios.get("https://api.coingecko.com/api/v3/search", {
            params: { query: match.coin },
            headers: {
                accept: 'application/json',
                'x-cg-demo-api-key': process.env.COINGECKO_API_KEY,
            },
        });

        const matchedGecko = geckoRes.data.coins.find(
            (c) => c.symbol.toLowerCase() === match.coin.toLowerCase()
        );

        if (!matchedGecko) {
            return {
                name: match.name,
                symbol: match.coin,
                bitgetSymbol: match.symbol,
                coingecko: null,
                image: null,
                source: "bitget_only",
            };
        }

        return {
            name: matchedGecko.name,
            symbol: matchedGecko.symbol.toUpperCase(),
            bitgetSymbol: match.symbol,
            coingeckoId: matchedGecko.id,
            image: matchedGecko.large,
            source: "coingecko_search",
        };
    } catch (err) {
        console.error("Error in getSuggestion:", err.message);
        return { error: true, message: err.message };
    }
};

module.exports.getCandlesfromCoingeko = async (payload) => {
    const { coingeckoId, days } = payload;
    try {
        const response = await axios.get(
            `https://api.coingecko.com/api/v3/coins/${coingeckoId}/ohlc?vs_currency=usd&days=${days}`,
            {
                headers: {
                    accept: 'application/json',
                    'x-cg-demo-api-key': process.env.COINGEKO_API // Replace with your actual CoinGecko key
                }
            }
        );

        return response.data


    } catch (error) {
        console.log(error, "error during fetching CK candles ")
    }





}
module.exports.getCandlesfromBitget = async (payload) => {

    const { symbol, interval, startTime, endTime } = payload;
    try {
        const response = await axios.get(
            `https://api.bitget.com/api/v2/spot/market/candles`,
            {
                params: {
                    symbol: `${symbol}USDT`,
                    granularity: interval,
                    startTime,
                    endTime,
                    limit: 100,
                },
            }
        );


        return response.data.data;


    } catch (error) {
        console.log(error, "error during fetching BG candles ")
}
}
    module.exports.getImages = async (symbol) => {

        if (!symbol) return
        try {
            const response = await axios.get(
                `https://api.coingecko.com/api/v3/coins/${symbol}`,
                {
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

console.log(response?.statusText)
            return response.data.image;


        } catch (error) {
            console.log(error, "error during fetching images ")
        }





    }




