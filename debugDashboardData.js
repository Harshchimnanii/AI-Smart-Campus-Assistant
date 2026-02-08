const mongoose = require('mongoose');
const path = require('path');
const Attendance = require(path.join(__dirname, 'server/models/Attendance'));
const Assignment = require(path.join(__dirname, 'server/models/Assignment'));
const Submission = require(path.join(__dirname, 'server/models/Submission'));
const User = require(path.join(__dirname, 'server/models/User'));

require('dotenv').config({ path: path.join(__dirname, 'server/.env') });

const debugDashboardData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // 1. Get a sample student
        const student = await User.findOne({ role: 'student' }); // Get ANY student
        if (!student) {
            console.log('No students found!');
            return;
        }

        console.log(`\nDEBUGGING DATA FOR STUDENT: ${student.name} (${student._id})`);
        console.log(`Dept: ${student.department}, Year: ${student.year}`);

        console.log('\n--- ATTENDANCE ---');
        // Check raw attendance records
        const allAttendance = await Attendance.find({});
        console.log(`Total Attendance Docs in DB: ${allAttendance.length}`);

        const studentAttendance = await Attendance.find({ 'records.student': student._id });
        console.log(`Attendance Docs for this student: ${studentAttendance.length}`);

        if (studentAttendance.length > 0) {
            console.log('Sample Record Match:', JSON.stringify(studentAttendance[0].records.find(r => r.student.toString() === student._id.toString()), null, 2));
        } else {
            // Let's print one raw record to see structure
            if (allAttendance.length > 0) {
                console.log('Sample Raw Attendance Doc:', JSON.stringify(allAttendance[0], null, 2));
            }
        }

        console.log('\n--- ASSIGNMENTS ---');
        // Check assignments targeting this student
        const allAssignments = await Assignment.find({});
        console.log(`Total Assignments in DB: ${allAssignments.length}`);

        const targetedAssignments = await Assignment.find({
            department: student.department,
            year: student.year
        });
        console.log(`Assignments for ${student.department}-${student.year}: ${targetedAssignments.length}`);

        if (targetedAssignments.length > 0) {
            console.log('Sample Assignment:', JSON.stringify(targetedAssignments[0], null, 2));
        }

    } catch (error) {
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
};

debugDashboardData();
