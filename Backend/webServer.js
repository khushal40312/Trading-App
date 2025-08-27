const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const userModel = require("./models/user.model");
const blacklistTokenModel = require("./models/blacklistToken.model");
const redisClient = require("./config/redisClient");


function initWSServer(server) {
  const wss = new WebSocket.Server({ server, path: "/ai" }); // websocket path

  wss.on("connection", (ws) => {
    

    ws.on("message", async (raw) => {
      try {
        const { message, sessionId, token } = JSON.parse(raw);


        // --- 🔑 JWT AUTH ---
        if (!token) {
          ws.send(JSON.stringify({ event: "error", message: "Unauthorized: Token not provided" }));
          return ws.close();
        }

        // Remove "Bearer "
        const pureToken = token?.split(' ')[1].trim();

        // Check blacklist
        const isBlacklisted = await blacklistTokenModel.findOne({ token: pureToken });
        if (isBlacklisted) {
          ws.send(JSON.stringify({ event: "error", message: "Session expired, login again." }));
          return ws.close();
        }

        // Verify + decode
        let decoded;
        try {
          decoded = jwt.verify(pureToken, process.env.JWT_SECRET);
        } catch (err) {
          ws.send(JSON.stringify({ event: "error", message: "Invalid or expired token." }));
          return ws.close();
        }

        // Get user
        const user = await userModel.findById(decoded._id).populate("trades");
        if (!user) {
          ws.send(JSON.stringify({ event: "error", message: "User not found." }));
          return ws.close();
        }

        // ✅ Attach user to ws
        ws.user = user;

        // --- SESSION MANAGEMENT ---
        let activeSessionId = sessionId;
        if (sessionId) {
          const exists = await redisClient.get(`session:${user.id}:${sessionId}`);
          if (exists) {
            await redisClient.expire(`session:${user.id}:${sessionId}`, 900);
          } else {
            activeSessionId = uuidv4();
            await redisClient.setEx(`session:${user.id}:${activeSessionId}`, 900, "active");
            ws.send(JSON.stringify({
              event: "session:new",
              sessionId: activeSessionId,
              notification: "Previous session expired, started new one."
            }));
          }
        } else {
          activeSessionId = uuidv4();
          await redisClient.setEx(`session:${user.id}:${activeSessionId}`, 900, "active");
          ws.send(JSON.stringify({
            event: "session:new",
            sessionId: activeSessionId,
            notification: "New session started."
          }));
        }
        const { tradingAgent } = require("./agents/tradingAgent");
       
        const result = await tradingAgent.invoke({
          input: message,
          user,
          sessionId: activeSessionId,
          ws: ws
        });

        ws.send(JSON.stringify({
          event: "reply",
          reply: result.reply || "No response generated."
        }));

        ws.send(JSON.stringify({ event: "typing", status: false }));

      } catch (err) {
        console.error("WS Error:", err);
        ws.send(JSON.stringify({ event: "error", message: "Something went wrong." }));
      }
    });

    ws.on("close", () => {
      // console.log("❌ WebSocket disconnected");
    });
  });

  return wss;
}

module.exports = { initWSServer };

