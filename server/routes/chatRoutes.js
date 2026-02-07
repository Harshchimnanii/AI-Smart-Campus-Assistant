const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();
const dotenv = require('dotenv');
const { protect } = require('../middleware/authMiddleware');

// Import Models for Context
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const Timetable = require('../models/Timetable');
const Notice = require('../models/Notice');
const MessMenu = require('../models/MessMenu');

dotenv.config();

// Initialize Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock-key');

// Helper: Fetch Context Data
const getSystemContext = async (userId) => {
    try {
        const user = await User.findById(userId).select('-password');
        if (!user) return "";

        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const today = days[new Date().getDay()];

        // 1. Fetch Timetable for Today
        const timetable = await Timetable.find({
            department: user.department,
            year: user.year,
            day: today
        }).sort('startTime');

        // 2. Fetch Pending Assignments
        const assignments = await Assignment.find({
            department: user.department,
            year: user.year,
            dueDate: { $gte: new Date() }
        }).limit(3);

        // 3. Fetch Latest Notices
        const notices = await Notice.find({
            $or: [{ department: "All" }, { department: user.department }]
        }).sort('-createdAt').limit(3);

        // 4. Fetch Mess Menu for Today
        const messMenu = await MessMenu.findOne({ day: today });

        // 5. Fetch Attendance Summary
        // Note: Real attendance calculation would go here based on Attendance model
        // For now, we simulate or fetch if available

        return `
        User Context:
        - Name: ${user.name}
        - Role: ${user.role}
        - Dept: ${user.department || 'N/A'}
        - Year: ${user.year || 'N/A'}
        - Current Time: ${new Date().toLocaleString()} (${today})

        Campus Data:
        - Today's Timetable: ${timetable.length ? JSON.stringify(timetable.map(t => `${t.startTime}-${t.endTime}: ${t.subject} (${t.room})`)) : "No classes today."}
        - Upcoming Assignments: ${assignments.length ? JSON.stringify(assignments.map(a => `${a.title} (Due: ${new Date(a.dueDate).toLocaleDateString()})`)) : "No pending assignments."}
        - Latest Notices: ${notices.length ? JSON.stringify(notices.map(n => `${n.title}: ${n.description}`)) : "No new notices."}
        - Mess Menu (${today}): ${messMenu ? JSON.stringify(messMenu) : "Menu not available."}
        `;
    } catch (error) {
        console.error("Error fetching context:", error);
        return "";
    }
};

// @route   POST /api/chat
// @desc    Chat with AI Assistant (Gemini)
// @access  Private
router.post('/', protect, async (req, res) => {
    const { message } = req.body;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_key') {
        return res.json({
            reply: `[GEMINI DEMO] I received: "${message}". Please configure GEMINI_API_KEY in .env on the server.`
        });
    }

    try {
        // 1. Get Context
        const userContext = await getSystemContext(req.user._id);

        // 2. Prepare Model
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{
                        text: `
                    You are a Smart Campus AI Assistant. 
                    You have access to the user's real-time data below. User this data to answer their questions accurately.
                    If the answer is found in the context, give a direct answer.
                    If asked about general academic topics, explain them simply.
                    Keep responses concise, friendly, and helpful. 
                    
                    ${userContext}
                    ` }],
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I have the user's real-time context (timetable, assignments, menu, notices) and I am ready to assist." }],
                },
            ],
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ message: error.message || 'Error communicating with AI Assistant' });
    }
});

module.exports = router;
