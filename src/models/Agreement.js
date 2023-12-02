const mongoose = require('mongoose');
const { Schema } = mongoose;

const agreementSchema = new Schema({
    start_date: Date,
    end_date: Date,
    deal_price: Number,
    file: [{
        name: String,
        time: Date,
        status: Number
    }],
    freelancer: { type: Schema.Types.ObjectId, ref: 'User' },
    company: { type: Schema.Types.ObjectId, ref: 'User' },
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    status: Number
}, {
    timestamps: { createdAt: 'create_at', updatedAt: 'update_at' }, versionKey: false
});

const Agreement = mongoose.model('Agreement', agreementSchema);

module.exports = Agreement;