import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Calendar, User } from 'lucide-react';

const Notices = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/notices`, config);
            setNotices(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 dark:text-white">Loading notices...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                <Bell className="h-6 w-6 text-indigo-600" />
                Campus Notices
            </h1>

            <div className="grid gap-4">
                {notices.map((notice) => (
                    <div key={notice._id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{notice.title}</h2>
                            <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold">
                                {notice.department}
                            </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{notice.description}</p>

                        <div className="mt-4 flex items-center gap-4 text-xs text-gray-400 border-t border-gray-50 dark:border-gray-700 pt-3">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(notice.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                Admin
                            </div>
                        </div>
                    </div>
                ))}

                {notices.length === 0 && (
                    <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <Bell className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No notices found</h3>
                        <p className="text-gray-500 dark:text-gray-400">Check back later for updates from the administration.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notices;
