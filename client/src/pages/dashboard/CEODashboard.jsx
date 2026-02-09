import { Users, Server, Activity } from 'lucide-react';

const CEODashboard = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold dark:text-white">Executive Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">System Overview & Analytics</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/60 dark:bg-[#121212]/60 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-white/20 dark:border-white/10 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl shadow-lg shadow-blue-500/20">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                            <h3 className="text-2xl font-bold dark:text-white">2,543</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white/60 dark:bg-[#121212]/60 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-white/20 dark:border-white/10 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl shadow-lg shadow-purple-500/20">
                            <Server className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">System Status</p>
                            <h3 className="text-2xl font-bold text-emerald-600">Operational</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white/60 dark:bg-[#121212]/60 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-white/20 dark:border-white/10 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 rounded-xl shadow-lg shadow-pink-500/20">
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
