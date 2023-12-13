const express = require("express");
const router = express.Router();

const {
    fetchFreelancerPosts,
    fetchCompanyPosts,
    addPost,
    getUserPosts,
    getUserPostsByEmail,
    getPostsById,
    addView,
    addReview,
    suspendPost,
    unsuspendPost,
    getUserPostsByEmailAdmin
} = require("../controllers/postsController");
const { AuthMiddleware } = require("../middlewares/AuthMiddleware");
const MulterUpload = require("../validations/Multer");
const { AdminMiddleware } = require("../middlewares/AdminMiddleware");

router.put("/suspend/:post_id", AdminMiddleware, suspendPost);
router.put("/unsuspend/:post_id", AdminMiddleware, unsuspendPost);
router.get("/admin/:email", AdminMiddleware, getUserPostsByEmailAdmin);

router.get("/freelancer", fetchFreelancerPosts);
router.get("/company", fetchCompanyPosts);
router.get("/details/:post_id", getPostsById);
router.get("/:email", getUserPostsByEmail);
router.use(AuthMiddleware);
router.get("/", getUserPosts);
router.post("/add", MulterUpload.array('image[]'), addPost);
router.put("/:post_id", addView);
router.post("/review", addReview);

module.exports = router;