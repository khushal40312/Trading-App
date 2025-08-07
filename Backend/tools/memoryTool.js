// tools/memoryTool.js
const { getVectorStore } = require("../vector/vectorStore");

const memoryTool = {
    name: "storeInMemory",
    description: "Stores user messages and context into vector DB (Pinecone)",
    func: async ({ userInput, aiResponse, userId }) => {
       // const response = await memoryTool.func({
    //   userInput:input,
    // aiResponse: result.content.trim(),
    //   userId
    // });
        const vectorStore = await getVectorStore();
        try {
            const document = {
                pageContent: `User: ${userInput}\nModel: ${aiResponse}`, // The message to store
                metadata: { userId }
            };

            await vectorStore.addDocuments([document]);
            return `Stored memory for user ${userId}`;
        } catch (error) {
console.log("error during adding data",error)
        }

    }
};

module.exports = { memoryTool };
