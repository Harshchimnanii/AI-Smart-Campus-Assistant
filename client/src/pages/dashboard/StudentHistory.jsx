import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, AlertTriangle, User, CheckCircle, XCircle, ChevronRight, Plus, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const StudentHistory = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [showUfmModal, setShowUfmModal] = useState(false);
    const [showBacklogModal, setShowBacklogModal] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    // Form Data
    const [ufmData, setUfmData] = useState({ subject: '', reason: '', actionTaken: '' });
    const [backlogData, setBacklogData] = useState({ subject: '', semester: '', status: 'active' });

    useEffect(() => {
        fetchStudents();
    }, [user.token]);

    const fetchStudents = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, config);
            const studentList = data.filter(u => u.role === 'student');
            setStudents(studentList);
            setFilteredStudents(studentList);
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const results = students.filter(student =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.rollNumber && student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredStudents(results);
    }, [searchTerm, students]);

    const handleSelectStudent = (student) => {
        setSelectedStudent(student);
    };

    // --- UFM Handlers ---
    const handleAddUfm = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/${selectedStudent._id}/ufm`, ufmData, config);

            // Update local state
            const updatedStudent = { ...selectedStudent, ufmHistory: data };
            setSelectedStudent(updatedStudent);

            // Update in main list too
            setStudents(students.map(s => s._id === updatedStudent._id ? updatedStudent : s));

            setShowUfmModal(false);
            setUfmData({ subject: '', reason: '', actionTaken: '' });
            alert('UFM Record Added');
        } catch (error) {
            console.error(error);
            alert('Failed to add UFM');
        } finally {
            setFormLoading(false);
        }
    };

    // --- Backlog Handlers ---
    const handleAddBacklog = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/${selectedStudent._id}/backlog`, backlogData, config);

            const updatedStudent = { ...selectedStudent, backlogs: data };
            setSelectedStudent(updatedStudent);
            setStudents(students.map(s => s._id === updatedStudent._id ? updatedStudent : s));

            setShowBacklogModal(false);
            setBacklogData({ subject: '', semester: '', status: 'active' });
            alert('Backlog Record Added');
        } catch (error) {
            console.error(error);
            alert('Failed to add Backlog');
        } finally {
            setFormLoading(false);
        }
    };

    const isTeacherOrAdmin = ['teacher', 'admin', 'ceo'].includes(user.role);

    return (
        <div className="space-y-6 animate-fade-in p-2 md:p-6 relative">
            <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                <User className="h-6 w-6 text-indigo-600" />
                Student History & Records
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Student List & Search */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by Name or Roll No..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 p-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden max-h-[600px] overflow-y-auto">
                        {loading ? (
                            <p className="p-6 text-center text-gray-500">Loading students...</p>
                        ) : filteredStudents.length === 0 ? (
                            <p className="p-6 text-center text-gray-500">No students found.</p>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredStudents.map(student => (
                                    <button
                                        key={student._id}
                                        onClick={() => handleSelectStudent(student)}
                                        className={`w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition text-left
                                            ${selectedStudent?._id === student._id ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-sm">
                                                {student.name[0]}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white text-sm">{student.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{student.rollNumber || 'No Roll No'}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className={`h-4 w-4 text-gray-400 max-sm:hidden ${selectedStudent?._id === student._id ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Detailed View */}
                <div className="lg:col-span-2">
                    {selectedStudent ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            {/* Profile Card */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                                        {selectedStudent.name[0]}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold dark:text-white">{selectedStudent.name}</h2>
                                        <p className="text-gray-500 dark:text-gray-400">{selectedStudent.department} - {selectedStudent.year} Year {selectedStudent.section && `(Sec ${selectedStudent.section})`}</p>
                                        <p className="text-xs text-indigo-500 font-mono mt-1">{selectedStudent.email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Attendance</p>
                                        <p className={`text-xl font-bold ${selectedStudent.attendance < 75 ? 'text-red-500' : 'text-emerald-500'}`}>
                                            {selectedStudent.attendance || 0}%
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                                        <p className="text-xl font-bold dark:text-white">Active</p>
                                    </div>
                                </div>
                            </div>

                            {/* Backlogs */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                                        Academic Warning List (Backlogs)
                                    </h3>
                                    {isTeacherOrAdmin && (
                                        <button
                                            onClick={() => setShowBacklogModal(true)}
                                            className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-lg hover:bg-amber-200 transition font-bold flex items-center gap-1"
                                        >
                                            <Plus className="h-3 w-3" /> Add Backlog
                                        </button>
                                    )}
                                </div>
                                {selectedStudent.backlogs && selectedStudent.backlogs.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedStudent.backlogs.map((log, i) => (
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

                            {/* UFM History */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                                        <XCircle className="h-5 w-5 text-red-500" />
                                        Disciplinary Actions (UFM History)
                                    </h3>
                                    {isTeacherOrAdmin && (
                                        <button
                                            onClick={() => setShowUfmModal(true)}
                                            className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 transition font-bold flex items-center gap-1"
                                        >
                                            <Plus className="h-3 w-3" /> Add UFM
                                        </button>
                                    )}
                                </div>
                                {selectedStudent.ufmHistory && selectedStudent.ufmHistory.length > 0 ? (
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
                                                {selectedStudent.ufmHistory.map((ufm, i) => (
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
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                            <User className="h-16 w-16 mb-4 opacity-20" />
                            <p className="text-lg font-medium">Select a student to view details</p>
                            <p className="text-sm">Search via name or roll number on the left.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Backlog Modal */}
            {showBacklogModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl p-6 shadow-xl animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold dark:text-white">Add Backlog Record</h3>
                            <button onClick={() => setShowBacklogModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleAddBacklog} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2.5 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={backlogData.subject}
                                    onChange={(e) => setBacklogData({ ...backlogData, subject: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester</label>
                                <select
                                    className="w-full p-2.5 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={backlogData.semester}
                                    onChange={(e) => setBacklogData({ ...backlogData, semester: e.target.value })}
                                >
                                    <option value="1st">1st</option>
                                    <option value="2nd">2nd</option>
                                    <option value="3rd">3rd</option>
                                    <option value="4th">4th</option>
                                    <option value="5th">5th</option>
                                    <option value="6th">6th</option>
                                    <option value="7th">7th</option>
                                    <option value="8th">8th</option>
                                </select>
                            </div>
                            <button type="submit" disabled={formLoading} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
                                {formLoading ? 'Adding...' : 'Add Backlog'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* UFM Modal */}
            {showUfmModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl p-6 shadow-xl animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold dark:text-white text-red-600">Add UFM Record</h3>
                            <button onClick={() => setShowUfmModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleAddUfm} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2.5 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={ufmData.subject}
                                    onChange={(e) => setUfmData({ ...ufmData, subject: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2.5 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={ufmData.reason}
                                    onChange={(e) => setUfmData({ ...ufmData, reason: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Action Taken</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2.5 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={ufmData.actionTaken}
                                    onChange={(e) => setUfmData({ ...ufmData, actionTaken: e.target.value })}
                                />
                            </div>
                            <button type="submit" disabled={formLoading} className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition">
                                {formLoading ? 'Adding...' : 'Add UFM Record'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentHistory;
