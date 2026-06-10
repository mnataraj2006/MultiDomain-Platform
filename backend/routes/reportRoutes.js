import express from 'express';
import Booking from '../models/Booking.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

const generateJSONReport = (data, title) => {
    return {
        title,
        generatedAt: new Date(),
        recordCount: data.length,
        data
    };
};

// @desc    Get Demand Report
router.get('/demand', protect, authorize('Admin'), async (req, res) => {
    try {
        const data = await Booking.find({});
        res.json(generateJSONReport(data, 'Full Demand Report'));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get Revenue Report
router.get('/revenue', protect, authorize('Admin'), async (req, res) => {
    try {
        const data = await Booking.find({ status: 'Completed' }).select('date service providerName price domain');
        res.json(generateJSONReport(data, 'Revenue Report'));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get Provider Report
router.get('/provider', protect, authorize('Admin'), async (req, res) => {
    try {
        const data = await Booking.aggregate([
            {
                $group: {
                    _id: "$providerName",
                    domain: { $first: "$domain" },
                    totalJobs: { $sum: 1 },
                    completedJobs: {
                        $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
                    },
                    totalRevenue: {
                        $sum: { $cond: [{ $eq: ["$status", "Completed"] }, "$price", 0] }
                    }
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);
        res.json(generateJSONReport(data, 'Provider Performance Report'));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get User Activity Report
router.get('/user', protect, authorize('Admin'), async (req, res) => {
    try {
        const data = await Booking.aggregate([
            {
                $group: {
                    _id: "$customerId",
                    totalBookings: { $sum: 1 },
                    completedBookings: {
                        $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
                    },
                    totalSpent: {
                        $sum: { $cond: [{ $eq: ["$status", "Completed"] }, "$price", 0] }
                    }
                }
            },
            { $sort: { totalBookings: -1 } }
        ]);
        res.json(generateJSONReport(data, 'User Activity Report'));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
