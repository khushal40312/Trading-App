
// const getStockQuote = require('../getStockQuote');
// const aiServices = require('../services/ai.service')

const { tradingAgent } =require("../agents/tradingAgent");

module.exports.aiChat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    const result = await tradingAgent.invoke({ input: message, userId });

    return res.json({ reply: result.reply || "No response generated." });
  } catch (err) {
    console.error("AI Chat error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
};

// const selectTools = (intent) => {
//     const toolMap = {
//         TRADING: ['market_data', 'portfolio_checker', 'risk_calculator'],
//         PORTFOLIO: ['portfolio_data', 'performance_calculator'],
//         MARKET_ANALYSIS: ['price_trend', 'technical_indicators'],
//         EDUCATION: ['trading_glossary', 'quiz_creator'],
//         GENERAL_CHAT: ['small_talk']
//     };
//     return toolMap[intent] || ['general_knowledge'];
// };



// module.exports.aiChat = async (req, res) => {
//     const { message } = req.body;

//     const user = req.user;
//     const userId = req.user.id;
//     const category = await aiServices.classifyInput({ userInput: message, userId });
//     console.log(category)

//     try {

//         switch (category) {
//             case "TRADING":
//                 const memory = aiServices.getRecentMemory(userId);
//                 const previousAi = memory.find(item => item.role === 'ai')?.content.aiReply;

//                 if (memory.length != 0) {

//                     const lastEntities = memory.find(item => item.role === 'meta')?.content.entities;
//                     const lastContext = memory.find(item => item.role === 'meta')?.content.context;
//                     const riskAssessment = aiServices.assessRisk({ entities: lastEntities, context: lastContext });
//                     // console.log(memory)


//                     if (previousAi.includes("confirm") && aiServices.isConfirmed(message)) {
//                         const lastEntities = memory.find(item => item.role === 'meta')?.content.entities;
//                         const lastContext = memory.find(item => item.role === 'meta')?.content.context;

//                         const trade = await aiServices.executeTrade({
//                             userId,
//                             entities: lastEntities,
//                             context: lastContext,
//                         });
//                         const monitoringInterval = aiServices.startTradeMonitoring(getStockQuote, 1);
//                         console.log(monitoringInterval)
//                         const confirmation = aiServices.formatTradeConfirmation(trade);
//                         return res.json({ reply: confirmation });

//                     } else {
//                         const aiReply = await aiServices.generateAIResponseWithMemory({ entities: lastEntities, context: lastContext, riskAssessment })
//                         return res.json({ reply: aiReply });

//                     }

//                 } else if (memory.length == 0) {
//                     const entities = await aiServices.extractTradingEntities(message);
//                     const context = await aiServices.enrichTradingContext(entities, user);
//                     const riskAssessment = aiServices.assessRisk({ entities, context });
//                     const tools = selectTools(category);
//                     const aiReply = await aiServices.generateAIResponse({ entities, context, riskAssessment })
//                     aiServices.saveMessageToMemory(userId, "user", { message });
//                     aiServices.saveMessageToMemory(userId, "ai", { aiReply });
//                     aiServices.saveMessageToMemory(userId, "meta", { entities, context });
//                     return res.json({ aiReply });

//                 }




//             case "PORTFOLIO":
//                 return res.json({ reply: "Portfolio features coming soon!" });

//             case "MARKET_ANALYSIS":
//                 return res.json({ reply: "Market analysis tools are being integrated." });

//             case "EDUCATION":
//                 return res.json({ reply: "Educational mode is coming soon!" });

//             case "GENERAL_CHAT":
//                 return res.json({ reply: "Hey! I'm your AI trading assistant. Ask me anything." });

//             default:
//                 return res.json({ reply: "I couldn't classify that message. Try again!" });
//         }
//     } catch (error) {
//         console.error("❌ AI Chat Error:", error);
//         return res.status(500).json({ error: "Something went wrong!" });
//     }
// };



// const { StateGraph, END, START, Annotation } = require('@langchain/langgraph');
// const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
// const { MemoryVectorStore } = require('langchain/vectorstores/memory');
// const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
// const { Document } = require('langchain/document');
// const { PromptTemplate } = require('@langchain/core/prompts');
// const { StringOutputParser } = require('@langchain/core/output_parsers');

// // Define the state schema using Annotation
// const StateAnnotation = Annotation.Root({
//     messages: Annotation({
//         reducer: (x, y) => x.concat(y),
//         default: () => [],
//     }),
//     userId: Annotation({
//         reducer: (x, y) => y ?? x,
//         default: () => null,
//     }),
//     intent: Annotation({
//         reducer: (x, y) => y ?? x,
//         default: () => null,
//     }),
//     entities: Annotation({
//         reducer: (x, y) => ({ ...x, ...y }),
//         default: () => ({}),
//     }),
//     context: Annotation({
//         reducer: (x, y) => ({ ...x, ...y }),
//         default: () => ({}),
//     }),
//     riskAssessment: Annotation({
//         reducer: (x, y) => y ?? x,
//         default: () => null,
//     }),
//     tools: Annotation({
//         reducer: (x, y) => y ?? x,
//         default: () => [],
//     }),
//     vectorSearchResults: Annotation({
//         reducer: (x, y) => y ?? x,
//         default: () => [],
//     }),
//     needsConfirmation: Annotation({
//         reducer: (x, y) => y ?? x,
//         default: () => false,
//     }),
//     awaitingConfirmation: Annotation({
//         reducer: (x, y) => y ?? x,
//         default: () => false,
//     }),
//     tradeDetails: Annotation({
//         reducer: (x, y) => y ?? x,
//         default: () => null,
//     }),
//     response: Annotation({
//         reducer: (x, y) => y ?? x,
//         default: () => null,
//     }),
// });

// class TradingAIAgent {
//     constructor() {
//         const googleApiKey = process.env.GOOGLE_API_KEY
//         this.llm = new ChatGoogleGenerativeAI({
//             apiKey: googleApiKey,
//             model: 'gemini-2.5-flash',
//             temperature: 0.7,
//         });

//         this.embeddings = new GoogleGenerativeAIEmbeddings({
//             apiKey: googleApiKey,
//             model: 'text-embedding-004',
//         });

//         this.vectorStore = null;
//         this.graph = null;
//         this.userMemory = new Map(); // In-memory user sessions

//         this.initializeVectorStore();
//         this.setupGraph();
//     }

//     async initializeVectorStore() {
//         // Initialize with trading knowledge base
//         const tradingDocs = [
//             new Document({
//                 pageContent: "Risk management is crucial in trading. Never risk more than 2% of your portfolio on a single trade.",
//                 metadata: { type: "risk_management", category: "education" }
//             }),
//             new Document({
//                 pageContent: "Technical analysis uses price charts and indicators like RSI, MACD, and moving averages to predict price movements.",
//                 metadata: { type: "technical_analysis", category: "education" }
//             }),
//             new Document({
//                 pageContent: "Market orders execute immediately at current market price. Limit orders execute only at specified price or better.",
//                 metadata: { type: "order_types", category: "trading" }
//             }),
//             new Document({
//                 pageContent: "Diversification reduces risk by spreading investments across different assets, sectors, or geographic regions.",
//                 metadata: { type: "portfolio_management", category: "strategy" }
//             })
//         ];

//         this.vectorStore = await MemoryVectorStore.fromDocuments(
//             tradingDocs,
//             this.embeddings
//         );
//     }

//     async addDocumentToVectorStore(content, metadata) {
//         const doc = new Document({ pageContent: content, metadata });
//         await this.vectorStore.addDocuments([doc]);
//     }

//     // State definition for the graph
//     getInitialState() {
//         return StateAnnotation.State;
//     }

//     // Graph nodes
//     async classifyIntent(state) {
//         const classificationPrompt = PromptTemplate.fromTemplate(`
//             Classify the user's intent from their message. Return only one of these categories:
//             TRADING, PORTFOLIO, MARKET_ANALYSIS, EDUCATION, GENERAL_CHAT

//             User message: {message}
            
//             Classification:
//         `);

//         const chain = classificationPrompt.pipe(this.llm).pipe(new StringOutputParser());
//         const intent = await chain.invoke({ message: state.messages[state.messages.length - 1].content });

//         return {
//             ...state,
//             intent: intent.trim()
//         };
//     }

//     async vectorSearch(state) {
//         const userMessage = state.messages[state.messages.length - 1].content;

//         // Perform semantic search
//         const searchResults = await this.vectorStore.similaritySearch(userMessage, 3);

//         return {
//             ...state,
//             vectorSearchResults: searchResults
//         };
//     }

//     async extractEntities(state) {
//         const extractionPrompt = PromptTemplate.fromTemplate(`
//             Extract trading entities from the user message. Return a JSON object with:
//             - symbol: stock/crypto symbol if mentioned
//             - quantity: number of shares/units
//             - action: buy/sell/hold
//             - price: specific price if mentioned
//             - timeframe: any time constraints

//             User message: {message}
            
//             Entities (JSON only):
//         `);

//         const chain = extractionPrompt.pipe(this.llm).pipe(new StringOutputParser());
//         const entitiesStr = await chain.invoke({
//             message: state.messages[state.messages.length - 1].content
//         });

//         let entities = {};
//         try {
//             console.log(entitiesStr)
//             const cleaned = entitiesStr.replace(/```json|```/g, '').trim();
          
//             const jsonObject = JSON.parse(cleaned);
//             console.log(jsonObject)
//             entities = jsonObject
//         } catch (e) {
//             console.log('Failed to parse entities:', e);
//         }

//         return {
//             ...state,
//             entities
//         };
//     }

//     async assessRisk(state) {
//         const riskPrompt = PromptTemplate.fromTemplate(`
//             Assess the risk level of this trading scenario:
            
//             Entities: {entities}
//             User Context: {context}
//             Vector Search Context: {vectorContext}
            
//             Provide risk assessment (LOW/MEDIUM/HIGH) with reasoning:
//         `);

//         const vectorContext = state.vectorSearchResults
//             .map(doc => doc.pageContent)
//             .join('\n');

//         const chain = riskPrompt.pipe(this.llm).pipe(new StringOutputParser());
//         const riskAssessment = await chain.invoke({
//             entities: JSON.stringify(state.entities),
//             context: JSON.stringify(state.context),
//             vectorContext
//         });

//         return {
//             ...state,
//             riskAssessment
//         };
//     }

//     async generateResponse(state) {
//         const memory = this.userMemory.get(state.userId) || [];
//         const recentMemory = memory.slice(-10); // Last 10 interactions

//         const responsePrompt = PromptTemplate.fromTemplate(`
//             You are a professional AI trading assistant. Generate a helpful response based on:
            
//             Intent: {intent}
//             User Message: {userMessage}
//             Entities: {entities}
//             Risk Assessment: {riskAssessment}
//             Relevant Knowledge: {vectorContext}
//             Recent Conversation: {recentMemory}
            
//             Guidelines:
//             - Be professional and helpful
//             - Include risk warnings for trading advice
//             - Use the vector search results for accurate information
//             - For trading intents, ask for confirmation before suggesting execution
//             - Provide educational context when appropriate
            
//             Response:
//         `);

//         const userMessage = state.messages[state.messages.length - 1].content;
//         const vectorContext = state.vectorSearchResults
//             .map(doc => doc.pageContent)
//             .join('\n');

//         const chain = responsePrompt.pipe(this.llm).pipe(new StringOutputParser());
//         const response = await chain.invoke({
//             intent: state.intent,
//             userMessage,
//             entities: JSON.stringify(state.entities),
//             riskAssessment: state.riskAssessment,
//             vectorContext,
//             recentMemory: JSON.stringify(recentMemory)
//         });

//         // Check if response requires confirmation
//         const needsConfirmation = state.intent === 'TRADING' &&
//             (response.toLowerCase().includes('confirm') ||
//                 response.toLowerCase().includes('proceed'));

//         return {
//             ...state,
//             response,
//             needsConfirmation
//         };
//     }

//     async handleConfirmation(state) {
//         const userMessage = state.messages[state.messages.length - 1].content;
//         const isConfirmed = /yes|confirm|proceed|execute/i.test(userMessage);

//         if (isConfirmed) {
//             // Simulate trade execution
//             const tradeResult = {
//                 status: 'executed',
//                 symbol: state.entities.symbol,
//                 quantity: state.entities.quantity,
//                 action: state.entities.action,
//                 timestamp: new Date().toISOString()
//             };

//             const confirmationResponse = `✅ Trade executed successfully!
            
// Symbol: ${tradeResult.symbol}
// Action: ${tradeResult.action}
// Quantity: ${tradeResult.quantity}
// Time: ${tradeResult.timestamp}

// Trade has been recorded in your portfolio.`;

//             return {
//                 ...state,
//                 response: confirmationResponse,
//                 tradeDetails: tradeResult,
//                 needsConfirmation: false,
//                 awaitingConfirmation: false
//             };
//         } else {
//             return {
//                 ...state,
//                 response: "Trade cancelled. Let me know if you'd like to try something else!",
//                 needsConfirmation: false,
//                 awaitingConfirmation: false
//             };
//         }
//     }

//     // Routing logic
//     shouldExtractEntities(state) {
//         return state.intent === 'TRADING' ? 'extractEntities' : 'vectorSearch';
//     }

//     shouldAssessRisk(state) {
//         return state.intent === 'TRADING' ? 'assessRisk' : 'generateResponse';
//     }

//     shouldConfirm(state) {
//         if (state.awaitingConfirmation) {
//             return 'handleConfirmation';
//         }
//         if (state.needsConfirmation) {
//             return END;
//         }
//         return END;
//     }

//     setupGraph() {
//         const workflow = new StateGraph(StateAnnotation);

//         // Add nodes
//         workflow.addNode('classifyIntent', this.classifyIntent.bind(this));
//         workflow.addNode('vectorSearch', this.vectorSearch.bind(this));
//         workflow.addNode('extractEntities', this.extractEntities.bind(this));
//         workflow.addNode('assessRisk', this.assessRisk.bind(this));
//         workflow.addNode('generateResponse', this.generateResponse.bind(this));
//         workflow.addNode('handleConfirmation', this.handleConfirmation.bind(this));

//         // Set entry point
//         workflow.setEntryPoint('classifyIntent');

//         // Add edges
//         workflow.addConditionalEdges('classifyIntent', this.shouldExtractEntities.bind(this));
//         workflow.addEdge('extractEntities', 'vectorSearch');
//         workflow.addConditionalEdges('vectorSearch', this.shouldAssessRisk.bind(this));
//         workflow.addEdge('assessRisk', 'generateResponse');
//         workflow.addConditionalEdges('generateResponse', this.shouldConfirm.bind(this));

//         this.graph = workflow.compile();
//     }

//     async processMessage(userId, message) {
//         // Get or create user memory
//         if (!this.userMemory.has(userId)) {
//             this.userMemory.set(userId, []);
//         }

//         const memory = this.userMemory.get(userId);
//         const isAwaitingConfirmation = memory.length > 0 &&
//             memory[memory.length - 1]?.needsConfirmation;

//         const initialState = {
//             messages: [{ role: 'user', content: message }],
//             userId,
//             awaitingConfirmation: isAwaitingConfirmation
//         };

//         try {
//             const result = await this.graph.invoke(initialState);

//             // Save to memory
//             memory.push({
//                 userMessage: message,
//                 aiResponse: result.response,
//                 entities: result.entities,
//                 intent: result.intent,
//                 needsConfirmation: result.needsConfirmation,
//                 timestamp: new Date().toISOString()
//             });

//             // Keep only last 50 interactions
//             if (memory.length > 50) {
//                 memory.splice(0, memory.length - 50);
//             }

//             return result;
//         } catch (error) {
//             console.error('Graph processing error:', error);
//             return {
//                 response: "I apologize, but I encountered an error processing your request. Please try again."
//             };
//         }
//     }
// }

// // Updated controller
// const aiAgent = new TradingAIAgent(process.env.GOOGLE_API_KEY);

// module.exports.aiChat = async (req, res) => {
//     const { message } = req.body;
//     const userId = req.user.id;

//     try {
//         const result = await aiAgent.processMessage(userId, message);

//         return res.json({
//             reply: result.response,
//             intent: result.intent,
//             entities: result.entities,
//             needsConfirmation: result.needsConfirmation
//         });
//     } catch (error) {
//         console.error("❌ AI Chat Error:", error);
//         return res.status(500).json({ error: "Something went wrong!" });
//     }
// };

// // Utility function to add knowledge to vector store
// module.exports.addKnowledge = async (content, metadata) => {
//     await aiAgent.addDocumentToVectorStore(content, metadata);
// };

// module.exports.TradingAIAgent = TradingAIAgent;