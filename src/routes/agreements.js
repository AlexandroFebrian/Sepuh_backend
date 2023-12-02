const express = require("express");
const router = express.Router();

const {
    makeAgreement
} = require("../controllers/agreementsController");
const { AuthMiddleware } = require("../middlewares/AuthMiddleware");
const MulterUpload = require("../validations/Multer");
const { AdminMiddleware } = require("../middlewares/AdminMiddleware");

router.use(AuthMiddleware);
router.post("/", makeAgreement);

module.exports = router;