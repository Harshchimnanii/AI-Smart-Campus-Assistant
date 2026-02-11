const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const checkHarsh = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        // Find by name OR email to catch Harsh Chimnani or similar
        const user = await User.findOne({
            $or: [
                { name: { $regex: 'Harsh', $options: 'i' } },
                { email: { $regex: 'harsh', $options: 'i' } }
            ]
        });

        if (user) {
            console.log(`✅ User found: ${user.name}`);
            console.log(`📧 Email: ${user.email}`);
            console.log(`📊 Academic Stats:`, user.academicStats);
            console.log(`🆔 ID: ${user._id}`);
            console.log(`🎓 Role: ${user.role}`);
        } else {
            console.log('❌ User NOT found with name/email containing "Harsh"');
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkHarsh();
