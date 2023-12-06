const express = require("express");
const router = express.Router();

const {
    makeAgreement,
    setDealPrice,
    acceptAgreement,
    setEndDate,
    addFile,
    fetchAgreements,
    getAgreement,
    createPayment,
    midtransResponse,
    doneProject,
    rejectProject
} = require("../controllers/agreementsController");
const { AuthMiddleware } = require("../middlewares/AuthMiddleware");
const MulterUpload = require("../validations/Multer");
const { AdminMiddleware } = require("../middlewares/AdminMiddleware");

router.post("/dSfbZJgaMxGbGYFsRYDq", midtransResponse);

router.use(AuthMiddleware);
router.post("/", makeAgreement);
router.put("/price", setDealPrice);
router.put("/accept", acceptAgreement);
router.put("/date", setEndDate);
router.post("/file", MulterUpload.single("file"), addFile);
router.get("/", fetchAgreements);
router.get("/:id", getAgreement);
router.post("/payment", createPayment);
router.put("/status/done", doneProject);
router.put("/status/reject", rejectProject);

module.exports = router;