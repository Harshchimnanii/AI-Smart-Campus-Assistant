const mongoose = require('mongoose');
const dotenv = require('dotenv');
const MessMenu = require('./server/models/MessMenu');

dotenv.config({ path: './server/.env' });
if (!process.env.MONGODB_URI) dotenv.config();

const inspect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const menu = await MessMenu.find({});
        console.log('Mess Menu Count:', menu.length);
        console.log('Sample Day:', menu[0]?.day);
        console.log(JSON.stringify(menu, null, 2));
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
inspect();
