const mongoose = require('mongoose');

const messMenuSchema = new mongoose.Schema({
    day: {
        type: String,
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        required: true,
        unique: true
    },
    breakfast: { type: String, default: "N/A" },
    lunch: { type: String, default: "N/A" },
    snacks: { type: String, default: "N/A" },
    dinner: { type: String, default: "N/A" }
}, { timestamps: true });

module.exports = mongoose.model('MessMenu', messMenuSchema);
