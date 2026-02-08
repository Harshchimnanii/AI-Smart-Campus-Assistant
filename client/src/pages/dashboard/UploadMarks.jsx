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
    const [examType, setExamType] = useState('Mid-Sem');
    const [totalMarks, setTotalMarks] = useState(100);

    const [subjects, setSubjects] = useState([]);
    const [marksData, setMarksData] = useState({}); // { studentId: marks }

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
            // In a real app, we'd filter by the specific class selected (Dept/Year)
            // For now, fetching all students
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/users`, config);
            const studentList = data.filter(u => u.role === 'student');
            setStudents(studentList);

            // Initialize marks (or fetch existing if we wanted to support editing)
            const initialMarks = {};
            studentList.forEach(s => initialMarks[s._id] = '');
            setMarksData(initialMarks);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkChange = (studentId, value) => {
        setMarksData(prev => ({ ...prev, [studentId]: value }));
    };

    const handleSave = async () => {
        if (!subject) return alert("Please select a subject");

        const promises = Object.keys(marksData).map(async (studentId) => {
            const marks = marksData[studentId];
            if (marks === '' || isNaN(marks)) return; // Skip invalid

            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            return axios.post(`${import.meta.env.VITE_API_URL}/api/results/add`, {
                studentId,
                subject,
                semester,
                examType,
                marks: Number(marks),
                totalMarks: Number(totalMarks)
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                        <select
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">Select Subject</option>
                            {subjects.map(s => <option key={s._id} value={s.subject}>{s.subject} ({s.department})</option>)}
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exam Type</label>
                        <select
                            value={examType}
                            onChange={(e) => setExamType(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="Mid-Sem">Mid-Sem</option>
                            <option value="End-Sem">End-Sem</option>
                            <option value="Assignment">Assignment</option>
                            <option value="Practical">Practical</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={fetchStudents}
                            disabled={!subject}
                            className="w-full bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition disabled:bg-gray-400"
                        >
                            Fetch Students
                        </button>
                    </div>
                </div>

                {students.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3">Student Name</th>
                                    <th className="px-4 py-3">Roll No</th>
                                    <th className="px-4 py-3">Marks (Out of {totalMarks})</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {students.map(student => (
                                    <tr key={student._id}>
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{student.name}</td>
                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{student.rollNumber || 'N/A'}</td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="number"
                                                value={marksData[student._id] || ''}
                                                onChange={(e) => handleMarkChange(student._id, e.target.value)}
                                                className="w-24 p-1.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                max={totalMarks}
                                                min="0"
                                            />
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
                                Save Results
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadMarks;
