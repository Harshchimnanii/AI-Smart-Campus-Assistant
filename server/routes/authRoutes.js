const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password, role, rollNumber, department, year } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            rollNumber,
            department,
            year,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/auth/login
// @desc    Auth user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(`[AUTH] Login Attempt: ${email}`);

    try {
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`[AUTH] Login Failed: User not found for email ${email}`);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            console.log(`[AUTH] Login Failed: Password mismatch for ${email}`);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        console.log(`[AUTH] Login Success: ${email} (${user.role})`);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });

    } catch (error) {
        console.error(`[AUTH] Login Error: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
});

const crypto = require('crypto');
const nodemailer = require('nodemailer');
const OTP = require('../models/OTP');

// Email Transport
const transporter = nodemailer.createTransport({
    service: 'gmail', // or use host/port
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// @route   POST /api/auth/send-otp
// @desc    Send OTP to Admin Email
// @access  Public
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role !== 'admin') return res.status(403).json({ message: 'Access denied. Admins only.' });

        // Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Save to DB
        await OTP.create({ email, otp: otpCode });

        // Send Email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Admin Login OTP - AI Smart Campus',
            text: `Your OTP for Admin login is: ${otpCode}. It expires in 5 minutes.`,
        };

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            await transporter.sendMail(mailOptions);
            console.log(`[OTP] Sent to ${email}`);
        } else {
            console.log(`[OTP] Mock Send to ${email}: ${otpCode}`);
            // For dev without creds, maybe return it in response? No, that's insecure.
            // But for this user, they need to see it to login if they haven't set up email.
            // I'll leave it in console logs which they can't easily see unless I use the browser tool... 
            // actually I'll just rely on them setting it up or checking the console logs if they are running it locally.
        }

        res.json({ message: 'OTP sent to your email' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error sending OTP' });
    }
});

// @route   POST /api/auth/login-otp
// @desc    Verify OTP and Login Admin
// @access  Public
router.post('/login-otp', async (req, res) => {
    const { email, otp } = req.body;
    try {
        // Find OTP
        const otpRecord = await OTP.findOne({ email, otp });
        if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Strict Role Check for Admin Login
        if (user.role !== 'admin' && user.role !== 'ceo') {
            return res.status(403).json({ message: 'Access denied. Authorized personnel only.' });
        }

        // Login Success
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });

        // Delete used OTP
        await OTP.deleteOne({ _id: otpRecord._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
