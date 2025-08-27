const http = require('http')
const app = require("./app");
const { initWSServer } = require('./webServer');
const port = process.env.PORT || 5000




const server = http.createServer(app)
initWSServer(server);




server.listen(port, () => {


    console.log(`server is listening on ${port}`)
})