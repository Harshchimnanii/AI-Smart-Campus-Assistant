const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const user = await User.findOne({ name: 'Harsh Chimnani' });

        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        console.log(`Found User: ${user.name} (${user.email})`);

        // Update password
        user.password = '123456';
        user.visiblePassword = '123456'; // Manually setting this as the pre-save hook might currently only hash 'password' but we also want to ensure visiblePassword is set if my previous logic in routes/controller wasn't triggered. 
        // Wait, my previous change was in the *route* handler (controller), not the model hook.
        // So I must set `visiblePassword` explicitly here.
        // The pre-save hook in User.js hashes `password`.
        // So:
        // 1. user.password = '123456'
        // 2. user.visiblePassword = '123456'
        // 3. user.save() -> hook hashes `password`. `visiblePassword` remains '123456'.

        await user.save();
        console.log('Password updated to: 123456');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

resetPassword();
