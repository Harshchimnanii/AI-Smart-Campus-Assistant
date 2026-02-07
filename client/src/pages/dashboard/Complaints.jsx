import { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';

const Complaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComplaint, setNewComplaint] = useState({ category: 'hostel', message: '', location: '' });

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/complaints/my`, config);
            setComplaints(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = JSON.parse(localStorage.getItem('userInfo')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${import.meta.env.VITE_API_URL}/api/complaints`, newComplaint, config);
            setNewComplaint({ category: 'hostel', message: '', location: '' });
            fetchComplaints();
        } catch (error) {
            alert('Failed to submit complaint');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-900/50';
            case 'in-progress': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-900/50';
            case 'resolved': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-900/50';
            default: return 'text-gray-500 bg-gray-50 dark:bg-gray-700';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold dark:text-white">Complaints & Help Desk</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Form Section */}
                <div className="md:col-span-1">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-semibold mb-4 dark:text-white">New Complaint</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                                <select
                                    className="w-full p-2.5 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={newComplaint.category}
                                    onChange={e => setNewComplaint({ ...newComplaint, category: e.target.value })}
                                >
                                    <option value="hostel">Hostel Issue</option>
                                    <option value="wifi">WiFi / Internet</option>
                                    <option value="classroom">Classroom / Lab</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Room 204"
                                    required
                                    className="w-full p-2.5 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={newComplaint.location}
                                    onChange={e => setNewComplaint({ ...newComplaint, location: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <textarea
                                    rows="3"
                                    required
                                    className="w-full p-2.5 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={newComplaint.message}
                                    onChange={e => setNewComplaint({ ...newComplaint, message: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl transition-colors">
                                Submit Complaint
                            </button>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="md:col-span-2 space-y-4">
                    <h2 className="text-lg font-semibold dark:text-white">Your History</h2>
                    {loading ? <div className="dark:text-white">Loading...</div> : complaints.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed dark:border-gray-700">
                            <CheckCircle className="mx-auto h-10 w-10 text-gray-300" />
                            <p className="mt-2 text-gray-500">No complaints found</p>
                        </div>
                    ) : (
                        complaints.map((c) => (
                            <div key={c._id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-gray-900 dark:text-white capitalize">{c.category}</span>
                                        <span className="text-xs text-gray-400">• {c.location}</span>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">{c.message}</p>
                                    <p className="text-xs text-gray-400 mt-2">{new Date(c.createdAt).toLocaleDateString()}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${getStatusColor(c.status)}`}>
                                    {c.status}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Complaints;
