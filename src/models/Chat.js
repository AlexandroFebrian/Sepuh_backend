const mongoose = require('mongoose');
const { Schema } = mongoose;

const chatSchema = new Schema({
    users: [{
        user_id: { type: Schema.Types.ObjectId, ref: 'User' },
        seen: Boolean
    }],
    messages: [{
        value: String,
        sender: { type: Schema.Types.ObjectId, ref: 'User' },
        time: Date
    }]
}, {
    timestamps: { createdAt: 'create_at', updatedAt: 'update_at' }, versionKey: false
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;