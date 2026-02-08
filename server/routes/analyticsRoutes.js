const express = require('express');
const router = express.Router();
const { protect, teacher } = require('../middleware/authMiddleware');
const Attendance = require('../models/Attendance');
const Result = require('../models/Result');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const ClassMap = require('../models/ClassMap');
const User = require('../models/User');

// @route   GET /api/analytics/student/stats
// @desc    Get dashboard stats for logged-in student
// @access  Private (Student)
router.get('/student/stats', protect, async (req, res) => {
    try {
        const studentId = req.user._id;

        // 1. Attendance Calculation
        // Find all attendance records where this student is listed
        // We need to count total days attendance was taken for their subjects vs days they were Present
        // This is a bit complex depending on schema. 
        // Current Schema: Attendance -> records: [{ student: ID, status: 'Present'/'Absent' }]

        // Ensure studentId is an ObjectId
        const mongoose = require('mongoose');
        const studentObjectId = new mongoose.Types.ObjectId(studentId);

        const attendanceRecords = await Attendance.find({ 'records.student': studentObjectId });
        console.log(`[Stats] Student ${studentId} has ${attendanceRecords.length} attendance docs.`);

        let totalClasses = 0;
        let presentClasses = 0;

        attendanceRecords.forEach(record => {
            // Compare as strings to be safe
            const studentRecord = record.records.find(r => r.student.toString() === studentId.toString());
            if (studentRecord) {
                totalClasses++;
                if (studentRecord.status === 'Present') {
                    presentClasses++;
                }
            }
        });

        console.log(`[Stats] Student ${studentId}: Total ${totalClasses}, Present ${presentClasses}`);

        const attendancePercentage = totalClasses === 0 ? 0 : Math.round((presentClasses / totalClasses) * 100);

        // 2. Academic Performance (CGPA/Average Marks)
        const results = await Result.find({ student: studentId });
        let totalMarks = 0;
        let obtainedMarks = 0;

        results.forEach(r => {
            totalMarks += r.totalMarks;
            obtainedMarks += r.marks;
        });

        const performancePercentage = totalMarks === 0 ? 0 : Math.round((obtainedMarks / totalMarks) * 100);
        // Approximation: Divide percentage by 10 for a 10-point scale
        const cgpa = (performancePercentage / 10).toFixed(2);

        // 3. Pending Tasks
        // Fetch assignments for this student's department and year
        const assignments = await Assignment.find({
            department: req.user.department,
            year: req.user.year
        });

        const submissions = await Submission.find({ student: studentId });
        const submittedAssignmentIds = submissions.map(s => s.assignment.toString());

        // Filter assignments pending for this student (and due date in future)
        const pendingTasks = assignments.filter(a =>
            !submittedAssignmentIds.includes(a._id.toString()) &&
            new Date(a.dueDate) > new Date()
        ).length;

        const completedTasks = submissions.length;

        res.json({
            attendance: `${attendancePercentage}%`,
            cgpa: cgpa,
            pendingTasks,
            completedTasks
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/analytics/teacher/stats
// @desc    Get dashboard stats for logged-in teacher
// @access  Private (Teacher)
router.get('/teacher/stats', protect, teacher, async (req, res) => {
    try {
        const teacherId = req.user._id;

        // 1. Classes Today
        const today = new Date();
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayName = days[today.getDay()];

        // Count Weekly classes for today
        const weeklyClassesCount = await require('../models/Timetable').countDocuments({
            facultyId: teacherId,
            type: 'weekly',
            day: dayName
        });

        // Count Specific classes for today
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const specificClassesCount = await require('../models/Timetable').countDocuments({
            facultyId: teacherId,
            type: 'specific',
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        const totalClassesToday = weeklyClassesCount + specificClassesCount;

        // 2. Total Students
        // Get all unique students in these classes. 
        let studentCount = 0;

        // Efficient way: Get all Department-Year pairs
        const classMaps = await ClassMap.find({ faculty: teacherId });
        const classes = classMaps.map(c => ({ department: c.department, year: c.year, section: c.section }));

        if (classes.length > 0) {
            // Construct query with $or
            const conditions = classes.map(c => {
                const query = { role: 'student', department: c.department, year: c.year };
                if (c.section) query.section = c.section;
                return query;
            });

            studentCount = await User.countDocuments({ $or: conditions });
        }

        // 3. Pending Grading (Unchecked Submissions? Actually we don't track checked status on submissions yet)
        // Let's count Total Submissions received for assignments created by this teacher
        const assignments = await Assignment.find({ createdBy: teacherId });
        const assignmentIds = assignments.map(a => a._id);
        const submissionsCount = await Submission.countDocuments({ assignment: { $in: assignmentIds } });

        res.json({
            classesToday: totalClassesToday,
            totalStudents: studentCount,
            pendingGrading: submissionsCount // Using total submissions as a proxy for activity
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
