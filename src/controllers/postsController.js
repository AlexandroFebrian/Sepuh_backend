const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require("../config/env.config");
const nodemailer = require('nodemailer');

const Post = require("../models/Post");

const fetchFreelancerPosts = async (req, res) => {
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
                $match: {
                    "user.role": "Freelancer",
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
                    comments: 1,
                    user_id: 1,
                    status: 1,
                    user: {
                        _id: 1,
                        name: 1,
                        email: 1,
                        role: 1,
                        balance: 1,
                        rating: 1,
                        account_number: 1,
                        employees: 1,
                        history: 1,
                        list: 1,
                        status: 1
                    }
                }
            }
        ]);
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const fetchCompanyPosts = async (req, res) => {
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
                $match: {
                    "user.role": "Company",
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
                    comments: 1,
                    user_id: 1,
                    status: 1,
                    user: {
                        _id: 1,
                        name: 1,
                        email: 1,
                        role: 1,
                        balance: 1,
                        rating: 1,
                        account_number: 1,
                        employees: 1,
                        history: 1,
                        list: 1,
                        status: 1
                    }
                }
            }
        ]);
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const addPost = async (req, res) => {
    try {
        const { title, duration, description, hashtag, min_price, max_price, image } = req.body;
        if (!title || !duration || !min_price || !max_price) {
            return res.status(400).json({
                message: `Input must not be empty!`
            });
        }
        const post = await Post.create({
            title: title,
            duration: duration,
            description: description, 
            image: image ? image : [],
            hashtag: hashtag,
            min_price: min_price,
            max_price: max_price,
            avg_rating: 0,
            visitor: 0,
            comments: [],
            user_id: req.user._id,
            status: 1
        });
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    fetchFreelancerPosts,
    fetchCompanyPosts,
    addPost
}