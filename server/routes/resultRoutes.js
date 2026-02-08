const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const User = require('../models/User'); // To verify students
const { protect, teacher } = require('../middleware/authMiddleware');

// @desc    Add marks for a student
// @route   POST /api/results/add
// @access  Private (Teacher)
router.post('/add', protect, teacher, async (req, res) => {
    const { studentId, subject, semester, examType, components, totalMarks } = req.body;

    if (!studentId || !subject) {
        return res.status(400).json({ message: 'Please provide required fields' });
    }

    try {
        // Calculate Total Marks from components if provided
        let finalMarks = 0;
        if (components) {
            finalMarks = (Number(components.midSem) || 0) +
                (Number(components.endSem) || 0) +
                (Number(components.practical) || 0) +
                (Number(components.assignment) || 0) +
                (Number(components.attendance) || 0);
        } else {
            finalMarks = req.body.marks; // Fallback for old API usage
        }

        // Calculate Grade
        const percentage = (finalMarks / totalMarks) * 100;
        let grade = 'F';
        if (percentage >= 90) grade = 'A+';
        else if (percentage >= 80) grade = 'A';
        else if (percentage >= 70) grade = 'B+';
        else if (percentage >= 60) grade = 'B';
        else if (percentage >= 50) grade = 'C';
        else if (percentage >= 40) grade = 'D';

        // Check if result already exists
        const existingResult = await Result.findOne({
            student: studentId,
            subject,
            semester,
            examType // You might want to remove examType if it's always "Final" now, but keeping for compatibility
        });

        if (existingResult) {
            existingResult.marks = finalMarks;
            existingResult.totalMarks = totalMarks;
            existingResult.grade = grade;
            existingResult.components = components;
            existingResult.faculty = req.user._id;
            await existingResult.save();
            return res.json(existingResult);
        }

        const result = await Result.create({
            student: studentId,
            subject,
            semester,
            examType: examType || 'Comprehensive',
            marks: finalMarks,
            totalMarks,
            grade,
            components,
            faculty: req.user._id
        });

        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Get students with attendance for a specific subject
// @route   GET /api/results/students-for-marks
router.get('/students-for-marks', protect, teacher, async (req, res) => {
    const { subject, department, year } = req.query;

    try {
        // 1. Get Students
        // If Dept/Year provided, filter. Else get all (fallback)
        let query = { role: 'student' };
        if (department) query.department = department;
        if (year) query.year = year;

        const students = await User.find(query).select('name rollNumber department year');

        // 2. Calculate Attendance for each student in this Subject
        const Attendance = require('../models/Attendance');

        // Get all attendance records for this subject once to optimize (instead of per student)
        // This finds all docs for this subject. 
        const attendanceDocs = await Attendance.find({ subject: subject });

        const data = students.map(student => {
            let total = 0;
            let present = 0;

            attendanceDocs.forEach(doc => {
                const record = doc.records.find(r => r.student.toString() === student._id.toString());
                if (record) {
                    total++;
                    if (record.status === 'Present') present++;
                }
            });

            const percentage = total === 0 ? 0 : (present / total) * 100;
            // Calculate marks out of 5
            // Logic: Pure pro-rata? or Slab? 
            // Let's do Pro-Rata for now: (Percentage / 100) * 5
            // User can manually override if they want later, but this is auto-suggestion
            const attendanceMarks = Math.round((percentage / 100) * 5);

            return {
                ...student.toObject(),
                attendanceStats: {
                    total,
                    present,
                    percentage,
                    suggestedMarks: attendanceMarks
                }
            };
        });

        res.json(data);

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
