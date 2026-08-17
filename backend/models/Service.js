import mongoose from 'mongoose';

// Service Schema
const serviceSchema = mongoose.Schema({
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    providerName: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    location: { type: String },
    image: { type: String },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

export default mongoose.model('Service', serviceSchema);
