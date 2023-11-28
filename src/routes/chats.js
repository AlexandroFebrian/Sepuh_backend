const express = require("express");
const router = express.Router();

const {
    createChat,
    sendMessage
} = require("../controllers/chatsController.js");
const { AuthMiddleware } = require("../middlewares/AuthMiddleware");

router.use(AuthMiddleware);
router.post("/", createChat);
router.post("/message", sendMessage);

module.exports = router;