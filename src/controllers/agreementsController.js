const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const env = require("../config/env.config");

const Agreement = require("../models/Agreement");
const User = require("../models/User");

const makeAgreement = async (req, res) => {
    const { email, post_id } = req.body;

    if (!email || !post_id) {
        return res.status(400).json({
            message: "Missing required fields!"
        });
    }

    const user = await User.findOne({ email: email });
    if (!user || user.status == -1) {
        return res.status(400).json({
            message: `This account is not found or has been suspended!`
        });
    }
    const user_id = user._id;

    if (!mongoose.isValidObjectId(post_id)) {
        return res.status(400).json({
            message: "Invalid ObjectId!"
        });
    }

    const role = req.user.role.substring(0, 1);

    const date = new Date();
    const invoice_template = "INV" + date.getFullYear() + (date.getMonth() + 1).toString().padStart(2, "0") + date.getDate().toString().padStart(2, "0");

    const invoice_number = await Agreement.findOne({
        invoice: new RegExp(invoice_template)
    }, {
        _id: 0,
        invoice: 1
    }, {
        sort: { invoice: -1 }
    });
    const invoice = invoice_template + (invoice_number ? (parseInt(invoice_number.invoice.substring(11, 15)) + 1).toString().padStart(4, "0") : "0001");

    const agreement = await Agreement.create({
        start_date: new Date(),
        end_date: null,
        deal_price: 0,
        invoice: invoice,
        file: [],
        freelancer: new ObjectId(role == "F" ? req.user._id : user_id),
        company: new ObjectId(role == "C" ? req.user._id : user_id),
        post: new ObjectId(post_id),
        status: 0
    });

    console.log(agreement)

    return res.status(201).json({
        message: "Success created agreement!",
        id: agreement._id
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
    await agreement.save();

    res.status(200).json({
        message: `File successfully added!`
    });
}

const fetchAgreements = async (req, res) => {
    const role = req.user.role;

    if (role == "Freelancer") {
        const agreements = await Agreement.find({
            freelancer: req.user._id
        });
    
        return res.status(200).json(agreements);
    }

    const agreements = await Agreement.find({
        company: req.user._id
    });

    return res.status(200).json(agreements);
}

module.exports = {
    makeAgreement,
    setDealPrice,
    setEndDate,
    changeStatus,
    addFile,
    fetchAgreements
}