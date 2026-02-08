const mongoose = require('mongoose');
const ClassMap = require('./models/ClassMap');
const Timetable = require('./models/Timetable');
require('dotenv').config();

const cleanBadData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Delete ClassMaps with subject "0" or "O" or length <= 1
        const result = await ClassMap.deleteMany({ $or: [{ subject: "0" }, { subject: "O" }, { subject: { $regex: /^.{0,1}$/ } }] });
        console.log(`Deleted ${result.deletedCount} bad ClassMap entries`);

        // Delete Timetable entries
        const result2 = await Timetable.deleteMany({ $or: [{ subject: "0" }, { subject: "O" }, { subject: { $regex: /^.{0,1}$/ } }] });
        console.log(`Deleted ${result2.deletedCount} bad Timetable entries`);

    } catch (error) {
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
};

cleanBadData();
