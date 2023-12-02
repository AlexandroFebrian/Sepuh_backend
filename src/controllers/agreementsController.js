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

const setDealPrice = async (req, res) => {
    const { agreement_id, deal_price } = req.body;

    if (!agreement_id || !deal_price) {
        return res.status(400).json({
            message: "Missing required fields!"
        });
    }

    if (!mongoose.isValidObjectId(agreement_id)) {
        return res.status(400).json({
            message: "Invalid ObjectId!"
        });
    }

    const agreement = await Agreement.findById(agreement_id);

    if (!agreement) {
        return res.status(404).json({
            message: "Agreement not found!"
        });
    }

    agreement.deal_price = deal_price;
    await agreement.save();

    return res.status(200).json({
        message: "Success set new deal price!"
    });
}

const setEndDate = async (req, res) => {
    const { agreement_id, end_date } = req.body;

    if (!agreement_id || !end_date) {
        return res.status(400).json({
            message: "Missing required fields!"
        });
    }

    if (!mongoose.isValidObjectId(agreement_id)) {
        return res.status(400).json({
            message: "Invalid ObjectId!"
        });
    }

    const agreement = await Agreement.findById(agreement_id);

    if (!agreement) {
        return res.status(404).json({
            message: "Agreement not found!"
        });
    }

    agreement.end_date = end_date;
    await agreement.save();

    return res.status(200).json({
        message: "Success set end_date!"
    });
}

const changeStatus = async (req, res) => {
    // Nunggu kepastian status ngubahnya gimana

    return res.status(200).json({
        message: "Success change status!"
    });
}

const addFile = async (req, res) => {
    const { agreement_id } = req.body;

    if (!agreement_id) {
        return res.status(400).json({
            message: "Missing required fields!"
        });
    }

    if (!mongoose.isValidObjectId(agreement_id)) {
        return res.status(400).json({
            message: "Invalid ObjectId!"
        });
    }

    const agreement = await Agreement.findById(agreement_id);

    if (!agreement) {
        return res.status(404).json({
            message: "Agreement not found!"
        });
    }

    agreement.file.push({
        name: req.body.file,
        time: new Date(),
        status: 0
    });
    agreement.save();

    res.status(200).json({
        message: `File successfully added!`
    });
}

module.exports = {
    makeAgreement,
    setDealPrice,
    setEndDate,
    changeStatus,
    addFile
}