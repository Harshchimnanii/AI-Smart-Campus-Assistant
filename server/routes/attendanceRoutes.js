const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const { protect, teacher } = require('../middleware/authMiddleware');

// @route   POST /api/attendance
// @desc    Mark attendance for a class
// @access  Private (Teacher, Admin, CEO)
router.post('/', protect, teacher, async (req, res) => {
    const { date, subject, records } = req.body;

    try {
        // Check if attendance already exists for this date and subject
        // Optional: you might want to allow updating existing records instead
        const existingAttendance = await Attendance.findOne({
            date: new Date(date),
            subject,
            teacher: req.user._id
        });

        if (existingAttendance) {
            return res.status(400).json({ message: 'Attendance already marked for this session' });
        }

        const attendance = await Attendance.create({
            date,
            subject,
            teacher: req.user._id,
            records,
        });

        res.status(201).json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/attendance/my-attendance
// @desc    Get logged in student's attendance
// @access  Private
router.get('/my-attendance', protect, async (req, res) => {
    try {
        // Find all attendance records where the student is listed
        const attendanceRecords = await Attendance.find({
            'records.student': req.user._id
        }).sort({ date: -1 });

        // Transform data to show status for each subject/date
        const result = attendanceRecords.map(record => {
            const studentRecord = record.records.find(r => r.student.toString() === req.user._id.toString());
            return {
                _id: record._id,
                date: record.date,
                subject: record.subject,
                status: studentRecord ? studentRecord.status : 'N/A',
                teacher: record.teacher
            };
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
