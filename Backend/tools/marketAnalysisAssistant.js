const { model } = require("../aiModel/gemini");
const { getLatest2TradesandInteractions } = require("../services/ai.service");

const marketAnalysisAssistant = {
  name: "marketAnalysisAssistant",
  description: "Classifies the user's trade input and provides structured market analysis data requirements",

  func: async ({ input, user, sessionId }) => {
    try {
      // Get context data with error handling
      const data = await getLatest2TradesandInteractions(user.id, sessionId);
      const memoryContext = data ? JSON.stringify(data) : "No previous trading history available";

      const prompt = `
        You are a crypto market analysis classifier. Analyze the user's input and determine what data needs to be fetched.

        Context Information:
        - Previous Trading History: ${memoryContext}
        - Current User Input: "${input}"
        
        Please classify this input and return a JSON response with the following structure:
        {
          "classification": "MARKET_ANALYSIS",
          "confidence": 0.95,
          "intent": "price_analysis" | "trend_analysis" | "market_research" | "forecast_request" | "general_inquiry",
          "requiredData": {
            "symbols": ["BTC", "ETH"],
            "timeframes": "1min"|| "3min"|| "5min"|| "15min"|| "30min"|| "1h"|| "4h"|| "12h"|| "1day"|| "1week"|| "1M",
            "dataTypes": ["price", "volume", "market_cap", "technical_indicators"]
            
          }
          "contextualNotes": "Brief explanation of what the user is asking for",
          "suggestedResponse": "Template for how to structure the response to user"
        }
        
        Make sure to identify specific cryptocurrencies mentioned, time periods, and type of analysis requested.
        If no specific crypto is mentioned, suggest popular ones like BTC, ETH.
        Ensure all JSON is properly formatted and valid.
      `;

      const result = await model.invoke(prompt);

      // Clean and parse response with better error handling
      let cleaned = result.content;
      if (typeof cleaned !== 'string') {
        cleaned = JSON.stringify(cleaned);
      }

      // Remove markdown code blocks
      cleaned = cleaned.replace(/```json|```/g, '').trim();

      // Attempt to parse JSON
      let jsonObject;
      try {
        jsonObject = JSON.parse(cleaned);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        // Fallback response structure
        jsonObject = {
          classification: "MARKET_ANALYSIS",
          confidence: 0.7,
          intent: "general_inquiry",
          requiredData: {
            symbols: ["BTC", "ETH"],
            timeframes: ["24h"],
            dataTypes: ["price", "volume"]

          },
          contextualNotes: `Failed to parse AI response. Original input: ${input}`,
          suggestedResponse: "I'll help you with crypto market analysis. Let me fetch the latest data.",
          error: "AI_PARSE_ERROR",
          originalResponse: cleaned
        };
      }

      // Validate required fields and add defaults if missing
      const validatedResponse = {
        classification: jsonObject.classification || "MARKET_ANALYSIS",
        confidence: jsonObject.confidence || 0.5,
        intent: jsonObject.intent || "general_inquiry",
        requiredData: {
          symbols: jsonObject.requiredData?.symbols || ["BTC", "ETH"],
          timeframes: jsonObject.requiredData?.timeframes || ["24h"],
          dataTypes: jsonObject.requiredData?.dataTypes || ["price", "volume"]
        },
        contextualNotes: jsonObject.contextualNotes || `User requested market analysis for: ${input}`,
        suggestedResponse: jsonObject.suggestedResponse || "I'll analyze the market data for you.",
        timestamp: new Date().toISOString(),
        sessionId: sessionId,
        userId: user.id
      };
      console.log(validatedResponse.requiredData.symbols, validatedResponse.requiredData.timeframes, validatedResponse.requiredData.dataTypes)
      return validatedResponse

    } catch (error) {
      console.error('Market Analysis Assistant Error:', error);

      // Return graceful error response
      return {
        success: false,
        error: {
          type: error.name || 'UNKNOWN_ERROR',
          message: error.message || 'Failed to process market analysis request',
          timestamp: new Date().toISOString()
        },
        fallbackData: {
          classification: "MARKET_ANALYSIS",
          confidence: 0.3,
          intent: "error_recovery",
          requiredData: {
            symbols: ["BTC", "ETH"],
            timeframes: ["24h"],
            dataTypes: ["price"],
            analysisType: "technical"
          },
          apiEndpoints: [
            {
              endpoint: "/api/crypto/price",
              params: { symbols: ["BTC", "ETH"], interval: "24h" },
              priority: 1
            }
          ],
          contextualNotes: `Error processing request: ${input}`,
          suggestedResponse: "I encountered an issue analyzing your request. Let me fetch basic market data instead."
        }
      };
    }
  }
};

module.exports = { marketAnalysisAssistant };