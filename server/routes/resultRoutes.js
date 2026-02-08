const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const User = require('../models/User'); // To verify students
const { protect, teacher } = require('../middleware/authMiddleware');

// @desc    Add marks for a student
// @route   POST /api/results/add
// @access  Private (Teacher)
router.post('/add', protect, teacher, async (req, res) => {
    const { studentId, subject, semester, examType, marks, totalMarks } = req.body;

    if (!studentId || !subject || !marks || !totalMarks) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        // Calculate Grade (Simplistic logic, can be enhanced)
        const percentage = (marks / totalMarks) * 100;
        let grade = 'F';
        if (percentage >= 90) grade = 'A+';
        else if (percentage >= 80) grade = 'A';
        else if (percentage >= 70) grade = 'B+';
        else if (percentage >= 60) grade = 'B';
        else if (percentage >= 50) grade = 'C';
        else if (percentage >= 40) grade = 'D';

        // Check if result already exists for this exam/subject
        const existingResult = await Result.findOne({
            student: studentId,
            subject,
            semester,
            examType
        });

        if (existingResult) {
            // Update existing
            existingResult.marks = marks;
            existingResult.totalMarks = totalMarks;
            existingResult.grade = grade;
            existingResult.faculty = req.user._id;
            await existingResult.save();
            return res.json(existingResult);
        }

        const result = await Result.create({
            student: studentId,
            subject,
            semester,
            examType,
            marks,
            totalMarks,
            grade,
            faculty: req.user._id
        });

        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Get results for a specific student (My Results)
// @route   GET /api/results/my-results
// @access  Private (Student)
router.get('/my-results', protect, async (req, res) => {
    try {
        const results = await Result.find({ student: req.user._id }).sort({ semester: -1, createdAt: -1 });
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Get results for a specific class/subject (Teacher View)
// @route   GET /api/results/class
// @access  Private (Teacher)
router.get('/class', protect, teacher, async (req, res) => {
    const { subject, semester, examType } = req.query;
    try {
        const query = {};
        if (subject) query.subject = subject;
        if (semester) query.semester = semester;
        if (examType) query.examType = examType;

        // Only show results added by this faculty? Or all? 
        // Typically a teacher wants to see the marks THEY assigned.
        // query.faculty = req.user._id; 

        const results = await Result.find(query).populate('student', 'name rollNumber');
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;
