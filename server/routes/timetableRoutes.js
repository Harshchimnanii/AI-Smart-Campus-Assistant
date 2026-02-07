const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/timetable
// @desc    Get timetable for user's department/year
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const timetable = await Timetable.find({
            department: req.user.department,
            year: req.user.year
        }).sort({ day: 1, startTime: 1 });
        res.json(timetable);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;
