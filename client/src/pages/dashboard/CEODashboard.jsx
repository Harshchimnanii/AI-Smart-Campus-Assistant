import { Users, Server, Activity } from 'lucide-react';

const CEODashboard = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold dark:text-white">Executive Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">System Overview & Analytics</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                            <h3 className="text-2xl font-bold dark:text-white">2,543</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                            <Server className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">System Status</p>
                            <h3 className="text-2xl font-bold text-emerald-600">Operational</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-xl">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Active Sessions</p>
                            <h3 className="text-2xl font-bold dark:text-white">450</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CEODashboard;
