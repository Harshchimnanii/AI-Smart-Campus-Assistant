import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Users, BookOpen, Clock } from 'lucide-react';

const TeacherDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        classesToday: 0,
        totalStudents: 0,
        pendingGrading: 0
    });
    const [loading, setLoading] = useState(true);

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
        fetchStats();
    }, [user.token]);

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold dark:text-white">Teacher Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">Welcome back, Professor {user.name.split(' ')[0]}.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Subjects Mapped</p>
                            <h3 className="text-2xl font-bold dark:text-white">{loading ? '...' : stats.classesToday}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
                            <h3 className="text-2xl font-bold dark:text-white">{loading ? '...' : stats.totalStudents}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Assignments Posted</p>
                            <h3 className="text-2xl font-bold dark:text-white">{loading ? '...' : stats.pendingGrading}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4 dark:text-white">Upcoming Classes</h2>
                <div className="space-y-4">
                    {/* Placeholder for now until Timetable is fully implemented */}
                    <p className="text-gray-500 italic">No scheduled live classes found.</p>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
