const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema({
    title: String,
    duration: Number,
    duration_type: String,
    description: String, 
    image: [{ type: String }],
    hashtag: [{ type: String }],
    min_price: Number,
    max_price: Number,
    avg_rating: Number,
    visitor: Number,
    comments: [{
        user_id: { type: Schema.Types.ObjectId, ref: 'User' },
        rating: Number,
        comment: String
    }],
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    status: Number
}, {
    timestamps: { createdAt: 'create_at', updatedAt: 'update_at' }, versionKey: false
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;