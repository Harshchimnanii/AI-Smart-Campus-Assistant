import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Calendar, TrendingUp, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, subtext, icon: Icon, color }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start justify-between hover:shadow-md transition-shadow duration-200">
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
            <p className={`text-xs font-medium mt-2 ${subtext.includes('+') ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                {subtext}
            </p>
        </div>
        <div className={`p-3 rounded-xl ${color} shadow-lg shadow-indigo-500/20`}>
            <Icon className="h-6 w-6 text-white" />
        </div>
    </div>
);

const StudentDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        attendance: '0%',
        cgpa: 'N/A',
        pendingTasks: 0,
        completedTasks: 0
    });
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = JSON.parse(localStorage.getItem('userInfo')).token;
                const config = { headers: { Authorization: `Bearer ${token}` } };

                const [noticesRes, statsRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL}/api/notices`, config),
                    axios.get(`${import.meta.env.VITE_API_URL}/api/analytics/student/stats`, config)
                ]);

                setStats(statsRes.data);
                setNotices(noticesRes.data.slice(0, 3));
                setLoading(false);
            } catch (error) {
                console.error("Dashboard Fetch Error:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="p-8 dark:text-white">Loading dashboard...</div>;

    const statCards = [
        { title: 'Attendance', value: stats.attendance, subtext: 'Above requirement', icon: Calendar, color: 'bg-emerald-500' },
        { title: 'CGPA', value: stats.cgpa, subtext: '+0.2 from last sem', icon: TrendingUp, color: 'bg-indigo-500' },
        { title: 'Pending Tasks', value: stats.pendingTasks, subtext: 'Due soon', icon: AlertCircle, color: 'bg-amber-500' },
        { title: 'Completed', value: stats.completedTasks, subtext: 'Assignments', icon: CheckCircle, color: 'bg-blue-500' },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
                <p className="text-gray-500 dark:text-gray-400">Welcome back, {user?.name || 'Student'}. Here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity / Notices */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Notices</h2>
                        <div className="space-y-4">
                            {notices.length > 0 ? notices.map((notice) => (
                                <div key={notice._id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-600 group">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{notice.title}</h3>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-600">
                                            {new Date(notice.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                                        {notice.description}
                                    </p>
                                </div>
                            )) : <div className="text-gray-500 text-center py-4">No recent notices.</div>}
                        </div>
                    </div>
                </div>

                {/* Quick Actions / Upcoming */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
                        <h2 className="text-lg font-bold mb-2">Have a problem?</h2>
                        <p className="text-indigo-100 text-sm mb-4">Report hostel issues, wifi problems, or maintenance requests directly.</p>
                        <Link to="/dashboard/complaints" className="block w-full text-center bg-white text-indigo-600 font-semibold py-2 rounded-xl hover:bg-indigo-50 transition-colors">
                            File Complaint
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
