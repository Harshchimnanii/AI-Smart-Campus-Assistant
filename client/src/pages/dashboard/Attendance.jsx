import { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAuth } from '../../context/AuthContext';

const Attendance = () => {
    const { user } = useAuth();
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` }
                };
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/attendance/my-attendance`, config);
                setAttendanceData(data);
            } catch (error) {
                console.error('Error fetching attendance:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, [user.token]);

    // Process data for charts
    // Group by subject and calculate percentage
    const stats = {};
    attendanceData.forEach(record => {
        if (!stats[record.subject]) {
            stats[record.subject] = { total: 0, present: 0 };
        }
        stats[record.subject].total += 1;
        if (record.status === 'Present') {
            stats[record.subject].present += 1;
        }
    });

    const chartData = Object.keys(stats).map(subject => ({
        name: subject,
        value: Math.round((stats[subject].present / stats[subject].total) * 100)
    }));

    // Fallback Mock Data if no real data
    const displayData = chartData.length > 0 ? chartData : [
        { name: 'Mathematics', value: 85 },
        { name: 'Physics', value: 90 },
        { name: 'Computer Science', value: 95 },
        { name: 'English', value: 80 },
    ];

    const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold dark:text-white">Attendance</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats Chart */}
                <div className="col-span-1 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center">
                    <h2 className="text-xl font-semibold mb-4 dark:text-white">Overall Attendance</h2>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={displayData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {displayData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Detailed Logs */}
                <div className="col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 dark:text-white">Recent Logs</h2>
                    {loading ? (
                        <p className="dark:text-gray-400">Loading...</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 rounded-l-lg">Date</th>
                                        <th className="px-4 py-3">Subject</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 rounded-r-lg">Teacher</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {attendanceData.length > 0 ? (
                                        attendanceData.map((record) => (
                                            <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                                    {new Date(record.date).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{record.subject}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                                        ${record.status === 'Present' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                            record.status === 'Absent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                                                    {record.teacher || 'N/A'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4 text-gray-500 dark:text-gray-400">No attendance records found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Attendance;
