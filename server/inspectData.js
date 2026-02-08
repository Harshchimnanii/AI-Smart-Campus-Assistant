const mongoose = require('mongoose');
const ClassMap = require('./models/ClassMap');
const Timetable = require('./models/Timetable');
require('dotenv').config();

const inspectData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        console.log('--- Assignments ---');
        const assignments = await require('./models/Assignment').find({});
        assignments.forEach(a => {
            console.log(`Title: ${a.title}, Dept: ${a.department}, Year: ${a.year}, ID: ${a._id}`);
        });

    } catch (error) {
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
};

inspectData();
