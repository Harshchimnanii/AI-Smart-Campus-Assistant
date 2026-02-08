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
        type: Number,
        required: true
    },
    totalMarks: {
        type: Number,
        required: true
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
