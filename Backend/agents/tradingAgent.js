// agents/tradingAgent.js
const { StateGraph, START } = require("@langchain/langgraph");
const { classifyTool } = require("../tools/classify");
const { geminiChat } = require("../aiModel/gemini");
const { extractTradingEntities } = require("../tools/extractTradingEntities");

// 1. Node function: classify
const classifyNode = async (state) => {
  const category = await classifyTool.func({
    input: state.input,
    userId: state.userId,
  });


  return {
    ...state,
    category,
  };
};

const extractTradingEntitiesNode = async (state) => {
  const json = await extractTradingEntities.func({
    input: state.input,
    userId: state.userId,
  });
  return {
    ...state,
    json,
  };
};
// 2. Create a new StateGraph with type info
const graphBuilder = new StateGraph({
  channels: {
    input: "string",
    userId: "string",
    category: "string",
    json: "object",
  }
})

graphBuilder.addNode("classify", classifyNode);
graphBuilder.addEdge(START, "classify")
graphBuilder.addNode("extractTradingEntitiesToJson", extractTradingEntitiesNode);
graphBuilder.addConditionalEdges(
  "classify",
  (state) => {
    // return different node names based on state.category
    if (state.category === "TRADING") return "extractTradingEntitiesToJson";
    return "END";
  }
)

// 4. Compile the graph
const tradingAgent = graphBuilder.compile();

// 5. Export
module.exports = { tradingAgent };
