import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Users, BookOpen, Clock, Zap, Coffee, BarChart2, Check } from 'lucide-react';

const TeacherDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        classesToday: 0,
        totalStudents: 0,
        pendingGrading: 0
    });
    const [loading, setLoading] = useState(true);
    const [todaysSchedule, setTodaysSchedule] = useState([]);

    // Gen Z Features State
    const [zenMode, setZenMode] = useState(false);
    const [hypeCount, setHypeCount] = useState(0);
    const [pollActive, setPollActive] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/analytics/teacher/stats`, config);
                setStats(data);
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchSchedule = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/timetable/my-schedule`, config);

                const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                const today = new Date();
                const dayName = days[today.getDay()];

                // Filter for Today
                const todayClasses = data.filter(c => {
                    if (c.type === 'weekly') return c.day === dayName;
                    if (c.type === 'specific') {
                        const d = new Date(c.date);
                        return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
                    }
                    return false;
                }).sort((a, b) => a.startTime.localeCompare(b.startTime));

                setTodaysSchedule(todayClasses);
            } catch (error) {
                console.error("Error fetching schedule:", error);
            }
        };

        fetchStats();
        fetchSchedule();
    }, [user.token]);

    const handleHype = () => {
        setHypeCount(p => p + 1);
        if (hypeCount + 1 === 10) alert("MAXIMUM HYPE ACHIEVED 🚀🔥");
    };

    return (
        <div className={`space-y-6 animate-fade-in transition-all duration-500 ${zenMode ? 'grayscale opacity-90' : ''}`}>
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black dark:text-white tracking-tight">
                        {zenMode ? 'Zen Workspace 🌿' : 'Teacher HQ ⚡'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        Big W for showing up today, Professor {user.name.split(' ')[0]}.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setZenMode(!zenMode)}
                        className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${zenMode ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} dark:bg-gray-800 dark:text-gray-200`}
                    >
                        <Coffee className="h-5 w-5" />
                        {zenMode ? 'Deactivate Zen' : 'Zen Mode'}
                    </button>

                    {!zenMode && (
                        <button
                            onClick={handleHype}
                            className="px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform active:scale-95"
                        >
                            <Zap className="h-5 w-5 fill-current" />
                            Hype Class {hypeCount > 0 && `x${hypeCount}`}
                        </button>
                    )}
                </div>
            </div>

            {/* Main Stats */}
            {!zenMode && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/60 dark:bg-[#121212]/60 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-white/20 dark:border-white/10 hover:border-indigo-500 transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-500/20">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Classes Today</p>
                                <h3 className="text-2xl font-bold dark:text-white">{loading ? '...' : stats.classesToday}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/60 dark:bg-[#121212]/60 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-white/20 dark:border-white/10 hover:border-emerald-500 transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-emerald-500/20">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
                                <h3 className="text-2xl font-bold dark:text-white">{loading ? '...' : stats.totalStudents}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/60 dark:bg-[#121212]/60 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-white/20 dark:border-white/10 hover:border-amber-500 transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-amber-500/20">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Pending Grading</p>
                                <h3 className="text-2xl font-bold dark:text-white">{loading ? '...' : stats.pendingGrading}</h3>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Schedule Column */}
                <div className="lg:col-span-2 bg-white/60 dark:bg-[#121212]/60 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-white/20 dark:border-white/10">
                    <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                        Today's Grind 📅
                    </h2>
                    <div className="space-y-4">
                        {todaysSchedule.length > 0 ? (
                            todaysSchedule.map((cls) => (
                                <div key={cls._id} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 hover:bg-indigo-50 dark:hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xl border border-indigo-200 dark:border-indigo-500/30">
                                            {cls.subject.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white text-lg">{cls.subject}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{cls.department}-{cls.year} • {cls.room}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="inline-block px-3 py-1 bg-white dark:bg-white/5 rounded-lg shadow-sm border border-gray-100 dark:border-white/10">
                                            <p className="font-bold text-indigo-600 dark:text-indigo-400">{cls.startTime}</p>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">{cls.endTime}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-400 font-medium">No classes today? Massive W. Rest up.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Gen Z Feature: Quick Poll */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-purple-600/90 to-indigo-600/90 backdrop-blur-xl p-6 rounded-2xl text-white shadow-lg border border-white/20">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <BarChart2 className="h-5 w-5" /> Quick Poll
                            </h2>
                            {!pollActive && (
                                <button
                                    onClick={() => setPollActive(true)}
                                    className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors"
                                >
                                    Start New
                                </button>
                            )}
                        </div>

                        {!pollActive ? (
                            <p className="text-indigo-100 text-sm">Launch a quick vibe check or quiz for your students instantly.</p>
                        ) : (
                            <div className="space-y-3 animate-fade-in">
                                <p className="font-bold text-sm">"Understanding the assignment?"</p>
                                <div className="space-y-2">
                                    <button className="w-full text-left px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 text-sm font-medium transition-colors border border-white/10 flex justify-between">
                                        Yes, Chef! 👨‍🍳 <span>45%</span>
                                    </button>
                                    <button className="w-full text-left px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 text-sm font-medium transition-colors border border-white/10 flex justify-between">
                                        I'm Cooked 💀 <span>55%</span>
                                    </button>
                                </div>
                                <button
                                    onClick={() => setPollActive(false)}
                                    className="w-full py-2 bg-white text-indigo-600 rounded-lg font-bold text-sm mt-2"
                                >
                                    End Poll
                                </button>
                            </div>
                        )}
                    </div>

                    {!zenMode && (
                        <div className="bg-white/60 dark:bg-[#121212]/60 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-white/20 dark:border-white/10">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Priority Tasks</h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 p-3 bg-red-50/50 dark:bg-red-500/10 rounded-xl text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20">
                                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                                    <span className="text-sm font-semibold">Upload Marks (End Sem)</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50/50 dark:bg-white/5 rounded-xl text-gray-500 dark:text-gray-400 decoration-slice border border-gray-100 dark:border-white/10">
                                    <Check className="h-4 w-4" />
                                    <span className="text-sm line-through">Check Attendance</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
