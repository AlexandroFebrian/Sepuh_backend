const jwt = require("jsonwebtoken");
const env = require("../config/env.config");

const User = require("../models/User");

async function AuthMiddleware (req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decodedToken = jwt.verify(token, env("SECRET_KEY"));
        const email = decodedToken.email;
        
        const user = await User.findOne({ email: email });
        
        if (user) {
            req.user = user;
            next();
        } else {
            return res.status(404).json({ message: "Username Not Found" });
        }
    } catch (err) {
        return res.status(401).json({ message: "Invalid Token" });
    }
};

module.exports = {
    AuthMiddleware
};