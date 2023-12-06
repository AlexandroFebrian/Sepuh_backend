const mongoose = require('mongoose');
const { Schema } = mongoose;

const agreementSchema = new Schema({
    start_date: Date,
    end_date: Date,
    deal_price: Number,
    invoice: String,
    file: [{
        name: String,
        time: Date,
        comment: String,
        status: Number
    }],
    freelancer: { type: Schema.Types.ObjectId, ref: 'User' },
    company: { type: Schema.Types.ObjectId, ref: 'User' },
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    freelancer_status: Number, // 0 belom deal harga, 1 sudah deal harga, 2 pencet done project
    company_status: Number, // 0 belom deal harga, 1 sudah deal harga (agreement status masih 0 kalo blm dibayar, klo udh bayar agreement status jadi 1 & gk isa bayar kalo freelancer status masih 0), 2 pencet done project
    status: Number // -1 rejected, 0 belom bayar, 1 sudah dibayar, 2 freelancer & company done
}, {
    timestamps: { createdAt: 'create_at', updatedAt: 'update_at' }, versionKey: false
});

const Agreement = mongoose.model('Agreement', agreementSchema);

module.exports = Agreement;