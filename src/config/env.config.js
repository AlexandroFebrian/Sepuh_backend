require("dotenv/config");

const dictionary = {
    HOST: process.env.HOST,
    DB_STRING: process.env.DB_STRING
};

module.exports = function env(key) {
    return dictionary[key];
}