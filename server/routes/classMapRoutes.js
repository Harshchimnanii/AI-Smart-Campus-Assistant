const express = require('express');
const router = express.Router();
const ClassMap = require('../models/ClassMap');
const { protect, teacher } = require('../middleware/authMiddleware');

// @desc    Add a class mapping for faculty
// @route   POST /api/class-map/add
// @access  Private (Teacher, Admin)
router.post('/add', protect, teacher, async (req, res) => {
    const { subject, department, year, section } = req.body;

    if (!subject || !department || !year) {
        return res.status(400).json({ message: 'Please provide subject, department, and year' });
    }

    try {
        // Check if mapping already exists
        const existingMap = await ClassMap.findOne({
            faculty: req.user._id,
            subject,
            department,
            year,
            section
        });

        if (existingMap) {
            return res.status(400).json({ message: 'Class mapping already exists' });
        }

        const newMap = await ClassMap.create({
            faculty: req.user._id,
            subject,
            department,
            year,
            section
        });

        res.status(201).json(newMap);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Get all class mappings for the logged-in faculty
// @route   GET /api/class-map/my-classes
// @access  Private (Teacher)
router.get('/my-classes', protect, teacher, async (req, res) => {
    try {
        const maps = await ClassMap.find({ faculty: req.user._id });
        res.json(maps);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Delete a class mapping
// @route   DELETE /api/class-map/:id
// @access  Private (Teacher)
router.delete('/:id', protect, teacher, async (req, res) => {
    try {
        const map = await ClassMap.findById(req.params.id);

        if (!map) {
            return res.status(404).json({ message: 'Mapping not found' });
        }

        // Ensure the user owns this mapping
        if (map.faculty.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await map.deleteOne();
        res.json({ message: 'Mapping removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;
