import express from 'express';
import User from '../models/User.js';
import Service from '../models/Service.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, authorize('Admin'), async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            // Ensure user matches token user or is admin
            if (req.user._id.toString() !== user._id.toString() && req.user.role !== 'Admin') {
                return res.status(403).json({ message: 'Not authorized to update this profile' });
            }

            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;
            user.address = req.body.address || user.address;

            if (req.body.password) {
                user.password = req.body.password;
            }
            if (user.role === 'Provider' || user.role === 'Service Provider') {
                user.domain = req.body.domain || user.domain;
                user.bio = req.body.bio || user.bio;
                if (req.body.experience !== undefined) user.experience = req.body.experience;
                if (req.body.availability !== undefined) {
                    user.availability = req.body.availability;
                    // Sync the Service's active status with the provider's availability
                    await Service.updateMany({ providerId: user._id }, { isActive: req.body.availability });
                }
            }

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                phone: updatedUser.phone,
                address: updatedUser.address, // Added
                domain: updatedUser.domain,
                bio: updatedUser.bio,
                experience: updatedUser.experience, // Added
                availability: updatedUser.availability // Added
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update user status (Approve/Reject/Block)
// @route   PUT /api/users/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, authorize('Admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.isApproved = req.body.isApproved !== undefined ? req.body.isApproved : user.isApproved;

            // Assuming we might have a dedicated status field later, but for now isApproved
            // specific logic for Providers usually.

            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
