// agents/tradingAgent.js
const { StateGraph, START, END } = require("@langchain/langgraph");
const { classifyTool } = require("../tools/classify");
const { extractTradingEntities } = require("../tools/extractTradingEntities");
const { AgreementDetector } = require("../tools/agreeDetection");
const { extractTradingContext } = require("../tools/enrichTradingContext");
const { tradingInputClassifierTool } = require("../tools/TradingInputClassifier");
const { generateAIResponse } = require("../tools/generateAIResponse");
const { storeSessionInRedis } = require("../services/ai.service");
const { finalTradeExtractorTool } = require("../tools/FinalTradingEntityExtractor");
const { tradeExecutionTool } = require("../tools/executeTrade");
const { tradeInformation } = require("../tools/tradeInformation");
const { pendingTradeChecker } = require("../tools/pendingTradeChecker");
const { executedTradeChecker } = require("../tools/executedTradeChecker");
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
      entities: state.entities
    });

    const finalState = {
      ...state,
      reply,
    };

    // Store the complete session data in Redis
    await storeSessionInRedis(finalState);

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

const tradeInformationNode = async (state) => {
  try {
    const tradeInfoClassification = await tradeInformation.func({
      input: state.input,
    });

    return {
      ...state,
      tradeInfoClassification
    };
  } catch (error) {
    return {
      ...state,
      tradeInfoClassification: { type: "ERROR" },
      error: error.message
    };
  }
};

const pendingTradeCheckerNode = async (state) => {
  try {
    const reply = await pendingTradeChecker.func({
      input: state.input,
      user: state.user,
      sessionId: state.sessionId
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

const executedTradeCheckerNode = async (state) => {
  try {
    const reply = await executedTradeChecker.func({
      input: state.input,
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
    tradeInfoClassification: "string"
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
graphBuilder.addNode("tradeInformation", tradeInformationNode);
graphBuilder.addNode("pendingTradeChecker", pendingTradeCheckerNode);
graphBuilder.addNode("executedTradeChecker", executedTradeCheckerNode);






graphBuilder.addEdge(START, "classify")

graphBuilder.addConditionalEdges(
  "classify",
  (state) => {
    if (state.error) return END;
    if (state.category === "TRADING") return "tradingInputClassifier";
    return END;
  }
);

graphBuilder.addConditionalEdges(
  "tradingInputClassifier",
  (state) => {
    if (state.error) return END;


    if (state.tradeClassification.category === "FRESH_TRADING_REQUEST") return "extractTradingEntitiesToJson";
    if (state.tradeClassification.category === "TRADE_CONFIRMATION") return "AgreementDetector";
    if (state.tradeClassification.category === "TRADE_INFORMATION") return "tradeInformation";



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
graphBuilder.addConditionalEdges(
  "tradeInformation",
  (state) => {
    if (state.error) return END;
    if (state.tradeInfoClassification === "PENDING_TRADES") return "pendingTradeChecker";
    if (state.tradeInfoClassification === "EXECUTED_TRADES") return "executedTradeChecker";

    return END;
  }

);


// 4. Compile the graph
const tradingAgent = graphBuilder.compile();

// 5. Export
module.exports = { tradingAgent };
