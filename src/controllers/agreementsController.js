const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const env = require("../config/env.config");

const Agreement = require("../models/Agreement");

const makeAgreement = async (req, res) => {
    const { user_id, post_id } = req.body;

    if (!user_id || !post_id) {
        return res.status(400).json({
            message: "Missing required fields!"
        });
    }

    if (!mongoose.isValidObjectId(user_id) || !mongoose.isValidObjectId(post_id)) {
        return res.status(400).json({
            message: "Invalid ObjectId!"
        });
    }

    const role = req.user.role.substring(0, 1);

    await Agreement.create({
        start_date: new Date(),
        end_date: null,
        deal_price: 0,
        file: [],
        freelancer: new ObjectId(role == "F" ? req.user._id : user_id),
        company: new ObjectId(role == "C" ? req.user._id : user_id),
        post: new ObjectId(post_id),
        status: 0
    });

    return res.status(201).json({
        message: "Success created agreement!"
    });
}

module.exports = {
    makeAgreement
}