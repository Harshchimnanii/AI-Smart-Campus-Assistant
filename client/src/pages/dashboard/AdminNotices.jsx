import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Plus, Bell } from 'lucide-react';

const AdminNotices = () => {
    const [notices, setNotices] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [department, setDepartment] = useState('All');
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

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const token = JSON.parse(localStorage.getItem('userInfo')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${import.meta.env.VITE_API_URL}/api/notices`, { title, description, department }, config);
            setTitle('');
            setDescription('');
            fetchNotices();
        } catch (error) {
            alert('Failed to create notice');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this notice?')) return;
        try {
            const token = JSON.parse(localStorage.getItem('userInfo')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/notices/${id}`, config);
            fetchNotices();
        } catch (error) {
            alert('Failed to delete notice');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                <Bell className="h-6 w-6 text-indigo-600" />
                Manage Notices
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-bold mb-4 dark:text-white">Post New Notice</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2.5 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <textarea
                                    rows="4"
                                    required
                                    className="w-full p-2.5 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Audience</label>
                                <select
                                    className="w-full p-2.5 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                >
                                    <option value="All">All Departments</option>
                                    <option value="CSE">CSE</option>
                                    <option value="ECE">ECE</option>
                                    <option value="MECH">MECH</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
                                <Plus className="h-5 w-5" />
                                Post Notice
                            </button>
                        </form>
                    </div>
                </div>

                {/* List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-bold dark:text-white">Active Notices</h2>
                    {loading ? <div className="dark:text-white">Loading...</div> : notices.map((notice) => (
                        <div key={notice._id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-start group">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{notice.title}</h3>
                                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded text-xs">
                                        {notice.department}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{notice.description}</p>
                                <p className="text-xs text-gray-400 mt-2">{new Date(notice.createdAt).toLocaleDateString()}</p>
                            </div>
                            <button
                                onClick={() => handleDelete(notice._id)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete Notice"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                    ))}
                    {notices.length === 0 && <p className="text-gray-500">No active notices.</p>}
                </div>
            </div>
        </div>
    );
};

export default AdminNotices;
