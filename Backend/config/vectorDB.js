const { Chroma } = require("@langchain/community/vectorstores/chroma");
const { OpenAIEmbeddings } = require("@langchain/google-genai");
// const { v4 as uuidv4 } = require("uuid");



const memory = await Chroma.fromExistingCollection(
    new OpenAIEmbeddings(),
    { collectionName: "ai-trade-memory" }
);

// Save memory
await memory.addDocuments([
    {
        pageContent: "User wanted to buy BTC under 40k",
        metadata: { userId: "u123", timestamp: Date.now() },
    },
]);

// Retrieve similar memory
const results = await memory.similaritySearch("Buy 0.5 BTC", 3);
