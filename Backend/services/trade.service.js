const { default: axios } = require("axios");

// Replace this with your actual CoinGecko API key
const COINGECKO_API_KEY = "CG-koLDAFFUE841gxtwW7rXepxt";

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
                            'x-cg-demo-api-key': COINGECKO_API_KEY,
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
                'x-cg-pro-api-key': COINGECKO_API_KEY,
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
