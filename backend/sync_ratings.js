import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Feedback from './models/Feedback.js';
import Service from './models/Service.js';
import User from './models/User.js';

dotenv.config({ path: './.env' });

async function syncRatings() {
    await connectDB();
    const providers = await User.find({ role: { $in: ['Provider', 'Service Provider'] } });

    for (let provider of providers) {
        const feedbacks = await Feedback.find({ providerId: provider._id });
        const totalReviews = feedbacks.length;
        const avg = totalReviews > 0 ? (feedbacks.reduce((a, b) => a + b.rating, 0) / totalReviews) : 0;

        provider.totalReviews = totalReviews;
        provider.rating = Number(avg.toFixed(1));
        await provider.save();

        await Service.updateMany(
            { providerId: provider._id },
            { $set: { rating: Number(avg.toFixed(1)), reviewsCount: totalReviews } }
        );
        console.log(`Updated provider ${provider.name} and their services: ${avg} rating, ${totalReviews} reviews.`);
    }
    process.exit(0);
}

syncRatings();
