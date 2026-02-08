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
    faculty: { type: String }, // keeping string for legacy seed, but also adding ref
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    room: { type: String },
    startTime: { type: String, required: true }, // "10:00"
    endTime: { type: String, required: true },    // "11:00"

    // New Fields for Scheduling Type
    type: {
        type: String,
        enum: ['weekly', 'specific'],
        default: 'weekly'
    },
    date: {
        type: Date // Only if type is 'specific'
    }
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);
