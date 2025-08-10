// tools/memoryTool.js
const { getVectorStore } = require("../vector/vectorStore");

const memoryTool = {
    name: "storeInMemory",
    description: "Stores user messages and context into vector DB (Pinecone)",
    func: async ({ Conversations, userId }) => {

        const vectorStore = await getVectorStore();
        try {
            const document = {
                pageContent: `${JSON.stringify(Conversations)}`, // The message to store
                metadata: { userId }
            };

            await vectorStore.addDocuments([document]);
            return `Stored memory for user ${userId}`;
        } catch (error) {
            console.log("error during adding data", error)
        }

    }
};

module.exports = { memoryTool };
