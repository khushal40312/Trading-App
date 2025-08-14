// tools/memoryTool.js
const { getVectorStore } = require("../vector/vectorStore");

const memoryTool = {
    name: "storeInMemory",
    description: "Stores user messages and context into vector DB (Pinecone)",
    func: async ({ Conversations, userId, dataType }) => {
        const vectorStore = await getVectorStore();

        try {
            const document = {
                pageContent: JSON.stringify(Conversations), // The message/context to store
                metadata: { 
                    userId,
                    type: dataType || "general" // defaults to "general" if not provided
                }
            };

            await vectorStore.addDocuments([document]);
            return `Stored memory for user ${userId} with type "${document.metadata.type}"`;
        } catch (error) {
            console.log("Error during adding data", error);
            throw error;
        }
    }
};

module.exports = { memoryTool };
