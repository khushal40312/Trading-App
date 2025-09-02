// tools/retrieveMemoryTool.js
const { getVectorStore } = require("../vector/vectorStore");

const retrieveMemoryTool = {
    name: "retrieveMemory",
    description: "Retrieves recent or relevant memory from vector DB (Pinecone)",
    func: async ({ input, userId, dataType }) => {
        const vectorStore = await getVectorStore();

        // Build metadata filter dynamically
        const filter = { userId };
        if (dataType) {
            filter.type = dataType;
        }

        const results = await vectorStore.similaritySearch(input, 1, filter);

        const memories = results
            .map((doc) => `🔹 ${doc.pageContent}`)
            .join("\n");

        // console.log("memories:", memories);

        return memories || "No relevant memory found.";
    },
};

module.exports = { retrieveMemoryTool };
