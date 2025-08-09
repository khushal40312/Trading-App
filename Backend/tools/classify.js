const { model } = require("../aiModel/gemini");
const redisClient = require("../config/redisClient");

const classifyTool = {
  name: "classifyInput",
  description: "Classifies the user's message into categories.",

  func: async ({ input, user, sessionId }) => {
    console.log(input)
    const data = await redisClient.get(`session:data:${user.id}:${sessionId}`)

    let memoryContext;
    if (data == null) {
      memoryContext = ''
    } else {
      let parsed = JSON.parse(data);
      memoryContext = JSON.stringify(parsed.interaction)

    }


    const classificationPrompt = `

      Classify the user fresh input + old Conversation memory context into one of these categories based on a trading app   :
      - TRADING
      - PORTFOLIO
      - MARKET_ANALYSIS
      - EDUCATION
      - GENERAL_CHAT
      
     📌 Memory Context:{${memoryContext}}

     Fresh User Input: "${input}",
    
      🔁 Instructions:
      - Always read recent conversation before response if coversation available.
      - just the category name or out of context .
       `;

    const result = await model.invoke(classificationPrompt);
    return result.content.trim();

  }

};
module.exports = { classifyTool }


