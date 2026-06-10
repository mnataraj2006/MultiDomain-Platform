import mongoose from 'mongoose';

const feedbackSchema = mongoose.Schema({
    serviceRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, required: true },
    photos: [{ type: String }],
}, {
    timestamps: true
});

export default mongoose.model('Feedback', feedbackSchema);
