const mongoose = require('mongoose');
const Attendance = require('./server/models/Attendance');
const User = require('./server/models/User');
require('dotenv').config({ path: './server/.env' });

const debugAttendance = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const students = await User.find({ role: 'student' });
        console.log(`Found ${students.length} students`);

        if (students.length > 0) {
            const studentId = students[0]._id;
            console.log(`Checking attendance for student: ${students[0].name} (${studentId})`);

            const records = await Attendance.find({ 'records.student': studentId });
            console.log(`Found ${records.length} attendance records for this student.`);

            if (records.length > 0) {
                console.log('Sample Record:', JSON.stringify(records[0], null, 2));
            } else {
                // Check if ANY attendance exists
                const allAttendance = await Attendance.countDocuments();
                console.log(`Total Attendance Docs in DB: ${allAttendance}`);
            }
        }

    } catch (error) {
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
};

debugAttendance();
