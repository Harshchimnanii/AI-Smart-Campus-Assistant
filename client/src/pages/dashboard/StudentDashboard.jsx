import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Calendar, TrendingUp, AlertCircle, CheckCircle, Info, Flame, Smile, Meh, Frown, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, subtext, icon: Icon, color }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start justify-between hover:shadow-md transition-shadow duration-200 group">
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:scale-110 transition-transform origin-left">{value}</h3>
            <p className={`text-xs font-medium mt-2 ${subtext.includes('+') ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                {subtext}
            </p>
        </div>
        <div className={`p-3 rounded-xl ${color} shadow-lg shadow-indigo-500/20 group-hover:rotate-12 transition-transform`}>
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
    const [nextClass, setNextClass] = useState(null);
    const [vibe, setVibe] = useState(null);

    // Gen Z Feature: Streak Calculation (Mock based on attendance > 75%)
    const attendanceVal = parseInt(stats.attendance) || 0;
    const streak = attendanceVal > 75 ? Math.floor(attendanceVal / 5) : 0;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = JSON.parse(localStorage.getItem('userInfo')).token;
                const config = { headers: { Authorization: `Bearer ${token}` } };

                const results = await Promise.allSettled([
                    axios.get(`${import.meta.env.VITE_API_URL}/api/notices`, config),
                    axios.get(`${import.meta.env.VITE_API_URL}/api/analytics/student/stats`, config),
                    axios.get(`${import.meta.env.VITE_API_URL}/api/timetable`, config)
                ]);

                if (results[0].status === 'fulfilled') setNotices(results[0].value.data.slice(0, 3));
                if (results[1].status === 'fulfilled') setStats(results[1].value.data);
                if (results[2].status === 'fulfilled') {
                    const timetable = results[2].value.data;
                    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                    const now = new Date();
                    const currentDay = days[now.getDay()];
                    const currentTime = now.getHours() * 60 + now.getMinutes();

                    const weeklyForToday = timetable.weekly ? timetable.weekly.filter(t => t.day === currentDay) : [];
                    const specificForToday = timetable.specific ? timetable.specific.filter(t => {
                        const d = new Date(t.date);
                        return d.getDate() === now.getDate() && d.getMonth() === now.getMonth();
                    }) : [];

                    const allClasses = [...weeklyForToday, ...specificForToday].sort((a, b) => a.startTime.localeCompare(b.startTime));

                    const upcoming = allClasses.find(cls => {
                        const [hours, minutes] = cls.endTime.split(':').map(Number);
                        return (hours * 60 + minutes) > currentTime;
                    });
                    setNextClass(upcoming || null);
                }
                setLoading(false);
            } catch (error) {
                console.error("Dashboard Fetch Error:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleVibeCheck = (selectedVibe) => {
        setVibe(selectedVibe);
        // In real app, save to DB
    };

    const handleSpillTea = () => {
        const tea = prompt("Spill the tea ☕ (Anonymous feedback):");
        if (tea) alert("Tea has been spilled. 🤫");
    };

    if (loading) return <div className="p-8 dark:text-white font-bold text-xl animate-pulse">Loading vibes...</div>;

    const statCards = [
        { title: 'Attendance', value: stats?.attendance || '0%', subtext: 'Keep it 100', icon: Calendar, color: 'bg-emerald-500' },
        { title: 'CGPA', value: stats?.cgpa || 'N/A', subtext: 'Academic Weapon', icon: TrendingUp, color: 'bg-indigo-500' },
        { title: 'Pending Tasks', value: stats?.pendingTasks || 0, subtext: 'Lock In', icon: AlertCircle, color: 'bg-amber-500' },
        { title: 'Completed', value: stats?.completedTasks || 0, subtext: 'Ez W', icon: CheckCircle, color: 'bg-blue-500' },
    ];

    return (
        <div className="space-y-8 animate-fade-in p-4">
            {/* Header with Streak */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        Wagwan, {user?.name?.split(' ')[0] || 'Fam'} 👋
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Let's get this bread.</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Gen Z Feature 1: Streak */}
                    <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-full font-bold flex items-center gap-2 border border-orange-200 dark:border-orange-700 animate-bounce-slow">
                        <Flame className="h-5 w-5 fill-current" />
                        <span>{streak} Day Streak</span>
                    </div>
                </div>
            </div>

            {/* Gen Z Feature 2: Vibe Check */}
            {!vibe && (
                <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-[1px] rounded-2xl">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Vibe Check 🌊</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">How we feeling today?</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => handleVibeCheck('slay')} className="text-2xl hover:scale-125 transition-transform p-2 bg-gray-100 dark:bg-gray-800 rounded-full">🤩</button>
                            <button onClick={() => handleVibeCheck('mid')} className="text-2xl hover:scale-125 transition-transform p-2 bg-gray-100 dark:bg-gray-800 rounded-full">😐</button>
                            <button onClick={() => handleVibeCheck('cooked')} className="text-2xl hover:scale-125 transition-transform p-2 bg-gray-100 dark:bg-gray-800 rounded-full">💀</button>
                        </div>
                    </div>
                </div>
            )}
            {vibe && (
                <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-4 rounded-xl text-center font-bold border border-green-200 dark:border-green-700">
                    Vibe recorded: {vibe === 'slay' ? 'Slaying ✨' : vibe === 'mid' ? 'It is what it is 🤷' : 'Cooked fr 💀'}
                </div>
            )}

            {/* Next Class Card (Featured) */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-1 shadow-lg transform hover:scale-[1.01] transition-transform duration-300">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 flex items-center gap-6 h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>

                    <div className="bg-indigo-100 dark:bg-indigo-900/50 p-4 rounded-2xl">
                        <Calendar className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
                            {nextClass ? 'Up Next' : 'No Cap, You Free'}
                        </p>
                        {nextClass ? (
                            <>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                                    {nextClass.subject}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-2 font-medium">
                                    <span>⏰ {nextClass.startTime} - {nextClass.endTime}</span>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    <span className="text-indigo-600 dark:text-indigo-400">📍 {nextClass.room}</span>
                                </p>
                            </>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Go touch grass or something.</p>
                        )}
                    </div>
                </div>
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
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            Latest Tea ☕ <span className="text-xs font-normal text-gray-500">(Notices)</span>
                        </h2>
                        <div className="space-y-4">
                            {notices.length > 0 ? notices.map((notice) => (
                                <div key={notice._id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-600 group">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-gray-800 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{notice.title}</h3>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-600">
                                            {new Date(notice.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                                        {notice.description}
                                    </p>
                                </div>
                            )) : <div className="text-gray-500 text-center py-4">No new tea spilled.</div>}
                        </div>
                    </div>
                </div>

                {/* Quick Actions / Upcoming */}
                <div className="space-y-6">
                    {/* Gen Z Feature 3: Confessions/Tea */}
                    <div onClick={handleSpillTea} className="cursor-pointer bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
                        <div className="flex items-center gap-3 mb-2">
                            <MessageCircle className="h-6 w-6" />
                            <h2 className="text-lg font-bold">Spill the Tea ☕</h2>
                        </div>
                        <p className="text-pink-100 text-sm mb-0 opacity-90">Got something to say? Drop an anonymous confession or feedback.</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Links</h2>
                        <div className="space-y-3">
                            <Link to="/dashboard/academic-results" className="block w-full text-center bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                Check Grades 📊
                            </Link>
                            <Link to="/dashboard/complaints" className="block w-full text-center bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                Official Complaints ⚖️
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
