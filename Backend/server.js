const http = require("http");
const app = require("./app");
const { initWSServer } = require("./webServer");
const { initWSServerForNotification } = require("./notificationWebSocket");
const port = process.env.PORT || 5000;
const WebSocket = require("ws");
const { initializeMonitoring } = require("./services/ai.service");
const getStockQuote = require("./getStockQuote");

const server = http.createServer(app);

// Create WS servers with noServer
const aiWSS = new WebSocket.Server({ noServer: true });
const notificationWSS = new WebSocket.Server({ noServer: true });

// Initialize handlers
initWSServer(aiWSS);
initWSServerForNotification(notificationWSS);
initializeMonitoring(getStockQuote, 10)

// Route upgrade requests manually
server.on("upgrade", (req, socket, head) => {
  const { url } = req;

  if (url.startsWith("/ai")) {
    aiWSS.handleUpgrade(req, socket, head, (ws) => {
        aiWSS.emit("connection", ws, req);
    });
  } else if (url.startsWith("/notification")) {
    notificationWSS.handleUpgrade(req, socket, head, (ws) => {
      notificationWSS.emit("connection", ws, req);
    });
  } else {
    socket.destroy(); // ❌ reject unknown paths
  }
});

// setInterval(() => {
//   notificationWSS?.sendNotification("6877798c2b58d63cc644b048", {
//     message: `Executed trade 3 PI  price 0.3  fees 0.1 `,
//     _id: "68a1fbd8fa71b365d7345906",
//   })
// }, 5000);

server.listen(port, () => {
  console.log(`🚀 Server is listening on ${port}`);
});
module.exports = { notificationWSS };