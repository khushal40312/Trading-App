const mongoose = require("mongoose");
console.log(process.env.DB_CONNECT)
function connectToDb() {
    mongoose.connect(process.env.DB_CONNECT, {

    }).then(() =>
        console.log('connect to DB')
    ).catch(err => console.log(err));
}
module.exports = connectToDb;