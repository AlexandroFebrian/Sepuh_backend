const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require("../config/env.config");
const nodemailer = require('nodemailer');

const Post = require("../models/Post");

const fetchPosts = async (role, res, email) => {
    try {
        const posts = await Post.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user"
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
                    description: { $first: "$description" },
                    image: { $first: "$image" },
                    hashtag: { $first: "$hashtag" },
                    min_price: { $first: "$min_price" },
                    max_price: { $first: "$max_price" },
                    avg_rating: { $first: "$avg_rating" },
                    visitor: { $first: "$visitor" },
                    comments: { $push: "$comments" },
                    post_by: { $first: "$user" },
                    status: { $first: "$status" },
                    posted_at: { $first: "$create_at" }
                }
            },
            {
                $match: {
                    "post_by.role": role,
                    "post_by.email": email,
                    status: 1
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    duration: 1,
                    description: 1,
                    image: 1,
                    hashtag: 1,
                    min_price: 1,
                    max_price: 1,
                    avg_rating: 1,
                    visitor: 1,
                    comments: {
                        _id: 1,
                        comment: 1,
                        rating: 1,
                        comment_by: {
                            _id: 1,
                            name: 1,
                            email: 1,
                            role: 1,
                            rating: 1,
                            status: 1
                        }
                    },
                    user_id: 1,
                    status: 1,
                    post_by: {
                        _id: 1,
                        name: 1,
                        email: 1,
                        role: 1,
                        rating: 1,
                        status: 1
                    },
                    posted_at: 1
                }
            }
          ]);

        if (posts.length > 0) {
            const arrImage = [];
            for (let i = 0; i < posts.length; i++) {
                const post = posts[i];
                for (let j = 0; j < post.image.length; j++) {
                    const img = post.image[j];
                    arrImage.push(env("HOST") + "/api/public/" + img);
                }
                posts[i].image = arrImage;
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
        const { title, duration, description, hashtag, min_price, max_price, image } = req.body;
        if (!title || !min_price || !max_price) {
            return res.status(400).json({
                message: `Input must not be empty!`
            });
        }
        console.log(image)
        await Post.create({
            title: title,
            duration: duration,
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
    fetchPosts(/^/, res, req.params.email);
}

module.exports = {
    fetchFreelancerPosts,
    fetchCompanyPosts,
    addPost,
    getUserPosts,
    getUserPostsByEmail
}