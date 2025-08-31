

const redisClient = require('../config/redisClient.js');
const { v4: uuidv4 } = require('uuid');
const { tradingAgent } = require("../agents/tradingAgent");
//This API section is only for testing the ai flow 
module.exports.aiChat = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const user = req.user;

    if (sessionId) {
      const exists = await redisClient.get(`session:${user.id}:${sessionId}`);
      
      if (exists) {
        // Refresh TTL
        await redisClient.expire(`session:${user.id}:${sessionId}`, 900);

        const result = await tradingAgent.invoke({ input: message, user, sessionId });

        return res.json({ reply: result.reply || "No response generated." });

      } else {
        // Session expired — issue new one
        const newSessionId = uuidv4();
        await redisClient.setEx(`session:${user.id}:${newSessionId}`, 900, "active");

        const result = await tradingAgent.invoke({ input: message, user, sessionId: newSessionId });
        return res.json({
          notification: "Your previous session expired. Starting a new one.",
          sessionId: newSessionId,
          reply: result.reply
        });
      }

    } else {
      // No session provided — issue new one
      const newSessionId = uuidv4();
      await redisClient.setEx(`session:${user.id}:${newSessionId}`, 900, 'active');

      const result = await tradingAgent.invoke({ input: message, user, sessionId: newSessionId });
      return res.json({
        notification: "New session started.",
        sessionId: newSessionId,
        reply: result.reply
      });
    }

  } catch (err) {
    console.error("AI Chat error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
};




