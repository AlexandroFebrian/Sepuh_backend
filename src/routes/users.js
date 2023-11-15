const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    fetchUser,
    getUser,
    updateUser,
    deleteUser,
} = require("../controllers/usersController");

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/", fetchUser);
router.get("/:email", getUser);
router.put("/update/:email", updateUser);
router.delete("/delete/:email", deleteUser);

module.exports = router;