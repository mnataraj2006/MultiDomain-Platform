import mongoose from 'mongoose';

const paymentSchema = mongoose.Schema({
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: { type: String, enum: ['Pending', 'Completed', 'Failed', 'Refunded'], default: 'Pending' },
    method: { type: String, default: 'Card' },
    transactionId: { type: String }
}, {
    timestamps: true
});

export default mongoose.model('Payment', paymentSchema);
