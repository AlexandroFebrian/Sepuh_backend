const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const env = require("../config/env.config");

const Post = require("../models/Post");

const fetchPosts = async (role, res, email, id) => {
    try {
        const posts = await Post.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "posted_by"
                }
            },
            {
                $unwind: {
                    path: "$comments",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "comments.user_id",
                    foreignField: "_id",
                    as: "comments.comment_by"
                }
            },
            {
                $group: {
                    _id: "$_id",
                    title: { $first: "$title" },
                    duration: { $first: "$duration" },
                    duration_type: { $first: "$duration_type" },
                    description: { $first: "$description" },
                    image: { $first: "$image" },
                    hashtag: { $first: "$hashtag" },
                    min_price: { $first: "$min_price" },
                    max_price: { $first: "$max_price" },
                    avg_rating: { $first: "$avg_rating" },
                    visitor: { $first: "$visitor" },
                    comments: { $push: "$comments" },
                    posted_by: { $first: "$posted_by" },
                    status: { $first: "$status" },
                    posted_at: { $first: "$create_at" }
                }
            },
            {
                $match: {
                    _id: id ? id : { $exists: true },
                    "posted_by.role": role ? role : /^/,
                    "posted_by.email": email ? email : /^/,
                    "posted_by.status": 1,
                    status: 1
                }
            },
            {
                $addFields: {
                    posted_by: {
                        $arrayElemAt: ["$posted_by", 0]
                    }
                }
            },
            {
                $project: {
                    comments: {
                        comment_by: {
                            _id: 0,
                            password: 0
                        }
                    },
                    posted_by: {
                        _id: 0,
                        password: 0
                    },
                }
            }
          ]);

        if (posts.length > 0) {
            for (let i = 0; i < posts.length; i++) {
                const post = posts[i];
                const arrImage = [];
                for (let j = 0; j < post.image.length; j++) {
                    const img = post.image[j];
                    arrImage.push(env("HOST") + "/api/public/" + img);
                }
                posts[i].image = arrImage;

                for (let j = 0; j < post.comments.length; j++) {
                    const comment_by = post.comments[j].comment_by[0];

                    if (comment_by) {
                        posts[i].comments[j].comment_by[0].profile_picture = env("HOST") + "/api/public/" + comment_by.profile_picture;
                        posts[i].comments[j].comment_by = posts[i].comments[j].comment_by[0];
                    } else {
                        posts[i].comments = [];
                    }
                }

                posts[i].posted_by.profile_picture = env("HOST") + "/api/public/" + posts[i].posted_by.profile_picture;
            }
        }

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const fetchFreelancerPosts = async (req, res) => {
    fetchPosts("Freelancer", res);
}

const fetchCompanyPosts = async (req, res) => {
    fetchPosts("Company", res);
}

const addPost = async (req, res) => {
    try {
        const { title, duration, duration_type, description, hashtag, min_price, max_price, image } = req.body;
        if (!title || !min_price || !max_price) {
            return res.status(400).json({
                message: `Input must not be empty!`
            });
        }
        console.log(image)
        await Post.create({
            title: title,
            duration: duration ? duration : 0,
            duration_type: duration_type ? duration_type : "",
            description: description ? description : "",
            image: image ? image : [],
            hashtag: Array.isArray(hashtag) ? hashtag : hashtag ? [hashtag] : [],
            min_price: min_price,
            max_price: max_price,
            avg_rating: 0,
            visitor: 0,
            comments: [],
            user_id: req.user._id,
            status: 1
        });

        res.status(201).json({
            message: `Post successfully created!`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getUserPosts = async (req, res) => {
    fetchPosts(req.user.role, res, req.user.email);
}

const getUserPostsByEmail = async (req, res) => {
    fetchPosts(null, res, req.params.email);
}

const getPostsById = async (req, res) => {
    const object_id = req.params.post_id;
    if (!mongoose.Types.ObjectId.isValid(object_id)) {
        return res.status(400).json({ error: 'Invalid ObjectID' });
    }
    fetchPosts(null, res, null, new ObjectId(object_id));
}

module.exports = {
    fetchFreelancerPosts,
    fetchCompanyPosts,
    addPost,
    getUserPosts,
    getUserPostsByEmail,
    getPostsById
}