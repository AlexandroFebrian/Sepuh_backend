const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const env = require("../config/env.config");

const Chat = require("../models/Chat");
const User = require('../models/User');

const createChat = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            message: `Invalid user_id!`
        });
    }

    const user = await User.findOne({
        email: email
    });
    if (!user) {
        return res.status(404).json({
            message: `User not found!`
        });
    }

    const find = await Chat.findOne({
        $and: [
            { users: { $elemMatch: { user_id: req.user._id } } },
            { users: { $elemMatch: { user_id: user._id } } }
        ]
    });

    if (!find) {
        await Chat.create({
            users: [
                { user_id: req.user._id, seen: true },
                { user_id: new ObjectId(user._id), seen: true }
            ],
            messages: []
        });

        user.notifications.push({
            from: req.user._id,
            message: `Here wants to contact you`,
            category: "Chat",
            link: "",
            read: false,
            time: new Date(),
            status: 0
        });
        await user.save();
    }

    req.params.user_id = user._id;

    getChatWith(req, res);
}

const sendMessage = async (req, res) => {
    const { receiver_id, message } = req.body;
    
    if (!mongoose.isValidObjectId(receiver_id)) {
        return res.status(400).json({
            message: `Invalid user_id!`
        });
    } else if (message == "" || message == null) {
        return res.status(400).json({
            message: `Message must not be empty!`
        });
    }

    const chat = await Chat.findOne({
        $and: [
            { users: { $elemMatch: { user_id: req.user._id } } },
            { users: { $elemMatch: { user_id: new ObjectId(receiver_id) } } }
        ]
    });

    if (!chat) {
        return res.status(400).json({
            message: `User chat not found!`
        });
    }

    chat.messages.push({
        value: message,
        sender:  req.user._id,
        time: new Date()
    });
    await chat.save();

    getAllChat(req, res);
}

const getAllChat = async (req, res) => {
    const chats = await Chat.find({
        users: { $elemMatch: { user_id: req.user._id } }
    }).populate({
        path: "users.user_id",
        select: "-password"
    }).populate({
        path: "messages.sender",
        select: "-password"
    }).lean();

    chats.forEach((chat) => {
        chat.users = chat.users.map((u) => ({
            _id: u._id,
            user: u.user_id,
            seen: u.seen
        }));
        chat.users.forEach((u) => {
            u.user.profile_picture = u.user.profile_picture == "" ? "" : `${ env("HOST") }/api/public/${ u.user.profile_picture }`
            u.user.header_picture = u.user.header_picture == "" ? "" : `${ env("HOST") }/api/public/${ u.user.header_picture }`
        });
    });

    return res.status(200).json(chats);
}

const getChatWith = async (req, res) => {
    const { user_id } = req.params;

    if (!mongoose.isValidObjectId(user_id)) {
        return res.status(400).json({
            message: `Invalid email!`
        });
    }

    const chat = await Chat.findOne({
        $and: [
            { users: { $elemMatch: { user_id: req.user._id } } },
            { users: { $elemMatch: { user_id: new ObjectId(user_id) } } }
        ]
    }).populate({
        path: "users.user_id",
        select: "-password"
    }).populate({
        path: "messages.sender",
        select: "-password"
    }).lean();

    if (!chat) {
        return res.status(404).json({
            message: `Chat not found!`
        });
    }

    chat.users = chat.users.map((u) => ({
        _id: u._id,
        user: u.user_id,
        seen: u.seen
    }));

    chat.users.forEach((u) => {
        u.user.profile_picture = u.user.profile_picture == "" ? "" : `${ env("HOST") }/api/public/${ u.user.profile_picture }`
        u.user.header_picture = u.user.header_picture == "" ? "" : `${ env("HOST") }/api/public/${ u.user.header_picture }`
    });

    return res.status(200).json(chat);
}

module.exports = {
    createChat,
    sendMessage,
    getAllChat,
    getChatWith
}