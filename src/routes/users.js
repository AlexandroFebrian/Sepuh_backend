const express = require("express");
const router = express.Router();

const {
    registerUser,
    verifyUser,
    loginUser,
    fetchUser,
    getUserProfile,
    updateUser,
    deleteUser,
} = require("../controllers/usersController");
const { AuthMiddleware } = require("../middlewares/AuthMiddleware");

router.post("/register", registerUser);
router.get("/verify/:token", verifyUser);
router.post("/login", loginUser);

router.use(AuthMiddleware);
router.get("/", fetchUser);
router.get("/profile", getUserProfile);
router.put("/update/:email", updateUser);
router.delete("/delete/:email", deleteUser);

module.exports = router;