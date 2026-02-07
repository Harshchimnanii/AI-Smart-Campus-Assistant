import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Save, CheckCircle } from 'lucide-react';

const TakeAttendance = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [subject, setSubject] = useState('');
    const [attendance, setAttendance] = useState({}); // { studentId: 'Present' | 'Absent' }

    // Mock subjects (Teacher should ideally fetch courses they teach)
    const subjects = ['Mathematics', 'Physics', 'Computer Science'];

    useEffect(() => {
        // Fetch all students
        const fetchStudents = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                // Using the CEO/Admin route for users but filtering for students client-side for now
                // Ideally backend should have a GetStudents route
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/users`, config);
                const studentList = data.filter(u => u.role === 'student');
                setStudents(studentList);

                // Initialize attendance state
                const initialStatus = {};
                studentList.forEach(s => initialStatus[s._id] = 'Absent');
                setAttendance(initialStatus);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [user.token]);

    const handleStatusChange = (studentId, status) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subject) return alert('Please select a subject');

        const records = Object.keys(attendance).map(studentId => ({
            student: studentId,
            status: attendance[studentId]
        }));

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${import.meta.env.VITE_API_URL}/api/attendance`, {
                date,
                subject,
                records
            }, config);
            alert('Attendance Marked Successfully');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error marking attendance');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold dark:text-white">Take Attendance</h1>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                        <select
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">Select Subject</option>
                            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3">Student Name</th>
                                <th className="px-4 py-3">Roll Number</th>
                                <th className="px-4 py-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {students.map(student => (
                                <tr key={student._id}>
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{student.name}</td>
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{student.rollNumber || 'N/A'}</td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {['Present', 'Absent', 'Late'].map(status => (
                                                <button
                                                    key={status}
                                                    type="button"
                                                    onClick={() => handleStatusChange(student._id, status)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                                                        ${attendance[student._id] === status
                                                            ? status === 'Present' ? 'bg-green-600 text-white' : status === 'Absent' ? 'bg-red-600 text-white' : 'bg-yellow-600 text-white'
                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                                        }`}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 flex justify-end">
                    <button type="submit" className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 dark:shadow-none">
                        <Save className="w-5 h-5" />
                        Save Attendance
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TakeAttendance;
