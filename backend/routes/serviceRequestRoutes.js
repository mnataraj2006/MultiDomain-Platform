import express from 'express';
import ServiceRequest from '../models/ServiceRequest.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { sendServiceRequestEmail, sendConfirmationEmail } from '../utils/emailService.js';

const router = express.Router();

// @desc    Create new service request & broadcast
// @route   POST /api/service-requests
// @access  Private (Customer)
router.post('/', protect, async (req, res) => {
    try {
        const { serviceType, location, date, description } = req.body;

        const serviceRequest = await ServiceRequest.create({
            serviceType,
            location,
            date,
            description,
            customerId: req.user._id,
        });

        // Find available service providers of the requested domain/service type
        const providers = await User.find({
            role: 'Provider',
            domain: serviceType // Or category, based on how domain maps
        });

        if (providers.length > 0) {
            const providerEmails = providers.map(p => p.email);
            // Send email to available providers asynchronously
            sendServiceRequestEmail(providerEmails, serviceRequest);
        }

        res.status(201).json(serviceRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Provider accepts service request
// @route   PUT /api/service-requests/:id/accept
// @access  Private (Provider)
router.put('/:id/accept', protect, authorize('Provider', 'Service Provider'), async (req, res) => {
    try {
        const requestId = req.params.id;
        const providerId = req.user._id;

        // Atomic update to ensure only "Pending" requests are accepted
        const serviceRequest = await ServiceRequest.findOneAndUpdate(
            { _id: requestId, status: 'Pending' },
            { status: 'Accepted', assignedProvider: providerId },
            { new: true }
        ).populate('customerId', 'name email');

        if (!serviceRequest) {
            // Already accepted or doesn't exist
            return res.status(400).json({ message: 'Request is no longer available or already accepted by another provider.' });
        }

        const provider = await User.findById(providerId);

        // Convert the accepted ServiceRequest into an active Booking
        const newBooking = await Booking.create({
            customerId: serviceRequest.customerId._id,
            providerId: provider._id,
            providerName: provider.name,
            service: serviceRequest.serviceType,
            domain: serviceRequest.serviceType,
            date: serviceRequest.date,
            time: "TBD", // Requires explicit time, can be updated later
            status: "Accepted",
            price: 50 // Standardize
        });

        // Send confirmation email to customer
        sendConfirmationEmail(serviceRequest.customerId.email, provider, serviceRequest);

        res.json({ message: 'Successfully accepted request', request: serviceRequest, booking: newBooking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
