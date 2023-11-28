const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const env = require("../config/env.config");

const Chat = require("../models/Chat");

const createChat = async (req, res) => {
    const { user_id } = req.body;

    if (!mongoose.isValidObjectId(user_id)) {
        return res.status(400).json({
            message: `Invalid user_id!`
        });
    }

    const chat = await Chat.findOne({
        $and: [
            { users: { $elemMatch: { user_id: req.user._id } } },
            { users: { $elemMatch: { user_id: new ObjectId(user_id) } } }
        ]
    }); 

    if (chat) {
        return res.status(400).json({
            message: `User chat already created!`
        });
    }

    await Chat.create({
        users: [
            { user_id: req.user._id, seen: true },
            { user_id: new ObjectId(user_id), seen: true }
        ],
        messages: []
    });
}

const sendMessage = async (req, res) => {
    const { receiver_id, message } = req.body;
    
    if (!mongoose.isValidObjectId(receiver_id)) {
        return res.status(400).json({
            message: `Invalid user_id!`
        });
    } else if (message == "") {
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

    return res.status(200).json({
        message: `Successfully sent message`
    });
}

module.exports = {
    createChat,
    sendMessage
}