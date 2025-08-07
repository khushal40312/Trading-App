// vector/vectorStore.js
const { PineconeStore } = require("@langchain/pinecone");

const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { pinecone } = require("./pineconeClient");

// Initialize Gemini embeddings
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "models/embedding-001",
});

// You must create this index via the Pinecone dashboard first
const indexName = "trading-memory";

async function getVectorStore() {
  const pineconeIndex = pinecone.Index(indexName);

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: "user-memory", // Optional, helpful for user separation
  });

  return vectorStore;
}

// (async () => {
  
  
//   const store = await getVectorStore();
//   const stats = await pinecone.describeIndex(indexName);
//   console.log("📊 Index Stats:", stats);
  
//   console.log("✅ Vector store initialized");

//   const result = await store.addDocuments([
//     {
//       pageContent: "Should I buy Google stock today?",
//       metadata: { userId: "user-123" },
//     },
//   ]);

//   console.log("✅ Document added to Pinecone!", result);
// })();

module.exports = { getVectorStore };
