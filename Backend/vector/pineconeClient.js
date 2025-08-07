const { Pinecone } = require("@pinecone-database/pinecone");
const dotenv = require('dotenv')
dotenv.config();

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
 
});

module.exports = { pinecone };