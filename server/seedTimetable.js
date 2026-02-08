const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Timetable = require('./models/Timetable');
const User = require('./models/User');

dotenv.config();

const timetable = [
    // CSE 3rd Year - Monday
    { department: "CSE", year: "3rd", day: "Monday", subject: "Compiler Design", faculty: "Dr. A. Sharma", room: "LT-1", startTime: "10:00", endTime: "11:00" },
    { department: "CSE", year: "3rd", day: "Monday", subject: "Web Technologies", faculty: "Prof. R. Gupta", room: "Lab-3", startTime: "11:00", endTime: "13:00" },
    { department: "CSE", year: "3rd", day: "Monday", subject: "Computer Networks", faculty: "Dr. K. Singh", room: "LT-1", startTime: "14:00", endTime: "15:00" },

    // CSE 3rd Year - Tuesday
    { department: "CSE", year: "3rd", day: "Tuesday", subject: "Computer Networks", faculty: "Dr. K. Singh", room: "LT-1", startTime: "10:00", endTime: "11:00" },
    { department: "CSE", year: "3rd", day: "Tuesday", subject: "Compiler Design", faculty: "Dr. A. Sharma", room: "LT-1", startTime: "11:00", endTime: "12:00" },
    { department: "CSE", year: "3rd", day: "Tuesday", subject: "AI & ML", faculty: "Dr. P. Verma", room: "LT-2", startTime: "14:00", endTime: "16:00" },

    // CSE 3rd Year - Wednesday
    { department: "CSE", year: "3rd", day: "Wednesday", subject: "Web Technologies", faculty: "Prof. R. Gupta", room: "Lab-3", startTime: "09:00", endTime: "11:00" },
    { department: "CSE", year: "3rd", day: "Wednesday", subject: "Soft Skills", faculty: "Ms. S. Kapoor", room: "Sem-Hall", startTime: "12:00", endTime: "13:00" },

    // CSE 3rd Year - Thursday
    { department: "CSE", year: "3rd", day: "Thursday", subject: "AI & ML", faculty: "Dr. P. Verma", room: "LT-2", startTime: "10:00", endTime: "11:00" },
    { department: "CSE", year: "3rd", day: "Thursday", subject: "Compiler Design Lab", faculty: "Dr. A. Sharma", room: "Lab-2", startTime: "14:00", endTime: "16:00" },

    // CSE 3rd Year - Friday
    { department: "CSE", year: "3rd", day: "Friday", subject: "Minor Project", faculty: "Dr. A. Sharma", room: "Lab-1", startTime: "09:00", endTime: "12:00" },
    { department: "CSE", year: "3rd", day: "Friday", subject: "Mentoring", faculty: "All Faculty", room: "Dept", startTime: "15:00", endTime: "16:00" }
];

const seedTimetable = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Clear existing timetable for simplicity or just add?
        // Let's clear to avoid duplicates for this demo
        await Timetable.deleteMany({});
        console.log('Old Timetable Cleared');

        await Timetable.insertMany(timetable);
        console.log('Timetable Imported! 📅');

        process.exit();
    } catch (error) {
        console.error('Error with data import', error);
        process.exit(1);
    }
};

seedTimetable();
