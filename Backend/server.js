const http = require('http')
const app = require("./app");
const { initWSServer } = require('./webServer');
const { initializeMonitoring } = require('./services/ai.service');
const getStockQuote = require('./getStockQuote');
const { initWSServerForNotification } = require('./notificationWebSocket');
const port = process.env.PORT || 5000




const server = http.createServer(app)
initWSServer(server);
initWSServerForNotification(server)
// initializeMonitoring(getStockQuote, 10)




server.listen(port, () => {


    console.log(`server is listening on ${port}`)
})