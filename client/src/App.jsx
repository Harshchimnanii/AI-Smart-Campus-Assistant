import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import { ThemeProvider } from './context/ThemeContext';

// Dashboards
import Dashboard from './pages/dashboard/Dashboard';
import StudentDashboard from './pages/dashboard/StudentDashboard'; // Fallback if needed

// Core Modules
import Academics from './pages/dashboard/Academics';
import Attendance from './pages/dashboard/Attendance';
import Assignments from './pages/dashboard/Assignments';
import MyResults from './pages/dashboard/MyResults';
import ChatAssistant from './pages/dashboard/ChatAssistant';

// Smart Campus Modules
import Notices from './pages/dashboard/Notices';
import Complaints from './pages/dashboard/Complaints';
import MessMenu from './pages/dashboard/MessMenu';
import Profile from './pages/dashboard/Profile';

// Teacher/Admin Modules
import TakeAttendance from './pages/dashboard/TakeAttendance';
import UploadMarks from './pages/dashboard/UploadMarks';
import ClassMapping from './pages/dashboard/ClassMapping';
import ManageSchedule from './pages/dashboard/ManageSchedule';
import StudentHistory from './pages/dashboard/StudentHistory';
import UserManagement from './pages/dashboard/UserManagement';
import AdminNotices from './pages/dashboard/AdminNotices';
import AdminComplaints from './pages/dashboard/AdminComplaints';
import SectionManagement from './pages/dashboard/admin/SectionManagement';
import IDCardLogs from './pages/dashboard/admin/IDCardLogs';
import AdminLogin from './pages/AdminLogin';

// Placeholder
const Placeholder = ({ title }) => <div className="p-4"><h1 className="text-2xl font-bold dark:text-white">{title}</h1></div>;

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Routes - Global Layout Access */}
          <Route element={<ProtectedRoute allowedRoles={['student', 'teacher', 'admin', 'ceo', 'faculty']} />}>
            <Route element={<Layout />}>
              {/* Dashboard handled by dispatcher component */}
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Common Student/Faculty Routes */}
              <Route path="/dashboard/notices" element={<Notices />} />
              <Route path="/dashboard/complaints" element={<Complaints />} />
              <Route path="/dashboard/mess" element={<MessMenu />} />
              <Route path="/dashboard/chat" element={<ChatAssistant />} />
              <Route path="/dashboard/assignments" element={<Assignments />} />
              <Route path="/dashboard/profile" element={<Profile />} />

              {/* Student Specific */}
              <Route path="/dashboard/academics" element={<Academics />} />
              <Route path="/dashboard/results" element={<MyResults />} />
              <Route path="/dashboard/attendance" element={<Attendance />} />

              {/* Teacher Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={['teacher', 'admin', 'ceo', 'faculty']} />}>
                <Route path="/dashboard/attendance/take" element={<TakeAttendance />} />
                <Route path="/dashboard/classes" element={<ClassMapping />} />
                <Route path="/dashboard/schedule" element={<ManageSchedule />} />
                <Route path="/dashboard/marks/upload" element={<UploadMarks />} />
                <Route path="/dashboard/student-history" element={<StudentHistory />} />
                <Route path="/dashboard/admin/notices" element={<AdminNotices />} />
                <Route path="/dashboard/admin/complaints" element={<AdminComplaints />} />
              </Route>

              {/* Admin/CEO Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'ceo']} />}>
                <Route path="/dashboard/users" element={<UserManagement />} />
                <Route path="/dashboard/users" element={<UserManagement />} />
                <Route path="/dashboard/admin/sections" element={<SectionManagement />} />
                <Route path="/dashboard/admin/id-logs" element={<IDCardLogs />} />
              </Route>

              <Route path="/dashboard/career" element={<Placeholder title="Career Guide" />} />
            </Route>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
