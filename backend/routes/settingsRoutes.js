import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get user settings
// @route   GET /api/settings
// @access  Private
router.get('/', protect, async (req, res) => {
    // Return standard settings or user profile data interpreted as settings
    const user = await User.findById(req.user._id);
    res.json({
        notifications: true, // Mock setting
        theme: 'light',      // Mock setting
        language: 'en',      // Mock setting
        email: user.email,
        phone: user.phone
    });
});

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private
router.put('/', protect, async (req, res) => {
    // In a real app we would have a Settings model or fields
    // Here we just mock success
    res.json({ message: 'Settings updated successfully', settings: req.body });
});

// @desc    Update password
// @route   PUT /api/settings/password
// @access  Private
router.put('/password', protect, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (user && (await user.matchPassword(currentPassword))) {
        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } else {
        res.status(401).json({ message: 'Invalid current password' });
    }
});

export default router;
