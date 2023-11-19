const mongoose = require('mongoose');
const env = require("../config/env.config");
let connection = null;

async function connect(){
    try {
        connection = await mongoose.connect(env('DB_STRING'))
        console.log("Connection successful!");
    } catch (error) {
        console.error("Connection failed\n", error);
    }
}

function getConn(){
    return connection;
}

module.exports = { connect, getConn }