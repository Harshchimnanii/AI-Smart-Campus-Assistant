const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   GET /api/notices
// @desc    Get all notices (filtered by dept optionally)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const notices = await Notice.find({
            $or: [{ department: "All" }, { department: req.user.department }]
        }).sort({ createdAt: -1 });
        res.json(notices);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/notices
// @desc    Create a notice
// @access  Private (Admin/Teacher only - simplified to Admin for now)
router.post('/', protect, admin, async (req, res) => {
    try {
        const { title, description, department } = req.body;
        const notice = new Notice({
            title,
            description,
            department,
            createdBy: req.user._id
        });
        const createdNotice = await notice.save();
        res.status(201).json(createdNotice);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/notices/:id
// @desc    Delete a notice
// @access  Private (Admin Only)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);
        if (!notice) {
            return res.status(404).json({ message: 'Notice not found' });
        }
        await notice.deleteOne();
        res.json({ message: 'Notice removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
