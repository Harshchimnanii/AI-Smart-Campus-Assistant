const mongoose = require('mongoose');
const User = require('./models/User');
const Result = require('./models/Result');
const dotenv = require('dotenv');

dotenv.config();

const results = [
    { code: 'BCSC 0011', name: 'THEORY OF AUTOMATA & FORMAL LANGUAGES', grade: 'B+', gp: 7, credits: 4 },
    { code: 'BCSE 0055', name: 'SOFTWARE TESTING', grade: 'B+', gp: 7, credits: 3 },
    { code: 'BCSE 0101', name: 'DIGITAL IMAGE PROCESSING', grade: 'A', gp: 8, credits: 3 },
    { code: 'BCSE 1207', name: 'CLOUD COMPUTING', grade: 'B+', gp: 7, credits: 3 },
    { code: 'BCSE 1251', name: 'FULL STACK USING SCRIPTING TECHNOLOGIES', grade: 'B+', gp: 7, credits: 3 },
    { code: 'ONLO 0034', name: 'E-BUSINESS', grade: 'B', gp: 6, credits: 4 },
    { code: 'ONLO 1062', name: 'MANAGEMENT INFORMATION SYSTEM', grade: 'B+', gp: 7, credits: 4 },
    { code: 'BCSE 0131', name: 'DIGITAL IMAGE PROCESSING LAB', grade: 'A', gp: 8, credits: 1 },
    { code: 'BCSE 0234', name: 'CLOUD COMPUTING LAB', grade: 'A', gp: 8, credits: 1 },
    { code: 'BCSE 0281', name: 'FULL STACK USING SCRIPTING TECHNOLOGIES LAB', grade: 'A', gp: 8, credits: 1 },
    { code: 'BCSJ 0950', name: 'MINI PROJECT - I', grade: 'A', gp: 8, credits: 2 },
    { code: 'BCSJ 0991', name: 'INDUSTRIAL TRAINING', grade: 'O', gp: 10, credits: 2 },
    { code: 'BEGP 0001', name: 'GENERAL PROFICIENCY', grade: 'A+', gp: 9, credits: 1 },
    { code: 'BTDH 0303', name: 'SOFT SKILLS - III', grade: 'B+', gp: 7, credits: 4 },
    { code: 'MBAM 0001', name: 'BASIC COURSE IN ENTREPRENEURSHIP', grade: 'S', gp: 1, credits: 0 }
];

const seedResults = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Find User "Harsh"
        const user = await User.findOne({ name: { $regex: 'Harsh', $options: 'i' } });
        if (!user) {
            console.log("User 'Harsh' not found");
            process.exit(1);
        }

        // Find a dummy faculty (or user themselves if role allows, but let's just use user ID for now as faculty for simplicity if needed, or find an admin)
        // Schema requires 'faculty' ref 'User'.
        const faculty = await User.findOne({ role: 'teacher' }) || user; // Fallback to user if no teacher

        console.log(`Seeding results for: ${user.name} (${user._id})`);

        // Clear existing results for this semester to avoid dupes? 
        // Or just adding. Let's delete existing 5th sem for this user first.
        await Result.deleteMany({ student: user._id, semester: '5th' });
        console.log("Cleared existing 5th Sem results.");

        const resultDocs = results.map(r => ({
            student: user._id,
            subject: r.name,
            semester: '5th',
            courseCode: r.code,
            credits: r.credits,
            type: r.credits === 0 ? 'G' : (r.name.includes('LAB') ? 'P' : 'T'), // Guessing type
            category: 'Program Core',
            examType: 'End-Sem',
            marks: r.gp * 10, // Approximation
            totalMarks: 100,
            grade: r.grade,
            faculty: faculty._id
        }));

        await Result.insertMany(resultDocs);
        console.log(`✅ Inserted ${resultDocs.length} results.`);

        // Update User Academic Stats from Screenshot
        // CPI: 6.83, Cumulative Credits: 141
        user.academicStats = {
            cpi: 6.83,
            totalCredits: 141,
            cgpa: 6.83, // Assuming same
            sgpa: 7.33 // SPI
        };
        await user.save();
        console.log("✅ Updated User Academic Stats (CPI: 6.83, Credits: 141)");

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedResults();
