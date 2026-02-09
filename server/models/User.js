const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin', 'ceo'],
        default: 'student',
    },
    // Student Specific Fields
    rollNumber: {
        type: String,
        unique: true,
        sparse: true, // Allows null/unique for admins
    },
    section: String, // e.g., "A", "B"
    department: String,
    year: String,
    attendance: {
        type: Number,
        default: 0,
    },
    // --- Personal Details (GLAMS) ---
    regNo: { type: String, unique: true, sparse: true }, // GLA2023...
    univRollNo: { type: String, unique: true, sparse: true }, // 231500...
    fatherName: String,
    motherName: String,
    address: String,
    permanentAddress: String,
    dob: Date,
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    category: String, // GEN, OBC, SC/ST
    bloodGroup: String,
    admissionDate: Date,

    // --- Academic Metadata ---
    fileNo: String,
    libCode: String,
    placementStatus: { type: String, default: 'Not Placed Yet' },

    // --- Previous Education ---
    highSchool: {
        schoolName: String,
        board: String,
        percentage: Number,
        year: Number
    },
    intermediate: {
        schoolName: String,
        board: String,
        percentage: Number,
        year: Number
    },

    academicStats: {
        cpi: { type: Number, default: 0 },
        totalCredits: { type: Number, default: 0 },
        creditsEarned: { type: Number, default: 0 }, // Total credits earned so far
    },

    skills: [String],
    interests: [String],
    // Academic Records (The "Shame" & "Pride" Ledger)
    backlogs: [{
        subject: String,
        status: { type: String, enum: ['active', 'cleared'], default: 'active' },
        semester: String
    }],
    ufmHistory: [{
        date: { type: Date, default: Date.now },
        subject: String,
        reason: String,
        actionTaken: String
    }],
}, { timestamps: true });

// Password Hash Middleware
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare Password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
