const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Notice = require('./models/Notice');
const Timetable = require('./models/Timetable');
const MessMenu = require('./models/MessMenu');
const Assignment = require('./models/Assignment');
const Complaint = require('./models/Complaint');

// Load env from server directory if running from root
dotenv.config({ path: './server/.env' });
// Fallback to default if not found (e.g. running from server dir)
if (!process.env.MONGODB_URI) dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Validating Database Connection...');

        // 1. Nuclear Option for Student User (Guaranteed Success)
        const targetEmail = 'student@test.com';
        const targetRoll = 'CSE-2023-001';

        console.log('Clearing potential conflicts...');
        await User.deleteMany({
            $or: [{ email: targetEmail }, { rollNumber: targetRoll }]
        });

        console.log(`Creating fresh ${targetEmail}...`);
        const student = await User.create({
            name: "Student User",
            email: targetEmail,
            password: "password123",
            role: "student",
            department: "CSE",
            year: "3rd",
            rollNumber: targetRoll
        });
        console.log('Created Student Profile');

        // Find an admin for "createdBy" fields
        let admin = await User.findOne({ role: 'admin' });
        if (!admin) admin = await User.findOne({ role: 'ceo' });

        // If still no admin, create one
        if (!admin) {
            console.log('No Admin found. Creating ceo@campus.ai...');
            admin = await User.create({
                name: "Campus CEO",
                email: "ceo@campus.ai",
                password: "ceo-secure-password",
                role: "ceo"
            });
        }
        const adminId = admin._id;

        // 2. Seed Notices
        await Notice.deleteMany({});
        await Notice.insertMany([
            {
                title: "Mid-Semester Exams Schedule",
                description: "Mid-sem exams for all 3rd year students start from Feb 20th. Syllabus covers Units 1-3.",
                department: "All",
                createdBy: adminId,
                date: new Date()
            },
            {
                title: "CSE Hackathon Registration",
                description: "Annual CodeFest registrations are open. Submit team details by Friday.",
                department: "CSE",
                createdBy: adminId,
                date: new Date()
            },
            {
                title: "Library Maintenance",
                description: "Central Library will be closed this Sunday for maintenance.",
                department: "All",
                createdBy: adminId,
                date: new Date()
            }
        ]);
        console.log('Seeded Notices');

        // 3. Seed Timetable (CSE - 3rd Year - Monday)
        await Timetable.deleteMany({});
        const timetableData = [];

        // Mock Schedule for Monday
        timetableData.push(
            { department: 'CSE', year: '3rd', day: 'Monday', subject: 'Operating Systems', faculty: 'Dr. Smith', room: 'C-201', startTime: '09:00', endTime: '10:00' },
            { department: 'CSE', year: '3rd', day: 'Monday', subject: 'DBMS', faculty: 'Prof. Johnson', room: 'Lab-3', startTime: '10:00', endTime: '12:00' },
            { department: 'CSE', year: '3rd', day: 'Monday', subject: 'Computer Networks', faculty: 'Dr. Alice', room: 'C-202', startTime: '13:00', endTime: '14:00' }
        );

        // Mock Schedule for Tuesday
        timetableData.push(
            { department: 'CSE', year: '3rd', day: 'Tuesday', subject: 'Algorithms', faculty: 'Dr. Brown', room: 'C-201', startTime: '09:00', endTime: '10:30' },
            { department: 'CSE', year: '3rd', day: 'Tuesday', subject: 'Web Development', faculty: 'Prof. Davis', room: 'Lab-1', startTime: '11:00', endTime: '13:00' }
        );

        // Mock Schedule for Wednesday
        timetableData.push(
            { department: 'CSE', year: '3rd', day: 'Wednesday', subject: 'AI & ML', faculty: 'Dr. Turing', room: 'C-205', startTime: '09:00', endTime: '11:00' },
            { department: 'CSE', year: '3rd', day: 'Wednesday', subject: 'Soft Skills', faculty: 'Ms. Emma', room: 'Auditorium', startTime: '12:00', endTime: '13:00' }
        );

        await Timetable.insertMany(timetableData);
        console.log('Seeded Timetable');

        // 4. Seed Mess Menu
        await MessMenu.deleteMany({});
        await MessMenu.insertMany([
            {
                day: "Monday",
                breakfast: "Poha, Tea, Milk",
                lunch: "Rajma Chawal, Roti, Salad",
                snacks: "Samosa, Tea",
                dinner: "Mix Veg, Dal Fry, Rice"
            },
            {
                day: "Tuesday",
                breakfast: "Idli Sambar, Coffee",
                lunch: "Paneer Butter Masala, Roti, Rice",
                snacks: "Biscuits, Tea",
                dinner: "Egg Curry / Malai Kofta"
            },
            {
                day: "Wednesday",
                breakfast: "Aloo Paratha, Curd",
                lunch: "Chole Bhature",
                snacks: "Bread Pakora",
                dinner: "Kadai Paneer, Naan"
            },
            {
                day: "Thursday",
                breakfast: "Upma, Chutney",
                lunch: "Kadi Pakora, Rice",
                snacks: "Maggi",
                dinner: "Dal Makhani, Jeera Rice"
            },
            {
                day: "Friday",
                breakfast: "Gobhi Paratha",
                lunch: "Veg Biryani, Raita",
                snacks: "Sandwich",
                dinner: "Fried Rice, Manchurian"
            },
            {
                day: "Saturday",
                breakfast: "Puri Bhaji",
                lunch: "Khichdi, Papad",
                snacks: "Fruit Salad",
                dinner: "Pizza / Pasta"
            },
            {
                day: "Sunday",
                breakfast: "Masala Dosa",
                lunch: "Special Thali",
                snacks: "Cake/Pastry",
                dinner: "Light Soup & Salad"
            }
        ]);
        console.log('Seeded Mess Menu');

        console.log('Smart Campus Data Seeded Successfully! 🌱');
        process.exit();

    } catch (error) {
        console.error('Error seeding data:', error);
        console.error(error.stack);
        process.exit(1);
    }
};

seedData();
