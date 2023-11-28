const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const env = require("../config/env.config");

const usersRouter = require('./users');
const postsRouter = require('./posts');
const chatsRouter = require('./chats');

router.use("/public", express.static('./public'));
router.use("/users", usersRouter);
router.use("/posts", postsRouter);
router.use("/chats", chatsRouter);

router.get("/category", (req, res) => {
    const { categories } = require("../database/categories.json");
    return res.status(200).json(categories);
});

router.post("/cekToken", (req, res) => {
    const { token } = req.body;
  
    try {
        const decoded = jwt.verify(token, env("SECRET_KEY"));
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