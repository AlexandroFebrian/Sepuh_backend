const express = require("express");
const router = express.Router();

const {
    createChat,
    sendMessage,
    getAllChat,
    getChatWith
} = require("../controllers/chatsController.js");
const { AuthMiddleware } = require("../middlewares/AuthMiddleware");

router.use(AuthMiddleware);
router.post("/", createChat); // Kirim notif ke orang yang mau di message
router.post("/message", sendMessage);
router.get("/", getAllChat);
router.get("/:user_id", getChatWith);

module.exports = router;