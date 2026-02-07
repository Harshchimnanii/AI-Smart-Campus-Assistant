import { useState } from 'react';
import axios from 'axios';
import { Search, AlertTriangle, BookOpen, User, CheckCircle, XCircle } from 'lucide-react';

const StudentHistory = () => {
    const [rollNumber, setRollNumber] = useState('');
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setStudent(null);
        try {
            const token = JSON.parse(localStorage.getItem('userInfo')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // Using existing user search or a new specialized route? 
            // For now, let's assume we can search by roll number via a query param on users route or similar.
            // Since we don't have a direct "search by roll" route, let's assume we filter client side or add a route.
            // Better: Add a quick route in userRoutes or just use the inspect logic pattern.
            // Actually, let's try to fetch all users and filter (not scalable but works for now) OR add a route.
            // Let's rely on a specific search endpoint. I will add this to userRoutes next.
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/search/${rollNumber}`, config);
            setStudent(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Student not found');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                <User className="h-6 w-6 text-indigo-600" />
                Student History & Records
            </h1>

            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Enter Roll Number (e.g., CS21001)"
                        className="flex-1 p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        required
                    />
                    <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                        {loading ? 'Searching...' : <><Search className="h-4 w-4" /> Search</>}
                    </button>
                </form>
                {error && <p className="text-red-500 mt-2 text-sm flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> {error}</p>}
            </div>

            {/* Results */}
            {student && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
                    {/* Profile Card */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                                {student.name[0]}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold dark:text-white">{student.name}</h2>
                                <p className="text-gray-500 dark:text-gray-400">{student.department.toUpperCase()} - {student.year} Year</p>
                                <p className="text-xs text-indigo-500 font-mono mt-1">{student.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Attendance</p>
                                <p className={`text-xl font-bold ${student.attendance < 75 ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {student.attendance}%
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                                <p className="text-xl font-bold dark:text-white">Active</p>
                            </div>
                        </div>
                    </div>

                    {/* Backlogs (The Shame Ledger) */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Academic Warning List (Backlogs)
                        </h3>
                        {student.backlogs && student.backlogs.length > 0 ? (
                            <div className="space-y-3">
                                {student.backlogs.map((log, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-lg">
                                        <div>
                                            <p className="font-semibold text-amber-800 dark:text-amber-400">{log.subject}</p>
                                            <p className="text-xs text-amber-600 dark:text-amber-500">Sem: {log.semester}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full font-bold ${log.status === 'active' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-600'}`}>
                                            {log.status.toUpperCase()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-emerald-500 opacity-50" />
                                No Active Backlogs. Clean Record.
                            </div>
                        )}
                    </div>

                    {/* UFM History (Serious Shame) */}
                    <div className="col-span-1 md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-500" />
                            Disciplinary Actions (UFM History)
                        </h3>
                        {student.ufmHistory && student.ufmHistory.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/50">
                                        <tr>
                                            <th className="px-4 py-3">Date</th>
                                            <th className="px-4 py-3">Subject</th>
                                            <th className="px-4 py-3">Reason</th>
                                            <th className="px-4 py-3">Action Taken</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {student.ufmHistory.map((ufm, i) => (
                                            <tr key={i} className="text-sm dark:text-gray-300">
                                                <td className="px-4 py-3 text-gray-500">{new Date(ufm.date).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 font-medium">{ufm.subject}</td>
                                                <td className="px-4 py-3 text-red-500">{ufm.reason}</td>
                                                <td className="px-4 py-3">{ufm.actionTaken}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-6 text-gray-400">
                                <p>No disciplinary records found.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentHistory;
