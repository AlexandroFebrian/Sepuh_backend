require("dotenv/config");

const dictionary = {
    HOST: process.env.HOST,
    DB_STRING: process.env.DB_STRING,
    EMAIL_ADDRESS: process.env.EMAIL_ADDRESS,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    SECRET_KEY: process.env.SECRET_KEY,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    SERVER_KEY: process.env.SERVER_KEY,
    CLIENT_KEY: process.env.CLIENT_KEY,
    FRONTEND_HOST: process.env.FRONTEND_HOST,
    PORT: process.env.PORT
};

module.exports = function env(key) {
    return dictionary[key];
}