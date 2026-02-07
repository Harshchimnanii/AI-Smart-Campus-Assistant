const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   POST /api/complaints
// @desc    Create a complaint
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { category, message, location } = req.body;
        const complaint = new Complaint({
            student: req.user._id,
            category,
            message,
            location
        });
        const createdComplaint = await complaint.save();
        res.status(201).json(createdComplaint);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @route   GET /api/complaints/my
// @desc    Get my complaints
// @access  Private
router.get('/my', protect, async (req, res) => {
    try {
        const complaints = await Complaint.find({ student: req.user._id }).sort({ createdAt: -1 });
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/complaints
// @desc    Get all complaints (Admin)
// @access  Private (Admin)
router.get('/', protect, admin, async (req, res) => {
    try {
        const complaints = await Complaint.find({}).populate('student', 'name email').sort({ createdAt: -1 });
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/complaints/:id
// @desc    Update complaint status
// @access  Private (Admin/Teacher)
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const { status } = req.body;
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        complaint.status = status;
        await complaint.save();
        res.json(complaint);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
