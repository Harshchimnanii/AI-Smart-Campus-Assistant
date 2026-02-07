const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true,
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    fileUrl: {
        type: String,
        required: true, // In a real app, this would be the S3/Cloudinary URL
    },
    comments: {
        type: String,
    },
    grade: {
        type: String, // e.g., "A", "85/100"
    },
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
