const { model } = require("../aiModel/gemini");




const agreeDetection = {
    name: "inputAgreeDetection",
    description: "detect that user input is agreewith old genration or Not based on its tone and old memory.",
    func: async ({ input, user }) => {


    const detectionPrompt = `

      You are an agreeDetector, Analyse Fresh User Input and Memory Context (if available) an tell that is user confirming to someting  :
      - YES
      - NO

      
     📌 Memory Context:
         ${memoryContext}

     Fresh User Input: "${input}",
    
      🔁 Instructions:
      - Always read recent conversation before response if coversation available.
      - return only just the  YES or NO .
       `;

    const result = await model.invoke(detectionPrompt);
    return result.content.trim();

}
}

module.exports = { agreeDetection }


