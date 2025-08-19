

const marketAnalyserContext = {
    name: "marketAnalyserContext",
    description: "Extract market context",

    func: async ({ user, entities }) => {
        try {
           

            const context = {
           
            };

            
            return context;

        } catch (error) {
            console.log("ERROR DURING CONTEXT MAKING ", error.message)
            return {
                error: error.message
            };
        }
    }


};
module.exports = { extractTradingContext }


