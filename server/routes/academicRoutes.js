const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Result = require('../models/Result');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Generate Sections based on CPI/Performance
// @route   POST /api/academics/generate-sections
// @access  Private (Admin/CEO)
router.post('/generate-sections', protect, admin, async (req, res) => {
    const { department, year } = req.body;

    if (!department || !year) {
        return res.status(400).json({ message: 'Please provide department and year' });
    }

    try {
        // 1. Fetch all students of this batch
        const students = await User.find({ role: 'student', department, year });

        if (students.length === 0) {
            return res.status(404).json({ message: 'No students found for this batch' });
        }

        // 2. Calculate Score for each student
        // We will fetch all results for these students. 
        // Note: For a large number of students, this might be heavy. 
        // Optimization: Aggregation pipeline would be better, but doing JS logic for simplicity now.

        const studentScores = [];

        for (const student of students) {
            const results = await Result.find({ student: student._id });

            let totalMarksObtained = 0;
            let totalMaxMarks = 0;

            if (results.length > 0) {
                results.forEach(r => {
                    totalMarksObtained += r.marks;
                    totalMaxMarks += r.totalMarks;
                });
            }

            // If no results, score is 0
            const percentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0;

            studentScores.push({
                studentId: student._id,
                name: student.name,
                score: percentage
            });
        }

        // 3. Sort by Score Descending
        studentScores.sort((a, b) => b.score - a.score);

        // 4. Assign Sections (Batch of 50)
        const updates = [];
        const sections = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
        let currentSectionIndex = 0;
        let count = 0;

        for (const records of studentScores) {
            if (count >= 50) {
                currentSectionIndex++;
                count = 0;
            }
            // Fallback if we run out of sections logic (though unlikely for realistic batches)
            const sectionName = sections[currentSectionIndex] || `Section-${currentSectionIndex + 1}`;

            updates.push({
                updateOne: {
                    filter: { _id: records.studentId },
                    update: { $set: { section: sectionName } }
                }
            });
            count++;
        }

        // 5. Bulk Write Updates
        if (updates.length > 0) {
            await User.bulkWrite(updates);
        }

        res.json({
            message: 'Sections generated successfully',
            totalStudents: students.length,
            sectionsCreated: currentSectionIndex + 1,
            details: studentScores.map(s => ({
                name: s.name,
                score: s.score.toFixed(2),
                section: updates.find(u => u.updateOne.filter._id === s.studentId).updateOne.update.$set.section
            }))
        });

    } catch (error) {
        console.error("Error generating sections:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;
