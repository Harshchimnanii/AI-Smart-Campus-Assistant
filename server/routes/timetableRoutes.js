const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');
const { protect, teacher } = require('../middleware/authMiddleware');

// @route   GET /api/timetable
// @desc    Get timetable for Student (Weekly + Specific for Today) OR Teacher (My Schedule)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        // If query param 'mode' is 'my-schedule' and user is teacher, return their schedule
        // But better to have separate route or handle here.

        const { department, year } = req.user;

        // 1. Fetch Weekly Schedule (Recurring)
        const weeklySchedule = await Timetable.find({
            department,
            year,
            type: 'weekly'
        }).sort({ day: 1, startTime: 1 });

        // 2. Fetch Specific Schedule for "Today" (or surrounding range? For now just return upcoming specific ones)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const specificSchedule = await Timetable.find({
            department,
            year,
            type: 'specific',
            date: { $gte: today }
        }).sort({ date: 1, startTime: 1 });

        // Combine logic could happen here or on frontend. 
        // For 'Academics' page (Weekly View), we mostly want the Weekly Schedule.
        // But for 'Dashboard' (Today's classes), we need specific.

        // Let's return all relevant data
        res.json({ weekly: weeklySchedule, specific: specificSchedule });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @route   GET /api/timetable/my-schedule
// @desc    Get schedule created by the logged-in teacher
// @access  Private (Teacher)
router.get('/my-schedule', protect, teacher, async (req, res) => {
    try {
        const schedule = await Timetable.find({ facultyId: req.user._id }).sort({ day: 1, startTime: 1 });
        res.json(schedule);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @route   POST /api/timetable/add
// @desc    Add a class to the schedule
// @access  Private (Teacher)
router.post('/add', protect, teacher, async (req, res) => {
    const { department, year, subject, day, startTime, endTime, room, type, date } = req.body;

    try {
        const newClass = await Timetable.create({
            department,
            year,
            subject,
            day, // "Monday", "Tuesday" etc.
            startTime,
            endTime,
            room,
            type: type || 'weekly',
            date: date ? new Date(date) : undefined,
            faculty: req.user.name, // Store name for display
            facultyId: req.user._id
        });
        res.status(201).json(newClass);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @route   DELETE /api/timetable/:id
// @desc    Delete a class from schedule
// @access  Private (Teacher)
router.delete('/:id', protect, teacher, async (req, res) => {
    try {
        const item = await Timetable.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Class not found' });

        if (item.facultyId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await item.deleteOne();
        res.json({ message: 'Class removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;
