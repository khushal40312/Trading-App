const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const userModel = require("./models/user.model");
const blacklistTokenModel = require("./models/blacklistToken.model");

// 🔑 Store active connections mapped by userId
const clients = new Map();

function initWSServerForNotification(wss) {

  wss.on("connection", (ws, req) => {
    ws.connectedAt = Date.now();

    // 🔐 Authenticate immediately on connection
    const token = req.url.split("token=")[1]; // if token is passed as query param
    
    if (!token) {
      ws.send(JSON.stringify({ event: "error", message: "Unauthorized: Token missing" }));
      return ws.close();
    }

    const pureToken = token.startsWith("Bearer") ? token.split("Bearer%20")[1] : token;

    (async () => {
      try {
        // Check blacklist
        const isBlacklisted = await blacklistTokenModel.findOne({ token: pureToken });
        if (isBlacklisted) {
          ws.send(JSON.stringify({ event: "error", message: "Session expired, login again." }));
          return ws.close();
        }

        // Verify + decode
        const decoded = jwt.verify(pureToken, process.env.JWT_SECRET);

        // Get user
        const user = await userModel.findById(decoded._id).populate("trades");
        if (!user) {
          ws.send(JSON.stringify({ event: "error", message: "User not found." }));
          return ws.close();
        }

        // ✅ Store connection
        ws.user = user;
        clients.set(user._id.toString(), ws);

        ws.send(JSON.stringify({ event: "connected", message: "WebSocket connected successfully" }));
      } catch (err) {
        console.error("WS Auth Error:", err);
        ws.send(JSON.stringify({ event: "error", message: "Invalid or expired token." }));
        ws.close();
      }
    })();

    // Handle messages (optional, if you want client → server comms)
    ws.on("message", async (raw) => {
      try {
        const data = JSON.parse(raw);
        // Handle events from client here
      } catch (err) {
        console.error("WS Parse Error:", err);
      }
    });

    ws.on("close", () => {
      if (ws.user?._id) {
        clients.delete(ws.user._id.toString());
      }
    });
  });

  // 🔔 Function to send notification by userId
  wss.sendNotification = (userId, payload) => {
    const client = clients.get(userId.toString());
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ event: "notification", ...payload }));
    } else {
      console.log(`User ${userId} is not connected`);
    }
  };

  return wss;
}

module.exports = { initWSServerForNotification };
