import express from 'express';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Record new payment (Mock payment gateway callback)
// @route   POST /api/payments
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { bookingId, amount, method } = req.body;

        // Lookup booking to get provider
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        const payment = new Payment({
            providerId: booking.providerId,
            bookingId,
            amount,
            method,
            status: 'Completed', // specialized mock
            transactionId: `TXN_${Date.now()}`
        });

        const createdPayment = await payment.save();
        res.status(201).json(createdPayment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get payments for a provider
// @route   GET /api/payments/provider/:providerId
// @access  Private (Provider/Admin)
router.get('/provider/:providerId', protect, async (req, res) => {
    try {
        if (req.params.providerId !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const payments = await Payment.find({ providerId: req.params.providerId }).sort({ createdAt: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update payment status
// @route   PUT /api/payments/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, authorize('Admin'), async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (payment) {
            payment.status = req.body.status || payment.status;
            const updatedPayment = await payment.save();
            res.json(updatedPayment);
        } else {
            res.status(404).json({ message: 'Payment not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
