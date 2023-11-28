const express = require("express");
const router = express.Router();

const {
    registerUser,
    verifyUser,
    loginUser,
    fetchUser,
    banUser,
    unbanUser,
    getUserProfile,
    updateUserProfile,
} = require("../controllers/usersController");
const { AuthMiddleware } = require("../middlewares/AuthMiddleware");
const MulterUpload = require("../validations/Multer");

router.post("/register", registerUser);
router.get("/verify/:token", verifyUser);
router.post("/login", loginUser);

router.get("/", fetchUser); // kurang admin middleware
router.put("/ban/:email", banUser); // kurang admin middleware
router.put("/unban/:email", unbanUser); // kurang admin middleware

router.use(AuthMiddleware);
router.get("/profile", getUserProfile);
router.put("/profile", MulterUpload.any(), updateUserProfile);

module.exports = router;