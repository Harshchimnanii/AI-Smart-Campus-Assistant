const mongoose = require('mongoose');
const Attendance = require('./models/Attendance');
const Assignment = require('./models/Assignment');
const Submission = require('./models/Submission');
const User = require('./models/User');
require('dotenv').config();

const debugDashboardData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // 1. Get a sample student
        const student = await User.findOne({ role: 'student' });
        if (!student) {
            console.log('No students found!');
            return;
        }

        console.log(`\nDEBUGGING DATA FOR STUDENT: ${student.name} (${student._id})`);
        console.log(`Dept: ${student.department}, Year: ${student.year}`);

        console.log('\n--- ATTENDANCE ---');
        // Check filtering by 'records.student'
        const studentAttendance = await Attendance.find({ 'records.student': student._id });
        console.log(`Attendance Docs matching query {'records.student': ID}: ${studentAttendance.length}`);

        if (studentAttendance.length > 0) {
            const record = studentAttendance[0];
            const studRec = record.records.find(r => r.student.toString() === student._id.toString());
            console.log('Sample Matching Record Status:', studRec ? studRec.status : 'Record found but subdoc missing?');
        } else {
            // Check if ANY attendance exists at all
            const count = await Attendance.countDocuments();
            console.log(`Total Attendance Docs in DB: ${count}`);
            if (count > 0) {
                const sample = await Attendance.findOne();
                console.log('Sample Raw Doc:', JSON.stringify(sample, null, 2));
            }
        }

        console.log('\n--- ASSIGNMENTS ---');
        const targetedAssignments = await Assignment.find({
            department: student.department,
            year: student.year
        });
        console.log(`Assignments targeting ${student.department}-${student.year}: ${targetedAssignments.length}`);

    } catch (error) {
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
};

debugDashboardData();
