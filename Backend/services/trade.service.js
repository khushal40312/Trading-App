const { default: axios } = require("axios")


// const API_KEY = process.env.FINNHUB_API;


// module.exports.getSuggetion = async (input) => {
//     console.log(input)
//     try {

//         const { data } = await axios.get('https://api.coingecko.com/api/v3/search/trending', {

//             headers: {
//                 accept: 'application/json',
//                 'x-cg-pro-api-key': 'CG-koLDAFFUE841gxtwW7rXepxt'
//             }
//         });

//         console.log(data)
//         return data // c = current price
//     } catch (error) {
//         console.error(`Error fetching ${input}:`, error.message);
//         return { input, price: null, error: true };
//     }



// }
// const { default: axios } = require("axios");

module.exports.getSuggestion = async (input) => {
    try {
        const { data } = await axios.get("https://api.coingecko.com/api/v3/search", {
            params: { query: input },
            headers: {
                accept: "application/json",
            }
        });

        return data.coins // Return just the matched coins (optional)
    } catch (error) {
        console.error(`Error fetching suggestions for "${input}":`, error.message);
        return { input, error: true };
    }
};
