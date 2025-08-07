
const { getVectorStore } = require("../vector/vectorStore");

const retrieveMemoryTool = {
    name: "retrieveMemory",
    description: "Retrieves recent or relevant memory from vector DB (Pinecone)",
    func: async ({ input, userId }) => {
        const vectorStore = await getVectorStore();

        const results = await vectorStore.similaritySearch(input, 3, {
            userId, // only return memory for this user
        });

        const memories = results.map((doc) => `🔹 ${doc.pageContent}`).join("\n");
        console.log('memories:',memories)
        return memories || "No relevant memory found.";
    },
};

module.exports = { retrieveMemoryTool };
