const express = require("express");
const router = express.Router();

const {
    makeAgreement,
    setDealPrice,
    setEndDate,
    changeStatus,
    addFile,
    fetchAgreements,
    getAgreement
} = require("../controllers/agreementsController");
const { AuthMiddleware } = require("../middlewares/AuthMiddleware");
const MulterUpload = require("../validations/Multer");
const { AdminMiddleware } = require("../middlewares/AdminMiddleware");

router.use(AuthMiddleware);
router.post("/", makeAgreement);
router.put("/price", setDealPrice);
router.put("/date", setEndDate);
router.put("/status", changeStatus);
router.post("/file", MulterUpload.single("file"), addFile);
router.get("/", fetchAgreements);
router.get("/:id", getAgreement);

module.exports = router;