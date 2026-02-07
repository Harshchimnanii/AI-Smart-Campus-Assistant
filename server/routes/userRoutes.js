const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, admin, ceo } = require('../middleware/authMiddleware');

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin/CEO)
router.get('/', protect, async (req, res) => {
    try {
        // Only Admin or CEO can view all users
        if (req.user.role !== 'admin' && req.user.role !== 'ceo') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/users
// @desc    Create a user (Teacher/Admin)
// @access  Private (Admin/CEO)
router.post('/', protect, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'ceo') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { name, email, password, role, department } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            department
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user
// @access  Private (CEO Only or Admin delete non-admin?) -> Let's say CEO only for significant deletes
router.delete('/:id', protect, async (req, res) => {
    try {
        // Simplified: Admin/CEO can delete
        if (req.user.role !== 'admin' && req.user.role !== 'ceo') {
            return res.status(403).json({ message: 'Not authorized' });
        }

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

module.exports = router;
