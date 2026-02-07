const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    subject: {
        type: String, // e.g., "Maths", "CS101" - In a real app, this could be a ref to a Course model
        required: true,
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    records: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['Present', 'Absent', 'Late'],
            default: 'Absent',
        },
    }],
}, { timestamps: true });

// Compound index to ensure one attendance record per subject per day (optional, but good practice)
attendanceSchema.index({ date: 1, subject: 1 }, { unique: false });

module.exports = mongoose.model('Attendance', attendanceSchema);
