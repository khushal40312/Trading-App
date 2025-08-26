const { model, analyzeModel } = require("../aiModel/gemini");
const redisClient = require("../config/redisClient");




const AgreementDetector = {
  name: "AgreementDetector",
  description: "detect user response tone level",
  func: async ({ input, user, sessionId }) => {

    const data = await redisClient.get(`session:data:${user.id}:${sessionId}`)
    let memoryContext = data ? JSON.stringify(data) : "";

    const agreementPrompt = `
        User Fresh Input: "${input}"
        Old Memory and User's Pending Trades : ${memoryContext}
        
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
    const result = await analyzeModel(agreementPrompt);
    let parsed = JSON.parse(result)
   
    return parsed;

  }
}

module.exports = { AgreementDetector }


