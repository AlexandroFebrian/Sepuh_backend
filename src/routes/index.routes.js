const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const env = require("../config/env.config");

const User = require("../models/User");

const usersRouter = require('./users');
const postsRouter = require('./posts');
const chatsRouter = require('./chats');
const agreementsRouter = require('./agreements');

router.use("/public", express.static('./public'));
router.use("/users", usersRouter);
router.use("/posts", postsRouter);
router.use("/chats", chatsRouter);
router.use("/agreements", agreementsRouter);

router.get("/category", (req, res) => {
    const { categories } = require("../database/categories.json");
    return res.status(200).json(categories);
});

router.post("/cekToken", async (req, res) => {
    const { token } = req.body;
  
    try {
        const decoded = jwt.verify(token, env("SECRET_KEY"));
        const user = await User.findOne({ email: decoded.email });
        if (user.status != 1) {
            return res.status(401).json({
                status: false,
                message: "Invalid token"
            })
        }

        return res.status(200).json({
            status: true,
            data: decoded
        })
    } catch (error) {
        return res.status(401).json({
            status: false,
            message: "Invalid token"
        })
    }
})
 
module.exports = router;