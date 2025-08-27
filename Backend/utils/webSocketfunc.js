function safeSend(ws, payload) {
  try {
    if (ws && ws.readyState === 1) { // 1 = OPEN
      
      ws.send(JSON.stringify(payload));
    } else {
      console.warn("⚠️ Tried to send on a closed or undefined WebSocket:", payload);
    }
  } catch (err) {
    console.error("❌ Error during ws.send:", err.message);
  }
}
module.exports= {safeSend}