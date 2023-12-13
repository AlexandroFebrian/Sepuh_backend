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
    getUserProfileByEmail,
    updateUserProfile,
    addToList,
    fetchList,
    removeFromList,
    getUserNotifications,
    getUserDocument,
    updateDocument,
    hireUser,
    acceptUser,
    rejectUser,
    changePassword,
    getEmployees
} = require("../controllers/usersController");
const { AuthMiddleware } = require("../middlewares/AuthMiddleware");
const MulterUpload = require("../validations/Multer");
const { AdminMiddleware } = require("../middlewares/AdminMiddleware");

router.post("/register", registerUser);
router.get("/verify/:token", verifyUser);
router.post("/login", loginUser);
router.post("/admin/login", loginAdmin);
router.get("/profile/:email", getUserProfileByEmail);

router.get("/", AdminMiddleware, fetchUser);
router.put("/ban/:email", AdminMiddleware, banUser);
router.put("/unban/:email", AdminMiddleware, unbanUser);

router.use(AuthMiddleware);
router.get("/profile", getUserProfile);
router.put("/profile", MulterUpload.any(), updateUserProfile);
router.post("/list", addToList);
router.get("/list", fetchList);
router.put("/list", removeFromList);
router.get("/notifications", getUserNotifications);
router.get("/documents", getUserDocument);
router.put("/documents", MulterUpload.any(), updateDocument);
router.post("/hire", hireUser);
router.put("/hire/accept", acceptUser);
router.put("/hire/reject", rejectUser);

router.put("/password", changePassword);
router.get("/employees", getEmployees);

module.exports = router;