import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { protect } from '../middleware/authMiddleware.js';
import { OAuth2Client } from 'google-auth-library';
import Service from '../models/Service.js';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID");

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, 'your_jwt_secret_key_123', {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password, role, domain, phone } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            domain,
            phone
        });

        // Automatically create a Service listing so they show up in the Customer Browse Services page
        if (user && user.role === 'Provider') {
            await Service.create({
                providerId: user._id,
                providerName: user.name,
                name: `${user.name} - ${user.domain || 'Professional'} Service`,
                description: `High quality ${user.domain || 'professional'} services provided by ${user.name}.`,
                category: user.domain || 'General',
                price: 50, // Default base price
                isActive: true
            });
        }

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Auth user via Google
// @route   POST /api/auth/google
// @access  Public
router.post('/google', async (req, res) => {
    const { tokenId } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID",
        });
        const payload = ticket.getPayload();
        const { email, name, sub: googleId, picture: profilePicture } = payload;

        let user = await User.findOne({ email });
        let isNewUser = false;

        if (!user) {
            isNewUser = true;
            user = await User.create({
                name,
                email,
                googleId,
                provider: 'google',
                profilePicture,
                role: 'Customer', // Default, will be updated via onboarding
            });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isNewUser,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(401).json({ message: 'Google authentication failed' });
    }
});

// @desc    Update User Role (Onboarding)
// @route   PUT /api/auth/update-role
// @access  Private
router.put('/update-role', protect, async (req, res) => {
    const { role, domain, phone, address, experience, availability } = req.body;
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = role;
        if (phone) user.phone = phone;
        if (address) user.address = address;

        if (role === 'Provider') {
            if (domain) user.domain = domain;
            if (experience) user.experience = experience;
            if (availability !== undefined) user.availability = availability;
        }
        await user.save();

        if (role === 'Provider') {
            const existingService = await Service.findOne({ providerId: user._id });
            if (!existingService) {
                await Service.create({
                    providerId: user._id,
                    providerName: user.name,
                    name: `${user.name} - ${user.domain || 'Professional'} Service`,
                    description: `High quality ${user.domain || 'professional'} services provided by ${user.name}.`,
                    category: user.domain || 'General',
                    price: 50, // Default base price
                    isActive: true
                });
            }
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id), // Optional: refresh token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
    const user = {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone,
        address: req.user.address,
        domain: req.user.domain,
        bio: req.user.bio,
        experience: req.user.experience,
        availability: req.user.availability
    };
    res.status(200).json(user);
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', (req, res) => {
    // For JWT based auth, logout is typically handled on client by removing token.
    // Server-side you might add token to blacklist but for simple impl we just response ok.
    res.status(200).json({ message: 'Logged out successfully' });
});

// @desc    Forgot Password (Mock)
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // In production: Generate reset token -> Save to DB -> Send Email
        console.log(`Reset link sent to ${email} (simulated)`);
        res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', async (req, res) => {
    // In production: Verify token -> Update password
    const { email, newPassword } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.password = newPassword; // Pre-save hook will hash this
        await user.save();
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
