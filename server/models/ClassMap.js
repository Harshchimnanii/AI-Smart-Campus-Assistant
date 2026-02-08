const mongoose = require('mongoose');

const classMapSchema = new mongoose.Schema({
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    section: {
        type: String // Optional: A, B, C etc.
    }
}, { timestamps: true });

// Ensure a faculty doesn't map the same class twice
classMapSchema.index({ faculty: 1, subject: 1, department: 1, year: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('ClassMap', classMapSchema);
