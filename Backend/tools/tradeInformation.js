const { model } = require("../aiModel/gemini");





const tradeInformation = {
    name: "tradeInformation",
    description: "give user any recent or going trade info",
    func: async ({ input }) => {


        const Prompt = `
        User  Input: "${input}"
        
     You are a trading app Assistant Determine input type:
        1. PENDING_TRADES- User asking about Pending Trades 
        2. EXECUTED_TRADES- User asking about his general Trade History 
        


        
      `;
        const result = await model.invoke(Prompt);

        return result

    }
}

module.exports = { tradeInformation }


