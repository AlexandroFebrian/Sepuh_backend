const express = require("express");
const router = express.Router();

const {
    registerUser,
    verifyUser,
    loginUser,
    fetchUser,
    getUserProfile,
    updateUserProfile,
    deleteUser,
} = require("../controllers/usersController");
const { AuthMiddleware } = require("../middlewares/AuthMiddleware");
const MulterUpload = require("../validations/Multer");

router.post("/register", registerUser);
router.get("/verify/:token", verifyUser);
router.post("/login", loginUser);

router.use(AuthMiddleware);
router.get("/", fetchUser);
router.get("/profile", getUserProfile);

router.put("/profile", MulterUpload.any(), updateUserProfile);

router.delete("/delete/:email", deleteUser);

module.exports = router;