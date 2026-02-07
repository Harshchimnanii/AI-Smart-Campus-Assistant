const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Assignment = require('./models/Assignment');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

const seedAssignments = async () => {
    try {
        // Find an admin user to be the creator
        let admin = await User.findOne({ role: 'admin' });

        if (!admin) {
            console.log('No admin found! Creating default admin...');
            admin = await User.create({
                name: 'Admin User',
                email: 'admin@college.edu',
                password: 'adminpassword123',
                role: 'admin'
            });
            console.log('Admin created: admin@college.edu / adminpassword123');
        }

        const assignments = [
            {
                title: 'Database Management Systems - Lab 1',
                subject: 'DBMS',
                description: 'Design an ER diagram for a library management system.',
                dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
                createdBy: admin._id,
            },
            {
                title: 'Artificial Intelligence - Essay',
                subject: 'AI',
                description: 'Write a 1000-word essay on the ethical implications of AGI.',
                dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
                createdBy: admin._id,
            },
            {
                title: 'Data Structures - Tree Traversal',
                subject: 'DSA',
                description: 'Implement Inorder, Preorder, and Postorder traversal in C++.',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                createdBy: admin._id,
            },
        ];

        await Assignment.deleteMany(); // Clear existing
        await Assignment.insertMany(assignments);

        console.log('Assignments Seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedAssignments();
