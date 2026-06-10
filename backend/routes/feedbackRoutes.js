import express from 'express';
import Feedback from '../models/Feedback.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Service from '../models/Service.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Submit feedback for a completed service
// @route   POST /api/feedback
// @access  Private (Customer)
router.post('/', protect, async (req, res) => {
    try {
        const { serviceRequestId, rating, review, photos } = req.body;

        const booking = await Booking.findById(serviceRequestId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Verify that the logged-in user is the customer of the booking
        if (booking.customerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (booking.status !== 'Completed') {
            return res.status(400).json({ message: 'Service is not completed yet' });
        }

        // Check if feedback already exists
        const existingFeedback = await Feedback.findOne({ serviceRequestId });
        if (existingFeedback) {
            return res.status(400).json({ message: 'Feedback already submitted for this service' });
        }

        // Create feedback
        const feedback = new Feedback({
            serviceRequestId,
            providerId: booking.providerId,
            customerId: booking.customerId,
            rating,
            review,
            photos: photos || []
        });

        await feedback.save();

        // Recalculate Provider Metrics
        const provider = await User.findById(booking.providerId);
        if (provider) {
            const allFeedbacks = await Feedback.find({ providerId: provider._id });
            const allProviderBookings = await Booking.find({ providerId: provider._id, status: { $in: ['Accepted', 'Completed', 'In Progress'] } });
            const completedBookings = await Booking.find({ providerId: provider._id, status: 'Completed' });

            const totalReviews = allFeedbacks.length;
            const averageRating = allFeedbacks.reduce((acc, current) => acc + current.rating, 0) / totalReviews;

            const completionRate = allProviderBookings.length > 0
                ? (completedBookings.length / allProviderBookings.length) * 100
                : 100;

            // Simple Response Speed Score (out of 5, based on acceptance speed if we had it uniformly, but let's mock a simple metric)
            // Just placeholder for now
            const responseSpeedScore = 5.0;

            // Formula: Performance Score = (0.5 * Average Rating) + (0.3 * (Completion Rate / 20)) + (0.2 * Response Speed Score)
            // Ratings out of 5, Completion Rate/20 is out of 5
            const performanceScore = (0.5 * averageRating) + (0.3 * (completionRate / 20)) + (0.2 * responseSpeedScore);

            provider.totalReviews = totalReviews;
            provider.rating = averageRating;
            provider.completedJobs = completedBookings.length;
            provider.completionRate = completionRate;
            provider.performanceScore = Math.min(Math.max(performanceScore, 0), 5); // cap 0-5

            await provider.save();
        }

        // Sync Service Metrics
        const service = await Service.findOne({ providerId: booking.providerId });
        if (service) {
            const allFeedbacks = await Feedback.find({ providerId: booking.providerId });
            const totalReviews = allFeedbacks.length;
            const averageRating = totalReviews > 0 ? (allFeedbacks.reduce((acc, current) => acc + current.rating, 0) / totalReviews) : 0;

            service.reviewsCount = totalReviews;
            service.rating = Number(averageRating.toFixed(1));
            await service.save();
        }

        res.status(201).json(feedback);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get feedbacks for a provider
// @route   GET /api/feedback/provider/:providerId
// @access  Public
router.get('/provider/:providerId', async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ providerId: req.params.providerId })
            .populate('customerId', 'name')
            .sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
