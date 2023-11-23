const express = require("express");
const router = express.Router();

const {
    fetchFreelancerPosts,
    fetchCompanyPosts,
    addPost
} = require("../controllers/postsController");
const { AuthMiddleware } = require("../middlewares/AuthMiddleware");
const MulterUpload = require("../validations/Multer");

router.get("/freelancer", fetchFreelancerPosts);
router.get("/company", fetchCompanyPosts);
router.use(AuthMiddleware);
router.post("/add", MulterUpload.array('image'), addPost);

module.exports = router;