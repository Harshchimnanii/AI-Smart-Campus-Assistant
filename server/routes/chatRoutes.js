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
const Result = require('../models/Result');

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

        // 5. Fetch Recent Results (Latest 5)
        const recentResults = await Result.find({ student: userId })
            .sort({ createdAt: -1 })
            .limit(10); // Fetch a few more to give good context

        // 6. Format Academic Stats
        const academicStats = user.academicStats || { cpi: 'N/A', totalCredits: 0 };
        const backlogs = user.backlogs || [];

        return `
        User Profile:
        - Name: ${user.name}
        - Roll Number: ${user.rollNumber || 'N/A'}
        - Email: ${user.email}
        - Phone: ${user.phone || 'N/A'}
        - Dept: ${user.department || 'N/A'}
        - Year: ${user.year || 'N/A'}
        - Section: ${user.section || 'N/A'}
        - Address: ${user.address || 'N/A'}

        Academic Status:
        - CPI: ${academicStats.cpi}
        - Total Credits Earned: ${academicStats.totalCredits}
        - Active Backlogs: ${backlogs.filter(b => b.status === 'active').length}
        - Backlog Subjects: ${backlogs.filter(b => b.status === 'active').map(b => b.subject).join(', ') || 'None'}

        Recent Results (Last few entries):
        ${recentResults.length > 0 ? recentResults.map(r => `- ${r.subject} (${r.semester}): Grade ${r.grade}, Credits ${r.credits}`).join('\n') : "No recent results found."}

        Campus Data (Today: ${new Date().toLocaleString()} - ${today}):
        - Timetable: ${timetable.length ? JSON.stringify(timetable.map(t => `${t.startTime}-${t.endTime}: ${t.subject} (${t.room})`)) : "No classes today."}
        - Assignments: ${assignments.length ? JSON.stringify(assignments.map(a => `${a.title} (Due: ${new Date(a.dueDate).toLocaleDateString()})`)) : "No pending assignments."}
        - Notices: ${notices.length ? JSON.stringify(notices.map(n => `${n.title}: ${n.description}`)) : "No new notices."}
        - Mess Menu: ${messMenu ? JSON.stringify(messMenu) : "Menu not available."}
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
                    You have access to the user's PERSONAL academic and campus data.
                    User this data to answer their questions accurately. 
                    
                    CRITICAL INSTRUCTIONS:
                    1. If the user asks about their marks, cpi, attendance, or schedule, USE THE CONTEXT PROVIDED.
                    2. If the user asks "What is my CPI?", look at the 'Academic Status' section.
                    3. If the user asks "What is my grade in X?", look at the 'Recent Results' section.
                    4. Be friendly but professional.
                    
                    ${userContext}
                    ` }],
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I have the user's personal academic and campus context. I am ready to answer specific questions about their performance, schedule, and profile." }],
                },
            ],
            generationConfig: {
                maxOutputTokens: 800,
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
