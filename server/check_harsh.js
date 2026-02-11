const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const checkHarsh = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ name: 'Harsh Chimnani' });
        if (user) {
            console.log(`✅ User found: ${user.name}, Email: ${user.email}`);
        } else {
            console.log('❌ User NOT found');
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkHarsh();
