const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String, // Subject Name
        required: true
    },
    semester: {
        type: String, // e.g., "3rd"
        required: true
    },
    examType: {
        type: String, // e.g., "Mid-Sem", "End-Sem"
        required: true
    },
    marks: {
        type: Number, // Total Marks (Sum of components)
        required: true
    },
    totalMarks: {
        type: Number,
        required: true
    },
    components: {
        midSem: { type: Number, default: 0 },
        endSem: { type: Number, default: 0 },
        practical: { type: Number, default: 0 },
        assignment: { type: Number, default: 0 },
        attendance: { type: Number, default: 0 }
    },
    grade: {
        type: String, // e.g., "A", "B+"
        required: true
    },
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);
