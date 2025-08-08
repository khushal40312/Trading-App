// agents/tradingAgent.js
const { StateGraph, START, END } = require("@langchain/langgraph");
const { classifyTool } = require("../tools/classify");
const { extractTradingEntities } = require("../tools/extractTradingEntities");
const { agreeDetection } = require("../tools/agreeDetection");
const { extractTradingContext } = require("../tools/enrichTradingContext");
const { tradingInputClassifierTool } = require("../tools/TradingInputClassifier");
const { generateAIResponse } = require("../tools/generateAIResponse");
const {storeSessionInRedis} = require("../services/ai.service")
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
      tradeClassification: { type: "ERROR" },
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
    reply: "string",
    error: "string" // Added for error handling
  }
});

graphBuilder.addNode("classify", classifyNode);
graphBuilder.addNode("tradingInputClassifier", tradingInputClassifierNode);
graphBuilder.addNode("extractTradingEntitiesToJson", extractTradingEntitiesNode);
graphBuilder.addNode("extractTradingContext", extractTradingContextNode);
graphBuilder.addNode("initialResponse", generateAIResponseNode);

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
    return END;
  }
);

graphBuilder.addEdge("extractTradingEntitiesToJson", "extractTradingContext");
graphBuilder.addEdge("extractTradingContext", "initialResponse");

// Final edge to END
graphBuilder.addEdge("initialResponse", END);
// 
// 4. Compile the graph
const tradingAgent = graphBuilder.compile();

// 5. Export
module.exports = { tradingAgent };
