import express from 'express';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { sendDirectBookingEmail, sendConfirmationEmail, sendFeedbackEmail } from '../utils/emailService.js';

const router = express.Router();

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { providerId, providerName, service, domain, date, time, location, notes, price } = req.body;

        const booking = new Booking({
            customerId: req.user._id, // Get from token
            providerId,
            providerName,
            service,
            domain,
            date,
            time,
            location,
            notes,
            price,
            status: 'Pending'
        });

        const createdBooking = await booking.save();

        // Send an email to the provider notifying them of the direct booking
        const provider = await User.findById(providerId);
        const customer = await User.findById(req.user._id);

        if (provider && provider.email) {
            sendDirectBookingEmail(provider.email, customer, createdBooking);
        }

        res.status(201).json(createdBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
router.get('/', protect, authorize('Admin'), async (req, res) => {
    try {
        const bookings = await Booking.find({}).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get booking details
// @route   GET /api/bookings/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (booking) {
            // Access check: Only Customer, Provider of the booking, or Admin
            if (
                booking.customerId.toString() !== req.user._id.toString() &&
                booking.providerId.toString() !== req.user._id.toString() &&
                req.user.role !== 'Admin'
            ) {
                return res.status(403).json({ message: 'Not authorized to view this booking' });
            }
            res.json(booking);
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get bookings for a specific customer
// @route   GET /api/bookings/user/:userId
// @access  Private
router.get('/user/:userId', protect, async (req, res) => {
    try {
        // Access check
        if (req.params.userId !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const bookings = await Booking.find({ customerId: req.params.userId }).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get bookings for a specific provider
// @route   GET /api/bookings/provider/:providerId
// @access  Private
router.get('/provider/:providerId', protect, async (req, res) => {
    try {
        // Access check
        if (req.params.providerId !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const bookings = await Booking.find({ providerId: req.params.providerId }).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update booking status (Accept/Reject/Complete)
// @route   PUT /api/bookings/:id/status
// @access  Private (Provider/Admin)
router.put('/:id/status', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (booking) {
            // Only Provider or Admin can change status primarily (Customer can cancel via specific endpoint)
            if (
                booking.providerId.toString() !== req.user._id.toString() &&
                req.user.role !== 'Admin'
            ) {
                return res.status(403).json({ message: 'Not authorized' });
            }

            booking.status = req.body.status || booking.status;

            // If completed, maybe set completedAt?
            if (req.body.status === 'Completed' && !booking.completedAt) {
                booking.completedAt = new Date();
            }
            if (req.body.status === 'Accepted' && !booking.acceptedAt) {
                booking.acceptedAt = new Date();
            }

            const updatedBooking = await booking.save();

            // Send confirmation email to Customer if accepted
            if (req.body.status === 'Accepted') {
                const customer = await User.findById(updatedBooking.customerId);
                const provider = await User.findById(updatedBooking.providerId);
                if (customer && customer.email) {
                    sendConfirmationEmail(customer.email, provider, updatedBooking);
                }
            } else if (req.body.status === 'Completed') {
                // Send feedback email to customer
                const customer = await User.findById(updatedBooking.customerId);
                const provider = await User.findById(updatedBooking.providerId);
                if (customer && customer.email) {
                    sendFeedbackEmail(customer.email, provider, updatedBooking);
                }
            }

            res.json(updatedBooking);
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Customer/Admin/Provider)
router.put('/:id/cancel', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (booking) {
            // Check authorization
            if (
                booking.customerId.toString() !== req.user._id.toString() &&
                booking.providerId.toString() !== req.user._id.toString() &&
                req.user.role !== 'Admin'
            ) {
                return res.status(403).json({ message: 'Not authorized' });
            }

            if (booking.status === 'Completed') {
                return res.status(400).json({ message: 'Cannot cancel completed booking' });
            }

            booking.status = 'Cancelled';
            const updatedBooking = await booking.save();
            res.json(updatedBooking);
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
