import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Save, CheckCircle } from 'lucide-react';

const TakeAttendance = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]); // Filtered students
    const [allStudents, setAllStudents] = useState([]); // All fetched students
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedClassMapId, setSelectedClassMapId] = useState(''); // Store ClassMap ID instead of just subject name
    const [subjects, setSubjects] = useState([]); // List of class maps
    const [attendance, setAttendance] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };

                // 1. Fetch Mapped Classes
                const { data: classMaps } = await axios.get(`${import.meta.env.VITE_API_URL}/api/class-map/my-classes`, config);
                setSubjects(classMaps.map(m => ({
                    id: m._id,
                    name: `${m.subject} (${m.department} - ${m.year}${m.section ? ` - Sec ${m.section}` : ''})`,
                    details: m
                })));

                // 2. Fetch All Students (Correct Endpoint)
                const { data: allUsers } = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, config);
                const studentList = allUsers.filter(u => u.role === 'student');
                setAllStudents(studentList);

                // Don't set 'students' yet, wait for selection
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user.token]);

    // Filter students when Subject/Class is selected
    useEffect(() => {
        if (!selectedClassMapId || allStudents.length === 0) {
            setStudents([]);
            return;
        }

        const selectedMap = subjects.find(s => s.id === selectedClassMapId)?.details;
        if (selectedMap) {
            const filtered = allStudents.filter(student => {
                const deptMatch = student.department === selectedMap.department;
                const yearMatch = student.year === selectedMap.year;
                // If class map has a section, strictly match it. If not, maybe show all sections? 
                // Usually if section is defined in map, we filter by it.
                const sectionMatch = selectedMap.section ? student.section === selectedMap.section : true;

                return deptMatch && yearMatch && sectionMatch;
            });

            setStudents(filtered);

            // Reset/Initialize attendance for these students
            const initialStatus = {};
            filtered.forEach(s => initialStatus[s._id] = 'Absent');
            setAttendance(initialStatus);
        }
    }, [selectedClassMapId, allStudents, subjects]);

    const handleStatusChange = (studentId, status) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedClassMapId) return alert('Please select a subject');

        const selectedMap = subjects.find(s => s.id === selectedClassMapId)?.details;

        const records = students.map(student => ({
            student: student._id,
            status: attendance[student._id] || 'Absent'
        }));

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${import.meta.env.VITE_API_URL}/api/attendance`, {
                date,
                subject: selectedMap.subject, // Send the subject name as backend expects
                classMapId: selectedClassMapId, // Optional: send ID if backend supports it for more context
                records
            }, config);
            alert('Attendance Marked Successfully');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error marking attendance');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in p-2 md:p-6">
            <h1 className="text-3xl font-bold dark:text-white flex items-center gap-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                Take Attendance
            </h1>

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
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject (Class)</label>
                        <select
                            value={selectedClassMapId}
                            onChange={(e) => setSelectedClassMapId(e.target.value)}
                            className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">Select Subject</option>
                            {subjects.length > 0 ? (
                                subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)
                            ) : (
                                <option disabled>No subjects mapped. Go to Manage Subjects.</option>
                            )}
                        </select>
                        {subjects.length === 0 && (
                            <p className="text-xs text-red-500 mt-1">
                                No classes found. Please map your subjects in "Manage Subjects".
                            </p>
                        )}
                    </div>
                </div>

                {selectedClassMapId && students.length === 0 && (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                        <p>No students found for this class ({subjects.find(s => s.id === selectedClassMapId)?.name}).</p>
                        <p className="text-sm mt-1">Check if students are assigned to this Department/Year/Section.</p>
                    </div>
                )}

                {students.length > 0 && (
                    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
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
                                    <tr key={student._id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{student.name}</td>
                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{student.rollNumber || 'N/A'}</td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {['Present', 'Absent', 'Late'].map(status => (
                                                    <button
                                                        key={status}
                                                        type="button"
                                                        onClick={() => handleStatusChange(student._id, status)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm
                                                            ${attendance[student._id] === status
                                                                ? status === 'Present' ? 'bg-green-600 text-white ring-2 ring-green-300 dark:ring-green-900'
                                                                    : status === 'Absent' ? 'bg-red-600 text-white ring-2 ring-red-300 dark:ring-red-900'
                                                                        : 'bg-yellow-500 text-white ring-2 ring-yellow-300 dark:ring-yellow-900'
                                                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
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
                )}

                {students.length > 0 && (
                    <div className="mt-6 flex justify-end">
                        <button type="submit" className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 dark:shadow-none font-medium">
                            <Save className="w-5 h-5" />
                            Save Attendance
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default TakeAttendance;
