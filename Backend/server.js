const http = require('http')
const app = require("./app")
const port = process.env.PORT || 5000
const socketService = require('./services/socket.service.js');



const server = http.createServer(app)

socketService.initialize(server);
// Graceful shutdown
process.on('SIGTERM', () => {
    socketService.destroy();
    server.close();
  });

server.listen(port, () => {


    console.log(`server is listening on ${port}`)
})