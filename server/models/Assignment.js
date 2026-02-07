const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    questionPaper: {
        type: String, // URL/Path to uploaded file
    },
    department: { type: String }, // e.g., CSE (Target audience)
    year: { type: String },       // e.g., 3rd (Target audience)
    dueDate: {
        type: Date,
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
