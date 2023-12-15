const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const env = require("../config/env.config");

const Post = require("../models/Post");
const Agreement = require('../models/Agreement');
const User = require('../models/User');

const fetchPosts = async (role, res, email, id, admin) => {
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
                    status: admin ? { $in: [-1, 1] } : 1
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
                $sort: {
                    posted_at: -1
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
        
        const post = await Post.create({
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
            message: `Post successfully created!`,
            post_id: post._id
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
    const { post_id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(post_id)) {
        return res.status(400).json({ error: 'Invalid ObjectID' });
    }
    fetchPosts(null, res, null, new ObjectId(post_id));
}

const addView = async (req, res) => {
    const { post_id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(post_id)) {
        return res.status(400).json({ error: 'Invalid ObjectID' });
    }
    
    await Post.updateOne({
        _id: new ObjectId(post_id)
    }, {
        $inc: {
            visitor: 1
        }
    });

    return res.status(200).json({
        message: "Success add view!"
    });
}

const addReview = async (req, res) => {
    const { comment, rating, agreement_id } = req.body;
    
    if (!comment || !rating || rating < 1 || !agreement_id) {
        return res.status(400).json({
            message: `Input must not be empty!`
        });
    }

    if (!mongoose.Types.ObjectId.isValid(agreement_id)) {
        return res.status(400).json({ error: 'Invalid ObjectID' });
    }

    const agreement = await Agreement.findById(agreement_id);
    const post = await Post.findById(agreement.post);

    let avg_rating = 0;
    for (let i = 0; i < post.comments.length; i++) {
        const ra = post.comments[i].rating;
        avg_rating += parseInt(ra);
    }
    avg_rating = Math.round(((parseInt(avg_rating) + parseInt(rating)) / (post.comments.length + 1)) * 100) / 100;

    await Post.updateOne({
        _id: agreement.post
    }, {
        $set: {
            avg_rating: avg_rating
        },
        $addToSet: {
            comments: {
                user_id: req.user._id,
                rating: rating,
                comment: comment
            }
        }
    });
    agreement.status = 3;
    await agreement.save();

    const all_post = await Post.find({
        user_id: post.user_id,
        status: 1
    });

    let user_rating = 0;
    let count = 0;
    for (let i = 0; i < all_post.length; i++) {
        const ra = all_post[i].avg_rating;
        if (ra != 0){
            user_rating += ra;
            count++;
        }
    }

    user_rating = Math.round((parseInt(user_rating) / parseInt(count)) * 100) / 100;

    await User.updateOne({
        _id: post.user_id
    }, {
        $set: {
            rating: user_rating
        }
    });

    return res.status(200).json({
        message: "Success add review!"
    });
}

const suspendPost = async (req, res) => {
    const { post_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(post_id)) {
        return res.status(400).json({ error: 'Invalid ObjectID' });
    }

    await Post.updateOne({
        _id: post_id
    }, {
        $set: {
            status: -1
        }
    });

    return res.status(200).json({
        message: "Success suspend post!"
    });
}

const unsuspendPost = async (req, res) => {
    const { post_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(post_id)) {
        return res.status(400).json({ error: 'Invalid ObjectID' });
    }

    await Post.updateOne({
        _id: post_id
    }, {
        $set: {
            status: 1
        }
    });

    return res.status(200).json({
        message: "Success unsuspend post!"
    });
}

const getUserPostsByEmailAdmin = async (req, res) => {
    const admin = req.admin;
    fetchPosts(null, res, req.params.email, null, admin);
}

module.exports = {
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
}