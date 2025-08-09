const { model } = require("../aiModel/gemini");
const redisClient = require("../config/redisClient");




const AgreementDetector = {
    name: "AgreementDetector",
    description: "detect user response tone level",
    func: async ({ input, user ,sessionId}) => {

        const data = await redisClient.get(`session:data:${user.id}:${sessionId}`)
        let memoryContext;
        if (!data) {
          memoryContext = ''
        } else {
    
          memoryContext = JSON.parse(data);
        }
        const agreementPrompt = `
        User Fresh Input: "${input}"
        Context: ${JSON.stringify(memoryContext.interaction)}
        Pending Trade: ${memoryContext.pendingTrade ? JSON.stringify(memoryContext.pendingTrade) : 'None'}
        
        Determine agreement level:
        - STRONG_YES: Clear confirmation (yes, go ahead, confirm, execute, etc.)
        - WEAK_YES: Probable agreement but unclear (ok, sure, maybe)
        - CLARIFICATION_NEEDED: User asking questions about the trade
        - MODIFICATION_REQUEST: Want to change something
        - STRONG_NO: Clear rejection (no, cancel, stop, etc.)
        - UNCLEAR: Cannot determine intent
        
        Return: {
          "agreement": "...",
          "confidence": 0.9,
          "extracted_concerns": [...],
          "needs_clarification": boolean
        }
      `;
      const result = await model.invoke(agreementPrompt);
      const cleaned = result.content.replace(/```json|```/g, '').trim();
      const jsonObject = JSON.parse(cleaned);
      return jsonObject

}
}

module.exports = { AgreementDetector }


