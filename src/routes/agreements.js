const express = require("express");
const router = express.Router();

const {
    makeAgreement,
    setDealPrice,
    setEndDate,
    addFile,
    fetchAgreements,
    getAgreement,
    createPayment,
    midtransResponse,
    acceptAgreement,
    doneProject,
    rejectProject,
    acceptFile,
    rejectFile,
    fetchAllAgreements
} = require("../controllers/agreementsController");
const { AuthMiddleware } = require("../middlewares/AuthMiddleware");
const MulterUpload = require("../validations/Multer");
const { AdminMiddleware } = require("../middlewares/AdminMiddleware");

router.post("/dSfbZJgaMxGbGYFsRYDq", midtransResponse);

router.get("/all", AdminMiddleware, fetchAllAgreements);

router.use(AuthMiddleware);
router.post("/", makeAgreement);
router.put("/price", setDealPrice);
router.put("/date", setEndDate);
router.post("/file", MulterUpload.single("file"), addFile);
router.get("/", fetchAgreements);
router.get("/:id", getAgreement);
router.post("/payment", createPayment);
router.put("/accept", acceptAgreement);
router.put("/status/done", doneProject);
router.put("/status/reject", rejectProject);
router.put("/file/accept", acceptFile);
router.put("/file/reject", rejectFile);

module.exports = router;