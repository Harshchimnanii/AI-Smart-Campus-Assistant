const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const multer = require('multer');
const path = require('path');
const { protect, admin, teacher } = require('../middleware/authMiddleware');

// Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5000000 }, // 5MB limit
});

// @route   GET /api/assignments
// @desc    Get all assignments
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const assignments = await Assignment.find().sort({ dueDate: 1 }).populate('createdBy', 'name');
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/assignments
// @desc    Create an assignment
// @access  Private (Teacher, Admin, CEO)
router.post('/', protect, teacher, upload.single('file'), async (req, res) => {
    const { title, subject, description, dueDate, department, year } = req.body;
    const questionPaper = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const assignment = await Assignment.create({
            title,
            subject,
            description,
            dueDate,
            department,
            year,
            questionPaper,
            createdBy: req.user._id,
        });
        res.status(201).json(assignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/assignments/:id
// @desc    Delete an assignment
// @access  Private (Teacher, Admin, CEO)
router.delete('/:id', protect, teacher, async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Check ownership (optional: admins/ceo can delete anyone's)
        if (req.user.role !== 'admin' && req.user.role !== 'ceo' && assignment.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this assignment' });
        }

        await assignment.deleteOne();
        res.json({ message: 'Assignment removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/assignments/:id/submit
// @desc    Submit an assignment
// @access  Private (Student)
router.post('/:id/submit', protect, upload.single('file'), async (req, res) => {
    const { comments } = req.body;
    const assignmentId = req.params.id;
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!fileUrl) {
        return res.status(400).json({ message: 'Please upload a file' });
    }

    try {
        // Check if already submitted
        const existingSubmission = await Submission.findOne({
            assignment: assignmentId,
            student: req.user._id,
        });

        if (existingSubmission) {
            return res.status(400).json({ message: 'You have already submitted this assignment' });
        }

        const submission = await Submission.create({
            assignment: assignmentId,
            student: req.user._id,
            fileUrl,
            comments,
        });

        res.status(201).json(submission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/assignments/my-submissions
// @desc    Get logged in user's submissions
// @access  Private
router.get('/my-submissions', protect, async (req, res) => {
    try {
        const submissions = await Submission.find({ student: req.user._id }).populate('assignment');
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
