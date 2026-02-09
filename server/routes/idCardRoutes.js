const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const IDCardLog = require('../models/IDCardLog');
const User = require('../models/User');

// @desc    Log ID Card Generation
// @route   POST /api/idcard/log
// @access  Private
router.post('/log', protect, async (req, res) => {
    try {
        const { studentId, detailsSnapshot } = req.body;

        const log = new IDCardLog({
            student: studentId,
            generatedBy: req.user._id,
            ipAddress: req.ip,
            detailsSnapshot
        });

        await log.save();
        res.status(201).json(log);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Get All ID Card Logs (CEO/Admin)
// @route   GET /api/idcard/logs
// @access  Private (Admin/CEO)
router.get('/logs', protect, admin, async (req, res) => {
    try {
        const logs = await IDCardLog.find({})
            .populate('student', 'name rollNumber')
            .populate('generatedBy', 'name role')
            .sort({ generatedAt: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;
