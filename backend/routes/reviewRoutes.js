import express from 'express';
import Review from '../models/Review.js';
import Service from '../models/Service.js';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private (Customer)
router.post('/', protect, async (req, res) => {
    try {
        const { providerId, serviceId, bookingId, rating, comment } = req.body;

        const review = new Review({
            customerId: req.user._id,
            providerId,
            serviceId,
            bookingId,
            rating,
            comment
        });

        const createdReview = await review.save();

        // Update Service Rating
        // Calculate new average
        const reviews = await Review.find({ serviceId });
        const avg = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

        await Service.findByIdAndUpdate(serviceId, {
            rating: avg,
            reviewsCount: reviews.length
        });

        // Optionally update Provider aggregate rating too
        // const providerReviews = await Review.find({ providerId });
        // const pAvg = providerReviews.reduce((acc, item) => item.rating + acc, 0) / providerReviews.length;
        // await User.findByIdAndUpdate(providerId, { rating: pAvg });

        res.status(201).json(createdReview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get reviews for a service
// @route   GET /api/reviews/service/:serviceId
// @access  Public
router.get('/service/:serviceId', async (req, res) => {
    try {
        const reviews = await Review.find({ serviceId: req.params.serviceId })
            .populate('customerId', 'name')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get reviews for a provider
// @route   GET /api/reviews/provider/:providerId
// @access  Public
router.get('/provider/:providerId', async (req, res) => {
    try {
        const reviews = await Review.find({ providerId: req.params.providerId })
            .populate('customerId', 'name')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
