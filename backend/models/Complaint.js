import mongoose from 'mongoose';

const complaintSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reporter
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }, // Optional linked booking
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    resolution: { type: String }
}, {
    timestamps: true
});

export default mongoose.model('Complaint', complaintSchema);
