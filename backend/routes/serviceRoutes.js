import express from 'express';
import Service from '../models/Service.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get all services
// @route   GET /api/services
// @access  Public
router.get('/', async (req, res) => {
    try {
        const services = await Service.find({ isActive: true });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get service by ID
// @route   GET /api/services/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (service) {
            res.json(service);
        } else {
            res.status(404).json({ message: 'Service not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create new service
// @route   POST /api/services
// @access  Private (Provider/Admin)
router.post('/', protect, authorize('Provider', 'Service Provider', 'Admin'), async (req, res) => {
    try {
        // Automatically set providerId from token if not provided (though usually UI sends it, better to secure it)
        const serviceData = {
            location: req.user.address || 'Anywhere',
            ...req.body,
            providerId: req.user._id,
            providerName: req.user.name // Ensure consistency
        };

        const service = new Service(serviceData);
        const createdService = await service.save();
        res.status(201).json(createdService);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Provider Owner/Admin)
router.put('/:id', protect, authorize('Provider', 'Service Provider', 'Admin'), async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (service) {
            // Check ownership
            if (service.providerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
                return res.status(403).json({ message: 'Not authorized to update this service' });
            }

            service.name = req.body.name || service.name;
            service.description = req.body.description || service.description;
            service.price = req.body.price || service.price;
            service.category = req.body.category || service.category;
            service.image = req.body.image || service.image;
            service.location = req.body.location || service.location;

            const updatedService = await service.save();
            res.json(updatedService);
        } else {
            res.status(404).json({ message: 'Service not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update service status
// @route   PUT /api/services/:id/status
// @access  Private (Provider Owner/Admin)
router.put('/:id/status', protect, authorize('Provider', 'Service Provider', 'Admin'), async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (service) {
            if (service.providerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
                return res.status(403).json({ message: 'Not authorized to update this service' });
            }

            service.isActive = req.body.isActive !== undefined ? req.body.isActive : service.isActive;
            const updatedService = await service.save();
            res.json(updatedService);
        } else {
            res.status(404).json({ message: 'Service not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Provider Owner/Admin)
router.delete('/:id', protect, authorize('Provider', 'Service Provider', 'Admin'), async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (service) {
            if (service.providerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
                return res.status(403).json({ message: 'Not authorized to delete this service' });
            }

            await service.deleteOne();
            res.json({ message: 'Service removed' });
        } else {
            res.status(404).json({ message: 'Service not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
