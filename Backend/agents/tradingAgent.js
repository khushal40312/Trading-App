// agents/tradingAgent.js
const { StateGraph, START, END } = require("@langchain/langgraph");
const { classifyTool } = require("../tools/classify");
const { extractTradingEntities } = require("../tools/extractTradingEntities");
const { AgreementDetector } = require("../tools/agreeDetection");
const { extractTradingContext } = require("../tools/enrichTradingContext");
const { tradingInputClassifierTool } = require("../tools/TradingInputClassifier");
const { generateAIResponse } = require("../tools/generateAIResponse");
const { storeSessionInRedis, appendInteraction, storeSessionStructureInRedis } = require("../services/ai.service");
const { finalTradeExtractorTool } = require("../tools/FinalTradingEntityExtractor");
const { tradeExecutionTool } = require("../tools/executeTrade");
const { unifiedTradeAssistant } = require("../tools/unifiedTradeAssistant");
const { appendPendingTrade } = require("../services/ai.service");
const { tradeCancellationResolverTool } = require("../tools/tradeCancellation");
const { marketAnalysisAssistant } = require("../tools/marketAnalysisAssistant");
const { marketAnalyserContext } = require("../tools/marketAnalyserContext");
const { marketAnalysisGenerator } = require("../tools/marketAnalysisGenerator");
// 1. Node function: classify
const classifyNode = async (state) => {
  try {
    const category = await classifyTool.func({
      input: state.input,
      user: state.user,
      sessionId: state.sessionId
    });

    return {
      ...state,
      category,
    };
  } catch (error) {
    return {
      ...state,
      category: "ERROR",
      error: error.message
    };
  }
};
const tradingInputClassifierNode = async (state) => {
  try {
    const tradeClassification = await tradingInputClassifierTool.func({
      input: state.input,
      user: state.user,
      sessionId: state.sessionId
    });

    return {
      ...state,
      tradeClassification,
    };
  } catch (error) {
    return {
      ...state,
      tradeClassification: { type: "ERROR" },
      error: error.message
    };
  }
};
const extractTradingEntitiesNode = async (state) => {
  try {
    const entities = await extractTradingEntities.func({
      input: state.input,
      user: state.user,
      sessionId: state.sessionId
    });

    return {
      ...state,
      entities,
    };
  } catch (error) {
    return {
      ...state,
      entities: {},
      error: error.message
    };
  }
};
const extractTradingContextNode = async (state) => {
  try {
    const context = await extractTradingContext.func({
      input: state.input,
      user: state.user,
      sessionId: state.sessionId,
      entities: state.entities
    });

    return {
      ...state,
      context,
    };


  } catch (error) {
    return {
      ...state,
      context: {},
      error: error.message
    };
  }
};
const generateAIResponseNode = async (state) => {
  try {
    const reply = await generateAIResponse.func({
      input: state.input,
      user: state.user,
      sessionId: state.sessionId,
      context: state.context,
      entities: state.entities,
      tradeClassification: state.tradeClassification
    });

    const finalState = {
      ...state,
      reply,
    };

    const newTrade = {
      entities: state.entities,
      context: state.context,
      tradeClassification: state.tradeClassification,
      category: state.category,
      sessionId: state.sessionId,
      userId: state.user._id.toString(),
      status: "WAITING_FOR_CONFIRMATION",
      timestamp: new Date().toISOString()
    }
    const newInteractions = {
      input: state.input,
      reply,
      timestamp: new Date().toISOString()
    }
    const isExists = await appendPendingTrade(state.user.id, state.sessionId, finalState);
    if (!isExists) {
      await storeSessionInRedis(finalState);
    } else {
      await appendPendingTrade(state.user.id, state.sessionId, newTrade);
      await appendInteraction(state.user.id, state.sessionId, newInteractions);
    }
    // Store the complete session data in Redis
    return finalState;

  } catch (error) {
    return {
      ...state,
      reply: { type: "ERROR" },
      error: error.message
    };
  }
};
const AgreementDetectorNode = async (state) => {
  try {
    const agreeDetection = await AgreementDetector.func({
      input: state.input,
      user: state.user,
      sessionId: state.sessionId
    });

    return {
      ...state,
      agreeDetection,
    };
  } catch (error) {
    return {
      ...state,
      agreeDetection: { type: "ERROR" },
      error: error.message
    };
  }
};
const finalTradeExtractorToolNode = async (state) => {
  try {
    const finalJson = await finalTradeExtractorTool.func({
      input: state.input,
      sessionId: state.sessionId,
      user: state.user
    });

    return {
      ...state,
      finalJson,
    };
  } catch (error) {
    return {
      ...state,
      finalJson: { type: "ERROR" },
      error: error.message
    };
  }
};
const tradeExecutionToolNode = async (state) => {
  try {
    const executedTrade = await tradeExecutionTool.func({
      finalJson: state.finalJson,
      sessionId: state.sessionId
    });

    return {
      ...state,
      reply: executedTrade.reply
    };
  } catch (error) {
    return {
      ...state,
      reply: { type: "ERROR" },
      error: error.message
    };
  }
};
const unifiedTradeAssistantNode = async (state) => {
  try {
    const reply = await unifiedTradeAssistant.func({
      input: state.input,
      user: state.user,
      sessionId: state.sessionId
    });
    const newInteractions = {
      input: state.input,
      reply,
      timestamp: new Date().toISOString()
    }
    const structure = {
      pendingTrades: [],
      interaction: [
        {
          input: state.input,
          reply,
          timestamp: new Date().toISOString()
        }
      ]
    };
    const isExists = await appendPendingTrade(state.user.id, state.sessionId, structure);
    if (!isExists) {
      await storeSessionStructureInRedis(structure, state.user.id, state.sessionId);
    } else {

      await appendInteraction(state.user.id, state.sessionId, newInteractions);
    }
    return {
      ...state,
      reply
    };
  } catch (error) {
    return {
      ...state,
      reply: { type: "ERROR" },
      error: error.message
    };
  }
};
const tradeCancellationResolverNode = async (state) => {
  try {
    const reply = await tradeCancellationResolverTool.func({
      input: state.input,
      sessionId: state.sessionId,
      user: state.user
    });

    return {
      ...state,
      reply
    };
  } catch (error) {
    return {
      ...state,
      reply: { type: "ERROR" },
      error: error.message
    };
  }
};
const marketAnalysisAssistantNode = async (state) => {
  try {
    const marketClassification = await marketAnalysisAssistant.func({
      input: state.input,
      sessionId: state.sessionId,
      user: state.user
    });

    return {
      ...state,
      marketClassification
    };
  } catch (error) {
    return {
      ...state,
      marketClassification: { type: "ERROR" },
      error: error.message
    };
  }
};

const marketAnalysisContextNode = async (state) => {
  try {
    const marketClassificationContext = await marketAnalyserContext.func({
      input: state.input,
      sessionId: state.sessionId,
      user: state.user,
      marketClassification: state.marketClassification
    });

    return {
      ...state,
      marketClassificationContext
    };
  } catch (error) {
    return {
      ...state,
      marketClassificationContext: { type: "ERROR" },
      error: error.message
    };
  }
};
const marketAnalysisGeneratorNode = async (state) => {
  try {
    const reply = await marketAnalysisGenerator.func({
      input: state.input,
      sessionId: state.sessionId,
      user: state.user,
      marketClassificationContext: state.marketClassificationContext
    });

    const newInteractions = {
      input: state.input,
      reply,
      timestamp: new Date().toISOString()
    }
    const structure = {
      pendingTrades: [],
      interaction: [
        {
          input: state.input,
          reply,
          timestamp: new Date().toISOString()
        }
      ]
    };
    const isExists = await appendPendingTrade(state.user.id, state.sessionId, structure);
    if (!isExists) {
      await storeSessionStructureInRedis(structure, state.user.id, state.sessionId);
    } else {

      await appendInteraction(state.user.id, state.sessionId, newInteractions);
    }

    return {
      ...state,
      reply
    };
  } catch (error) {
    return {
      ...state,
      reply: { type: "ERROR" },
      error: error.message
    };
  }
};
// Create StateGraph with proper type definitions
const graphBuilder = new StateGraph({
  channels: {
    input: "string",
    user: "object",
    category: "string",
    type: "string",
    entities: "object",
    sessionId: "string",
    context: "object",
    tradeClassification: "object",
    reply: "any",
    error: "string",
    agreeDetection: "string",
    finalJson: "object",
    executedTrade: "object",
    tradeInfoClassification: "string",
    marketClassification: 'object',
    marketClassificationContext: 'object'
  }
});
graphBuilder.addNode("classify", classifyNode);
graphBuilder.addNode("tradingInputClassifier", tradingInputClassifierNode);
graphBuilder.addNode("extractTradingEntitiesToJson", extractTradingEntitiesNode);
graphBuilder.addNode("extractTradingContext", extractTradingContextNode);
graphBuilder.addNode("initialResponse", generateAIResponseNode);
graphBuilder.addNode("AgreementDetector", AgreementDetectorNode);
graphBuilder.addNode("finalTradeExtractor", finalTradeExtractorToolNode);
graphBuilder.addNode("tradeExecutionTool", tradeExecutionToolNode);
graphBuilder.addNode("unifiedTradeAssistant", unifiedTradeAssistantNode);
graphBuilder.addNode("tradeCancellationResolver", tradeCancellationResolverNode);
graphBuilder.addNode("marketAnalysisAssistant", marketAnalysisAssistantNode);
graphBuilder.addNode("marketAnalyserContext", marketAnalysisContextNode);
graphBuilder.addNode("marketAnalysisGenerator", marketAnalysisGeneratorNode);





graphBuilder.addEdge(START, "classify")

graphBuilder.addConditionalEdges(
  "classify",
  (state) => {
    if (state.error) return END;
    if (state.category === "TRADING") return "tradingInputClassifier";
    if (state.category === "PORTFOLIO") return "unifiedTradeAssistant";
    if (state.category === "GENERAL_CHAT") return "unifiedTradeAssistant";
    if (state.category === "MARKET_ANALYSIS") return "marketAnalysisAssistant";
    return END;
  }
);
graphBuilder.addEdge("marketAnalysisAssistant", "marketAnalyserContext");
graphBuilder.addEdge("marketAnalyserContext", "marketAnalysisGenerator");
graphBuilder.addEdge("marketAnalysisGenerator", END);

graphBuilder.addConditionalEdges(
  "tradingInputClassifier",
  (state) => {
    if (state.error) return END;
    if (state.tradeClassification.category === "FRESH_TRADING_REQUEST") return "extractTradingEntitiesToJson";
    if (state.tradeClassification.category === "TRADE_CONFIRMATION") return "AgreementDetector";
    if (state.tradeClassification.category === "GENERAL_QUESTION") return "unifiedTradeAssistant";
    if (state.tradeClassification.category === "TRADE_MODIFICATION") return "extractTradingEntitiesToJson";
    if (state.tradeClassification.category === "TRADE_CANCELLATION") return "tradeCancellationResolver";


    return END;
  }
);
graphBuilder.addEdge("extractTradingEntitiesToJson", "extractTradingContext");
graphBuilder.addEdge("extractTradingContext", "initialResponse");
graphBuilder.addEdge("initialResponse", END);

graphBuilder.addConditionalEdges(
  "AgreementDetector",
  (state) => {
    if (state.error) return END;


    if (state.agreeDetection.agreement === "STRONG_YES") return "finalTradeExtractor";

    return END;
  }

);
graphBuilder.addConditionalEdges(
  "finalTradeExtractor",
  (state) => {
    if (state.error) return END;

    if (state.finalJson.jsonObject.reply === "No Pending trade found in memory") return END;

    if (state.finalJson.jsonObject.reply === "PASS") return "tradeExecutionTool";

    return END;
  }

);

graphBuilder.addEdge("tradeExecutionTool", END);



// 4. Compile the graph
const tradingAgent = graphBuilder.compile();

// 5. Export
module.exports = { tradingAgent };
