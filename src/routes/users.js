const express = require("express");
const router = express.Router();

const {
    registerUser,
    verifyUser,
    loginUser,
    loginAdmin,
    fetchUser,
    banUser,
    unbanUser,
    getUserProfile,
    updateUserProfile,
} = require("../controllers/usersController");
const { AuthMiddleware } = require("../middlewares/AuthMiddleware");
const MulterUpload = require("../validations/Multer");
const { AdminMiddleware } = require("../middlewares/AdminMiddleware");

router.post("/register", registerUser);
router.get("/verify/:token", verifyUser);
router.post("/login", loginUser);
router.post("/admin/login", loginAdmin);

router.get("/", AdminMiddleware, fetchUser);
router.put("/ban/:email", AdminMiddleware, banUser);
router.put("/unban/:email", AdminMiddleware, unbanUser);

router.use(AuthMiddleware);
router.get("/profile", getUserProfile);
router.put("/profile", MulterUpload.any(), updateUserProfile);

module.exports = router;