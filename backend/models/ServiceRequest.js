import mongoose from 'mongoose';

const serviceRequestSchema = mongoose.Schema({
    serviceType: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: String, required: true },
    description: { type: String, required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, default: 'Pending', enum: ['Pending', 'Accepted', 'Completed', 'Cancelled'] },
    assignedProvider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, {
    timestamps: true
});

export default mongoose.model('ServiceRequest', serviceRequestSchema);
