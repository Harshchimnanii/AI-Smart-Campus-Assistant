const express = require('express');
const router = express.Router();
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { protect, admin, ceo } = require('../middleware/authMiddleware');

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin/CEO)
router.get('/', protect, async (req, res) => {
    try {
        // Admin, CEO, and Teachers can view users (Teachers need it for Student History)
        if (req.user.role !== 'admin' && req.user.role !== 'ceo' && req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;
            user.address = req.body.address || user.address;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                address: updatedUser.address,
                role: updatedUser.role,
                department: updatedUser.department,
                year: updatedUser.year,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
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

// @route   POST /api/users/:id/ufm
// @desc    Add UFM Record
// @access  Private (Teacher/Admin)
router.post('/:id/ufm', protect, async (req, res) => {
    try {
        if (req.user.role !== 'teacher' && req.user.role !== 'admin' && req.user.role !== 'ceo') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { subject, reason, actionTaken } = req.body;
        const user = await User.findById(req.params.id);

        if (user) {
            const ufm = {
                subject,
                reason,
                actionTaken,
                date: Date.now()
            };

            user.ufmHistory.push(ufm);
            await user.save();
            res.status(201).json(user.ufmHistory);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/users/:id/backlog
// @desc    Add Backlog Record
// @access  Private (Teacher/Admin)
router.post('/:id/backlog', protect, async (req, res) => {
    try {
        if (req.user.role !== 'teacher' && req.user.role !== 'admin' && req.user.role !== 'ceo') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { subject, semester, status } = req.body;
        const user = await User.findById(req.params.id);

        if (user) {
            const backlog = {
                subject,
                semester,
                status: status || 'active'
            };

            user.backlogs.push(backlog);
            await user.save();
            res.status(201).json(user.backlogs);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/users/:id/academic-stats
// @desc    Update Student Academic Stats (CPI/Credits)
// @access  Private (Teacher/Admin)
router.put('/:id/academic-stats', protect, async (req, res) => {
    try {
        if (req.user.role !== 'teacher' && req.user.role !== 'admin' && req.user.role !== 'ceo') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { cpi, totalCredits } = req.body;
        const user = await User.findById(req.params.id);

        if (user) {
            user.academicStats = {
                cpi: Number(cpi) || user.academicStats.cpi,
                totalCredits: Number(totalCredits) || user.academicStats.totalCredits
            };
            await user.save();
            res.json(user.academicStats);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
