import { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const AdminComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/complaints`, config);
            setComplaints(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${import.meta.env.VITE_API_URL}/api/complaints/${id}`, { status: newStatus }, config);

            // Optimistic Update
            setComplaints(complaints.map(c => c._id === id ? { ...c, status: newStatus } : c));
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
            case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'resolved': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div className="p-8 dark:text-white">Loading complaints...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-indigo-600" />
                Help Desk & Complaints
            </h1>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Issue</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {complaints.map((complaint) => (
                                <tr key={complaint._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-gray-900 dark:text-white">{complaint.student?.name || 'Unknown'}</div>
                                        <div className="text-xs text-gray-500">{complaint.student?.email}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase block mb-1">
                                            {complaint.category}
                                        </span>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1" title={complaint.message}>
                                            {complaint.message}
                                        </p>
                                    </td>
                                    <td className="p-4 text-sm text-gray-500 dark:text-gray-400">{complaint.location}</td>
                                    <td className="p-4 text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(complaint.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(complaint.status)}`}>
                                            {complaint.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <select
                                            className="text-sm border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                            value={complaint.status}
                                            onChange={(e) => handleStatusUpdate(complaint._id, e.target.value)}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            {complaints.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500 dark:text-gray-400">
                                        No complaints found. Good job!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminComplaints;
