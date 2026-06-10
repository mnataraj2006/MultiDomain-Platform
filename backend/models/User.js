import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// User Schema
const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional for Google Auth
    googleId: { type: String },
    provider: { type: String, enum: ['local', 'google'], default: 'local' },
    role: { type: String, enum: ['Customer', 'Provider', 'Admin'], default: 'Customer' },
    profilePicture: { type: String },
    phone: { type: String },
    address: { type: String },
    // Provider specific fields
    domain: { type: String },
    bio: { type: String },
    rating: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: false },
    experience: { type: String },
    availability: { type: Boolean, default: true },
    totalReviews: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    performanceScore: { type: Number, default: 0 }
}, {
    timestamps: true
});

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
