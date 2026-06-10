import express from 'express';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get all pending providers
// @route   GET /api/providers/pending
// @access  Private/Admin
router.get('/pending', protect, authorize('Admin'), async (req, res) => {
    try {
        const providers = await User.find({
            role: { $in: ['Provider', 'Service Provider'] },
            isApproved: false
        }).select('-password');
        res.json(providers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Approve provider
// @route   PUT /api/providers/:id/approve
// @access  Private/Admin
router.put('/:id/approve', protect, authorize('Admin'), async (req, res) => {
    try {
        const provider = await User.findById(req.params.id);

        if (provider) {
            provider.isApproved = true;
            const updatedProvider = await provider.save();
            res.json(updatedProvider);
        } else {
            res.status(404).json({ message: 'Provider not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Reject provider
// @route   PUT /api/providers/:id/reject
// @access  Private/Admin
router.put('/:id/reject', protect, authorize('Admin'), async (req, res) => {
    try {
        const provider = await User.findById(req.params.id);

        if (provider) {
            // Option 1: Delete
            // await provider.deleteOne();
            // Option 2: Set flag (if we had a status field). 
            // For now, let's keep isApproved false, effectively rejecting them from logging in 
            // if we add that check, or just removing them from the pending list if we had a status 'Rejected'.
            // Let's implement Delete for rejection to keep it clean or just return them with isApproved: false

            // Per requirement "Reject", often implies status update.
            // Since we only have isApproved (boolean), let's assume we might delete them or leave them unapproved.
            // But usually validation implies we delete spam or keep them as rejected.
            // Let's keep them but maybe we should add a status field to User later.
            // For this specific request, I will just return the user as is (effectively doing nothing but acknowledging)
            // OR ideally, delete them if they are spam.

            // Let's actually delete them to clear the queue for this simple implementation
            await provider.deleteOne();
            res.json({ message: 'Provider rejected and removed' });
        } else {
            res.status(404).json({ message: 'Provider not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get provider details
// @route   GET /api/providers/:id/details
// @access  Private/Admin
router.get('/:id/details', protect, authorize('Admin'), async (req, res) => {
    try {
        const provider = await User.findById(req.params.id).select('-password');
        if (provider) {
            res.json(provider);
        } else {
            res.status(404).json({ message: 'Provider not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
