const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
    department: { type: String, required: true }, // CSE
    year: { type: String, required: true },       // 1st, 2nd
    day: {
        type: String,
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        required: true
    },
    subject: { type: String, required: true },
    faculty: { type: String },
    room: { type: String },
    startTime: { type: String, required: true }, // "10:00"
    endTime: { type: String, required: true }    // "11:00"
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);
