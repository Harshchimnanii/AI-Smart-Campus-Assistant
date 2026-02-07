const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: {
        type: String,
        enum: ["hostel", "wifi", "classroom", "maintenance", "other"],
        required: true
    },
    message: { type: String, required: true },
    status: {
        type: String,
        enum: ["pending", "in-progress", "resolved"],
        default: "pending"
    },
    location: { type: String }, // Room 214, Block B
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
