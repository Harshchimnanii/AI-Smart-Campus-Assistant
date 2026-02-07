import { Users, BookOpen, Clock } from 'lucide-react';

const TeacherDashboard = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold dark:text-white">Teacher Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">Welcome back, Professor.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Classes Today</p>
                            <h3 className="text-2xl font-bold dark:text-white">4</h3>
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
                            <h3 className="text-2xl font-bold dark:text-white">120</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Pending Grading</p>
                            <h3 className="text-2xl font-bold dark:text-white">15</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4 dark:text-white">Upcoming Classes</h2>
                <div className="space-y-4">
                    {['CS101 - Intro to CS', 'MATH201 - Calculus', 'PHY101 - Physics'].map((cls, i) => (
                        <div key={i} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <span className="font-medium dark:text-white">{cls}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">10:00 AM - 11:00 AM</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
