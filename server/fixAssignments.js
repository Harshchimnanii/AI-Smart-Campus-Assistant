const mongoose = require('mongoose');
const Assignment = require('./models/Assignment');
const User = require('./models/User');
require('dotenv').config();

const fixAssignments = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const assignments = await Assignment.find({});
        console.log(`Found ${assignments.length} assignments.`);

        let updatedCount = 0;

        // Find a fallback teacher
        const fallbackTeacher = await User.findOne({ role: 'teacher' });
        if (!fallbackTeacher) {
            console.log("No teacher found to re-assign.");
            return;
        }

        for (const assignment of assignments) {
            if (!assignment.department || !assignment.year || !assignment.createdBy) {
                // Check if creator exists, if not use fallback
                const creator = await User.findById(assignment.createdBy);

                if (!creator) {
                    assignment.createdBy = fallbackTeacher._id;
                    assignment.department = "CSE"; // Default for recovery
                    assignment.year = "3rd";
                } else {
                    assignment.department = creator.department || "CSE";
                    assignment.year = creator.year || "3rd";
                }

                await assignment.save();
                console.log(`Fixed '${assignment.title}': Assigned to ${fallbackTeacher.name}, Dept: ${assignment.department}`);
                updatedCount++;
            }
        }

        console.log(`Fixed ${updatedCount} assignments.`);

    } catch (error) {
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
};

fixAssignments();
