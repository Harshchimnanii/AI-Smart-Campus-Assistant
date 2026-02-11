const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

console.log("Email Service Configured for:", process.env.EMAIL_USER || "Not Configured");

// Routes
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

app.use('/api/auth/', authRoutes);
app.use('/api/chat/', chatRoutes);
app.use('/api/assignments/', assignmentRoutes);
app.use('/api/attendance/', attendanceRoutes);
app.use('/api/notices/', require('./routes/noticeRoutes'));
app.use('/api/complaints/', require('./routes/complaintRoutes'));
app.use('/api/timetable/', require('./routes/timetableRoutes'));
app.use('/api/mess/', require('./routes/messRoutes'));
app.use('/api/users/', require('./routes/userRoutes'));
app.use('/api/class-map/', require('./routes/classMapRoutes'));
app.use('/api/results/', require('./routes/resultRoutes'));
app.use('/api/academics/', require('./routes/academicRoutes'));
app.use('/api/analytics/', require('./routes/analyticsRoutes'));
app.use('/api/idcard/', require('./routes/idCardRoutes'));

app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.send('AI Smart Campus Assistant API is running');
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log(`[DB] Connected to MongoDB at ${process.env.MONGODB_URI}`))
  .catch(err => {
    console.error('[DB] Connection Error Full:', err);
    console.error('[DB] Error Code:', err.code);
    console.error('[DB] Error CodeName:', err.codeName);
    console.log('HINT: Make sure your MongoDB service is running or check your connection string.');
  });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
