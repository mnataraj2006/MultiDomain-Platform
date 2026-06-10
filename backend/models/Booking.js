import mongoose from 'mongoose';

const bookingSchema = mongoose.Schema({
    customerId: { type: String, required: true },
    providerId: { type: String, required: true },
    providerName: { type: String, required: true },
    service: { type: String, required: true },
    domain: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String },
    notes: { type: String },
    status: { type: String, default: 'Pending', enum: ['Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled'] },
    price: { type: Number, required: true },
    acceptedAt: { type: Date },
    completedAt: { type: Date }
}, {
    timestamps: true
});

export default mongoose.model('Booking', bookingSchema);
