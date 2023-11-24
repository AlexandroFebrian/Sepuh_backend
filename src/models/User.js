const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    name: String,
    email: String,
    headline: String,
    password: String,
    profile_picture: String,
    role: String,
    balance: Number,
    rating: Number,
    account_number: String,
    employees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    history: [{ type: Schema.Types.ObjectId, ref: 'Agreement' }],
    list: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    status: Number
}, {
    timestamps: { createdAt: 'create_at', updatedAt: 'update_at' }, versionKey: false
});

const User = mongoose.model('User', userSchema);

module.exports = User;