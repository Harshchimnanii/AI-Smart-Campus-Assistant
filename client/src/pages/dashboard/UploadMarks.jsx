import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Save, Calculator } from 'lucide-react';

const UploadMarks = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filter State
    const [subject, setSubject] = useState('');
    const [semester, setSemester] = useState('3rd'); // Default

    // We assume this is a comprehensive upload now
    // const [examType, setExamType] = useState('Comprehensive'); 

    const [subjects, setSubjects] = useState([]);
    const [marksData, setMarksData] = useState({});
    // Structure: { studentId: { practical: 0, assignment: 0, midSem: 0, endSem: 0, attendance: 0 } }

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/class-map/my-classes`, config);
                setSubjects(data);
            } catch (error) {
                console.error("Error fetching subjects", error);
            }
        };
        fetchSubjects();
    }, [user.token]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };

            // Find department/year from the selected subject object in our list
            const selectedSubObj = subjects.find(s => s.subject === subject);
            let queryParams = `?subject=${encodeURIComponent(subject)}`;
            if (selectedSubObj) {
                queryParams += `&department=${selectedSubObj.department}&year=${selectedSubObj.year}`;
            }

            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/results/students-for-marks${queryParams}`, config);
            setStudents(data);

            // Initialize marks with auto-suggested attendance
            const initialMarks = {};
            data.forEach(s => {
                initialMarks[s._id] = {
                    practical: '',
                    assignment: '',
                    midSem: '',
                    endSem: '',
                    attendance: s.attendanceStats?.suggestedMarks || 0
                };
            });
            setMarksData(initialMarks);
        } catch (error) {
            console.error(error);
            alert("Error fetching students");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkChange = (studentId, field, value) => {
        setMarksData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value
            }
        }));
    };

    const calculateTotal = (studentId) => {
        const m = marksData[studentId];
        if (!m) return 0;
        return (Number(m.practical) || 0) +
            (Number(m.assignment) || 0) +
            (Number(m.midSem) || 0) +
            (Number(m.endSem) || 0) +
            (Number(m.attendance) || 0);
    };

    const handleSave = async () => {
        if (!subject) return alert("Please select a subject");

        const promises = Object.keys(marksData).map(async (studentId) => {
            const marksObj = marksData[studentId];

            // Only submit if at least one field is filled (or attendance is auto-filled)
            // Actually, we should probably check if the user intended to grade this student.
            // Let's assume if Total > 0 or they touched it.

            const total = calculateTotal(studentId);

            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            return axios.post(`${import.meta.env.VITE_API_URL}/api/results/add`, {
                studentId,
                subject,
                semester,
                examType: 'Comprehensive', // Storing as one big result
                components: {
                    practical: Number(marksObj.practical) || 0,
                    assignment: Number(marksObj.assignment) || 0,
                    midSem: Number(marksObj.midSem) || 0,
                    endSem: Number(marksObj.endSem) || 0,
                    attendance: Number(marksObj.attendance) || 0
                },
                totalMarks: 100
            }, config);
        });

        try {
            await Promise.all(promises);
            alert("Marks uploaded successfully!");
        } catch (error) {
            console.error(error);
            alert("Error uploading marks");
        }
    };

    return (
        <div className="space-y-6 animate-fade-in p-2 md:p-6">
            <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
                <Calculator className="h-8 w-8 text-indigo-600" />
                Upload Marks
            </h1>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                        <select
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">Select Subject</option>
                            {subjects.map(s => <option key={s._id} value={s.subject}>{s.subject} ({s.department}-{s.year})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester</label>
                        <select
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="1st">1st Sem</option>
                            <option value="2nd">2nd Sem</option>
                            <option value="3rd">3rd Sem</option>
                            <option value="4th">4th Sem</option>
                            <option value="5th">5th Sem</option>
                            <option value="6th">6th Sem</option>
                            <option value="7th">7th Sem</option>
                            <option value="8th">8th Sem</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={fetchStudents}
                            disabled={!subject}
                            className="w-full bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition disabled:bg-gray-400"
                        >
                            {loading ? 'Fetching...' : 'Fetch Students'}
                        </button>
                    </div>
                </div>

                {students.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3">Student</th>
                                    <th className="px-2 py-3 text-center">Practical (10)</th>
                                    <th className="px-2 py-3 text-center">Assign (5)</th>
                                    <th className="px-2 py-3 text-center">Mid-Sem (30)</th>
                                    <th className="px-2 py-3 text-center">End-Sem (50)</th>
                                    <th className="px-2 py-3 text-center">Attend (5)</th>
                                    <th className="px-4 py-3 text-center">Total (100)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {students.map(student => (
                                    <tr key={student._id}>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                                            <p className="text-xs text-gray-500">{student.rollNumber || 'N/A'}</p>
                                        </td>

                                        {['practical', 'assignment', 'midSem', 'endSem', 'attendance'].map(field => (
                                            <td key={field} className="px-2 py-3 text-center">
                                                <input
                                                    type="number"
                                                    value={marksData[student._id]?.[field] ?? ''}
                                                    onChange={(e) => handleMarkChange(student._id, field, e.target.value)}
                                                    className="w-16 p-1.5 text-center rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                    placeholder="0"
                                                />
                                            </td>
                                        ))}

                                        <td className="px-4 py-3 text-center font-bold text-indigo-600 dark:text-indigo-400">
                                            {calculateTotal(student._id)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200 dark:shadow-none"
                            >
                                <Save className="w-5 h-5" />
                                Save All Results
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadMarks;
