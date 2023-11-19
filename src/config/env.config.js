require("dotenv/config");

const dictionary = {
    HOST: process.env.HOST,
    DB_STRING: process.env.DB_STRING,
    EMAIL_ADDRESS: process.env.EMAIL_ADDRESS,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    SECRET_KEY: process.env.SECRET_KEY
};

module.exports = function env(key) {
    return dictionary[key];
}