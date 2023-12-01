const express = require("express");
const router = express.Router();

const {
    fetchFreelancerPosts,
    fetchCompanyPosts,
    addPost,
    getUserPosts,
    getUserPostsByEmail,
    getPostsById
} = require("../controllers/postsController");
const { AuthMiddleware } = require("../middlewares/AuthMiddleware");
const MulterUpload = require("../validations/Multer");

router.get("/freelancer", fetchFreelancerPosts);
router.get("/company", fetchCompanyPosts);
router.get("/details/:post_id", getPostsById);
router.get("/:email", getUserPostsByEmail);
router.use(AuthMiddleware);
router.get("/", getUserPosts);
router.post("/add", MulterUpload.array('image[]'), addPost);

module.exports = router;