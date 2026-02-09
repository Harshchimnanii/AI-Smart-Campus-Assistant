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
    courseCode: {
        type: String, // e.g., BCSG 0002
        required: true
    },
    credits: {
        type: Number,
        required: true,
        default: 0
    },
    type: {
        type: String, // Theory (T) / Practical (P)
        enum: ['T', 'P', 'G', 'D', 'O'], // T=Theory, P=Practical, G=General Proficiency, D=Project, O=Open Elective
        default: 'T'
    },
    category: {
        type: String, // e.g., "Program Core", "Basic Sciences"
        default: 'Program Core'
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
