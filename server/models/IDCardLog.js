const mongoose = require('mongoose');

const idCardLogSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    generatedAt: {
        type: Date,
        default: Date.now
    },
    ipAddress: {
        type: String
    },
    detailsSnapshot: {
        name: String,
        rollNumber: String,
        course: String
    }
});

module.exports = mongoose.model('IDCardLog', idCardLogSchema);
