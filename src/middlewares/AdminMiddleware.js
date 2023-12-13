const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const env = require("../config/env.config");

async function AdminMiddleware (req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decodedToken = jwt.verify(token, env("SECRET_KEY"));
        const admin_password = decodedToken.admin_password;
        
        if (bcrypt.compareSync(env("ADMIN_PASSWORD"), admin_password)) {
            req.admin = true;
            next();
        } else {
            return res.status(401).json({ message: "Invalid Admin Password" });
        }
    } catch (err) {
        return res.status(401).json({ message: "Invalid Token" });
    }
};

module.exports = {
    AdminMiddleware
};