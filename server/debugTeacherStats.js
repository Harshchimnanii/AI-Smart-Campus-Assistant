const mongoose = require('mongoose');
const Timetable = require('./models/Timetable');
const User = require('./models/User');
const ClassMap = require('./models/ClassMap');
require('dotenv').config();

const debugTeacherStats = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // 1. Find the Teacher who is logged in (Assuming the one in screenshot)
        // We'll search for a teacher with name 'Harsh teacher' or just find ANY teacher with Timetable entries

        let teacher = await User.findOne({ name: 'Harsh teacher' });
        if (!teacher) {
            console.log('Teacher "Harsh teacher" not found. Finding any teacher with timetable...');
            const timetables = await Timetable.find();
            if (timetables.length > 0) {
                teacher = await User.findById(timetables[0].facultyId);
                console.log(`Found teacher from existing timetable: ${teacher.name} (${teacher._id})`);
            } else {
                console.log('No timetables found in DB.');
                return;
            }
        } else {
            console.log(`Found target teacher: ${teacher.name} (${teacher._id})`);
        }

        if (!teacher) return;

        console.log('\n--- TIMETABLE STATS ---');
        // Replicate logic from analyticsRoutes.js
        const today = new Date();
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayName = days[today.getDay()];
        console.log(`Server Day detected as: ${dayName}`);

        const count = await Timetable.countDocuments({
            facultyId: teacher._id,
            type: 'weekly',
            day: dayName
        });
        console.log(`Backend Query (weekly + ${dayName}): ${count}`);

        // Check raw entries for this teacher
        const raw = await Timetable.find({ facultyId: teacher._id });
        console.log(`Total Timetable entries for teacher: ${raw.length}`);
        if (raw.length > 0) {
            console.log('Sample Entry:', JSON.stringify(raw[0], null, 2));
            console.log(`Sample Day: ${raw[0].day}`);
            console.log(`Sample Type: ${raw[0].type}`);
            console.log(`Sample FacID Type: ${typeof raw[0].facultyId} vs Query: ${typeof teacher._id}`);
        }

        console.log('\n--- STUDENT STATS (Total Students) ---');
        const classMaps = await ClassMap.find({ faculty: teacher._id });
        console.log(`ClassMaps found: ${classMaps.length}`);

        if (classMaps.length > 0) {
            console.log('ClassMap Subjects:', classMaps.map(c => c.subject));
            const classes = classMaps.map(c => ({ department: c.department, year: c.year, section: c.section }));
            console.log('Mapping classes:', classes);

            const conditions = classes.map(c => {
                const query = { role: 'student', department: c.department, year: c.year };
                if (c.section) query.section = c.section;
                return query;
            });
            console.log('User Query Conditions: $or', JSON.stringify(conditions));

            const studentCount = await User.countDocuments({ $or: conditions });
            console.log(`Total Students Found: ${studentCount}`);
        } else {
            console.log('No ClassMaps -> 0 Students');
        }

    } catch (error) {
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
};

debugTeacherStats();
