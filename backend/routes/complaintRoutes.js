import express from 'express';
import Complaint from '../models/Complaint.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Submit complaint
// @route   POST /api/complaints
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { bookingId, subject, description, priority } = req.body;

        const complaint = new Complaint({
            userId: req.user._id,
            bookingId,
            subject,
            description,
            priority
        });

        const createdComplaint = await complaint.save();
        res.status(201).json(createdComplaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all complaints (Admin) or User's
// @route   GET /api/complaints
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let complaints;
        if (req.user.role === 'Admin') {
            complaints = await Complaint.find({}).populate('userId', 'name email').sort({ createdAt: -1 });
        } else {
            complaints = await Complaint.find({ userId: req.user._id }).sort({ createdAt: -1 });
        }
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update complaint status (Admin)
// @route   PUT /api/complaints/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, authorize('Admin'), async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);
        if (complaint) {
            complaint.status = req.body.status || complaint.status;
            complaint.resolution = req.body.resolution || complaint.resolution;
            const updatedComplaint = await complaint.save();
            res.json(updatedComplaint);
        } else {
            res.status(404).json({ message: 'Complaint not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
