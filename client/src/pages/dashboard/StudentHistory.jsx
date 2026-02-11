import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, AlertTriangle, User, CheckCircle, XCircle, ChevronRight, Plus, X, Edit2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import IDCard from '../../components/IDCard';

const StudentHistory = () => {
    const { user } = useAuth();
    const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'admin' || user?.role === 'ceo';
    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentResults, setStudentResults] = useState([]);
    const [resultsLoading, setResultsLoading] = useState(false);

    // Profile Editing
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileData, setProfileData] = useState({});
    const [formLoading, setFormLoading] = useState(false); // Added formLoading state

    // Modal States
    const [showUfmModal, setShowUfmModal] = useState(false);
    const [showBacklogModal, setShowBacklogModal] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [showIDCard, setShowIDCard] = useState(false);

    // Form Data
    const [ufmData, setUfmData] = useState({ subject: '', reason: '', actionTaken: '' });
    const [backlogData, setBacklogData] = useState({ subject: '', semester: '', status: 'active' });
    const [statsData, setStatsData] = useState({ cpi: 0, totalCredits: 0 });

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, config);
                const studentsOnly = data.filter(u => u.role === 'student');
                setStudents(studentsOnly);
                setFilteredStudents(studentsOnly);
            } catch (error) {
                console.error("Error fetching students:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user && user.token) {
            fetchStudents();
        }
    }, [user]);

    const handleOpenProfileModal = () => {
        try {
            if (selectedStudent) {
                setProfileData({
                    name: selectedStudent.name || '',
                    firstName: selectedStudent.name?.split(' ')[0] || '', // just in case
                    rollNumber: selectedStudent.rollNumber || '',
                    regNo: selectedStudent.regNo || '',
                    univRollNo: selectedStudent.univRollNo || '',
                    fatherName: selectedStudent.fatherName || '',
                    motherName: selectedStudent.motherName || '',
                    address: selectedStudent.address || '',
                    dob: selectedStudent.dob ? new Date(selectedStudent.dob).toISOString().split('T')[0] : '',
                    gender: selectedStudent.gender || 'Male',
                    category: selectedStudent.category || 'GEN',
                    bloodGroup: selectedStudent.bloodGroup || '',
                    section: selectedStudent.section || '',
                    fileNo: selectedStudent.fileNo || '',
                    libCode: selectedStudent.libCode || '',
                    mobile: selectedStudent.phone || '',
                    email: selectedStudent.email || '',
                    placementStatus: selectedStudent.placementStatus || 'Unplaced',
                    hsPercentage: selectedStudent.highSchool?.percentage || '',
                    interPercentage: selectedStudent.intermediate?.percentage || ''
                });
                setShowProfileModal(true);
            }
        } catch (error) {
            console.error("Error opening profile modal:", error);
            alert(`Error opening modal: ${error.message}`);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };

            const payload = {
                ...profileData,
                phone: profileData.mobile, // backend expects 'phone'
                highSchool: { ...selectedStudent.highSchool, percentage: profileData.hsPercentage },
                intermediate: { ...selectedStudent.intermediate, percentage: profileData.interPercentage }
            };

            const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${selectedStudent._id}/profile`, payload, config);

            // Update local state
            setSelectedStudent(data);
            setStudents(students.map(s => s._id === data._id ? data : s));

            setShowProfileModal(false);
            alert('Profile Updated Successfully');
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || error.message || 'Unknown error';
            alert(`Failed to update profile: ${msg}`);
        } finally {
            setFormLoading(false);
        }
    };

    const handleSelectStudent = async (student) => {
        setSelectedStudent(student);
        // Fetch Results
        setResultsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/results/student/${student._id}`, config);
            setStudentResults(data);
        } catch (error) {
            console.error("Error fetching results:", error);
            setStudentResults([]);
        } finally {
            setResultsLoading(false);
        }
    };

    const handleOpenStatsModal = () => {
        if (selectedStudent && selectedStudent.academicStats) {
            setStatsData({
                cpi: selectedStudent.academicStats.cpi || 0,
                totalCredits: selectedStudent.academicStats.totalCredits || 0
            });
        }
        setShowStatsModal(true);
    };

    const handleUpdateStats = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${selectedStudent._id}/academic-stats`, statsData, config);

            // Update local state
            setSelectedStudent(prev => ({ ...prev, academicStats: data.academicStats }));
            setStudents(students.map(s => s._id === data._id ? { ...s, academicStats: data.academicStats } : s));

            setShowStatsModal(false);
            alert('Academic Stats Updated');
        } catch (error) {
            console.error(error);
            alert('Failed to update stats');
        } finally {
            setFormLoading(false);
        }
    };

    const handleAddBacklog = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/${selectedStudent._id}/backlog`, backlogData, config);

            setSelectedStudent(data);
            setShowBacklogModal(false);
            setBacklogData({ subject: '', semester: '', status: 'active' });
            alert('Backlog Added');
        } catch (error) {
            console.error(error);
            alert('Failed to add backlog');
        } finally {
            setFormLoading(false);
        }
    };

    const handleAddUfm = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/${selectedStudent._id}/ufm`, ufmData, config);

            setSelectedStudent(data);
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

    // Helper to group results by semester
    const groupedResults = studentResults.reduce((acc, result) => {
        const sem = result.semester;
        if (!acc[sem]) acc[sem] = [];
        acc[sem].push(result);
        return acc;
    }, {});

    // ... existing handlers ...

    return (
        <div className="space-y-6 p-2 md:p-6 relative">
            <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                <User className="h-6 w-6 text-indigo-600" />
                Student History & Records
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Column: Student List & Search (Reduced width) */}
                <div className={`lg:col-span-1 space-y-4 ${selectedStudent ? 'hidden lg:block' : 'block'}`}>
                    {/* ... Search & List (Keep existing code) ... */}
                    <div className="bg-white/60 dark:bg-[#121212]/60 backdrop-blur-xl p-4 rounded-2xl shadow-sm border border-white/20 dark:border-white/10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black/30 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none placeholder:text-gray-500"
                            />
                        </div>
                    </div>

                    <div className="bg-white/60 dark:bg-[#121212]/60 backdrop-blur-xl rounded-2xl shadow-sm border border-white/20 dark:border-white/10 overflow-hidden max-h-[600px] overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <p className="p-6 text-center text-gray-500">Loading...</p>
                        ) : filteredStudents.length === 0 ? (
                            <p className="p-6 text-center text-gray-500">No students.</p>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-white/5">
                                {filteredStudents.map(student => (
                                    <button
                                        key={student._id}
                                        onClick={() => handleSelectStudent(student)}
                                        className={`w-full p-3 flex items-center justify-between hover:bg-indigo-50/50 dark:hover:bg-white/5 transition text-left
                                            ${selectedStudent?._id === student._id ? 'bg-indigo-50 dark:bg-indigo-500/20' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-500/30">
                                                {student.name[0]}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="font-semibold text-gray-900 dark:text-white text-xs truncate">{student.name}</p>
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400">{student.rollNumber || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Detailed View (Expanded width) */}
                <div className={`lg:col-span-3 ${!selectedStudent ? 'hidden lg:block' : 'block'}`}>
                    {selectedStudent ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            {/* Mobile Back Button */}
                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="lg:hidden flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition mb-2"
                            >
                                <ChevronRight className="h-4 w-4 rotate-180" /> Back to List
                            </button>
                            {/* Detailed Profile Card (GLAMS Style) */}
                            <div className="bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-white/20 dark:border-white/10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <User className="h-32 w-32" />
                                </div>

                                <div className="flex flex-col md:flex-row gap-6 relative z-10">
                                    <div className="flex flex-col items-center">
                                        <div className="h-24 w-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-indigo-500/30 mb-3">
                                            {selectedStudent.name[0]}
                                        </div>
                                        <div className="text-center">
                                            <h2 className="text-xl font-bold dark:text-white">{selectedStudent.name}</h2>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{selectedStudent.rollNumber}</p>
                                        </div>

                                        {/* Action Buttons for Mobile (Moved below avatar) */}
                                        {isTeacherOrAdmin && (
                                            <div className="flex gap-2 mt-4 md:hidden">
                                                <button
                                                    onClick={handleOpenProfileModal}
                                                    className="p-2 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 rounded-lg border border-indigo-200 dark:border-indigo-500/30"
                                                    title="Edit Full Profile"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => setShowIDCard(true)}
                                                    className="p-2 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-500/20 font-bold text-xs"
                                                    title="Generate ID"
                                                >
                                                    ID
                                                </button>
                                                <button
                                                    onClick={handleOpenStatsModal}
                                                    className="p-2 bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 rounded-lg border border-purple-200 dark:border-purple-500/20 font-bold text-xs"
                                                    title="Edit CPI"
                                                >
                                                    CPI
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm border-l border-gray-200 dark:border-white/10 md:pl-6">
                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wider">Course</p>
                                                <p className="font-semibold dark:text-white">B.Tech - {selectedStudent.department}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wider">Univ Roll No</p>
                                                <p className="font-semibold dark:text-white">{selectedStudent.univRollNo || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wider">Father's Name</p>
                                                <p className="font-semibold dark:text-white">{selectedStudent.fatherName || 'N/A'}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wider">Semester</p>
                                                <p className="font-semibold dark:text-white">{selectedStudent.year} Year ({(parseInt(selectedStudent.year) * 2) || 'N/A'} Sem)</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wider">Reg. No</p>
                                                <p className="font-semibold dark:text-white">{selectedStudent.regNo || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wider">Mobile</p>
                                                <p className="font-semibold dark:text-white">N/A</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wider">Section</p>
                                                <p className="font-semibold dark:text-white">{selectedStudent.section || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wider">Status</p>
                                                <p className="font-semibold text-emerald-500">Regular</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wider">Lib Code</p>
                                                <p className="font-semibold dark:text-white">{selectedStudent.libCode || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Address</p>
                                        <p className="text-sm dark:text-gray-300">{selectedStudent.address || 'Address not updated'}</p>
                                    </div>
                                    {isTeacherOrAdmin && (
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 text-red-500">Student Password</p>
                                            <p className="font-mono font-bold dark:text-white bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded inline-block text-red-600 dark:text-red-400">
                                                {selectedStudent.visiblePassword || 'Not Available'}
                                            </p>
                                        </div>
                                    )}
                                    <div className="flex gap-4">
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">10th %</p>
                                            <p className="font-semibold dark:text-white">{selectedStudent.highSchool?.percentage || 'N/A'}%</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">12th %</p>
                                            <p className="font-semibold dark:text-white">{selectedStudent.intermediate?.percentage || 'N/A'}%</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Blood Group</p>
                                            <p className="font-semibold dark:text-white">{selectedStudent.bloodGroup || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {isTeacherOrAdmin && (
                                    <div className="hidden md:flex absolute top-4 right-4 gap-2">
                                        <button
                                            onClick={handleOpenProfileModal}
                                            className="p-2 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/30 transition border border-indigo-200 dark:border-indigo-500/30"
                                            title="Edit Full Profile"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setShowIDCard(true)}
                                            className="p-2 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/30 transition border border-blue-200 dark:border-blue-500/30"
                                            title="Generate ID Card"
                                        >
                                            <span className="font-bold text-xs">ID</span>
                                        </button>
                                        <button
                                            onClick={handleOpenStatsModal}
                                            className="p-2 bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-500/30 transition border border-purple-200 dark:border-purple-500/30"
                                            title="Edit Academics (CPI/Credits)"
                                        >
                                            <span className="font-bold text-xs">CPI</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Academic Results Table (GLAMS Style) */}
                            <div className="bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/20 dark:border-white/10 overflow-hidden">
                                <div className="p-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
                                    <h3 className="font-bold text-lg dark:text-white">Academic Performance</h3>
                                    <div className="flex gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Earned Credits: </span>
                                            <span className="font-bold dark:text-white">{selectedStudent.academicStats?.creditsEarned || 0}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">CPI: </span>
                                            <span className="font-bold text-indigo-500">{selectedStudent.academicStats?.cpi || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                {resultsLoading ? (
                                    <div className="p-8 text-center text-gray-500">Loading results...</div>
                                ) : Object.keys(groupedResults).length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">No academic results found.</div>
                                ) : (
                                    <div className="divide-y divide-gray-200 dark:divide-white/5">
                                        {Object.entries(groupedResults).sort().reverse().map(([sem, results]) => (
                                            <div key={sem} className="p-4">
                                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 bg-gray-100 dark:bg-white/5 inline-block px-3 py-1 rounded-lg">
                                                    Semester {sem}
                                                </h4>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm text-left">
                                                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-black/20">
                                                            <tr>
                                                                <th className="px-4 py-2">Code</th>
                                                                <th className="px-4 py-2">Course Name</th>
                                                                <th className="px-4 py-2 text-center">Type</th>
                                                                <th className="px-4 py-2 text-center">Credit</th>
                                                                <th className="px-4 py-2 text-center">Grade</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                                            {results.map(result => (
                                                                <tr key={result._id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                                                    <td className="px-4 py-2 font-mono text-xs">{result.courseCode || 'N/A'}</td>
                                                                    <td className="px-4 py-2 font-medium">{result.subject}</td>
                                                                    <td className="px-4 py-2 text-center">
                                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${result.type === 'P' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                                            {result.type || 'T'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-2 text-center">{result.credits}</td>
                                                                    <td className="px-4 py-2 text-center font-bold text-indigo-600">{result.grade}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Backlogs & UFM Sections (Keep existing, simplified) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Backlogs */}
                                <div className="bg-white/60 dark:bg-[#121212]/60 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-white/20 dark:border-white/10">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                                            <AlertTriangle className="h-5 w-5 text-amber-500" /> Backlogs
                                        </h3>
                                        {isTeacherOrAdmin && (
                                            <button onClick={() => setShowBacklogModal(true)} className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">Add</button>
                                        )}
                                    </div>
                                    {selectedStudent.backlogs?.length > 0 ? (
                                        selectedStudent.backlogs.map((log, i) => (
                                            <div key={i} className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded mb-2 text-sm flex justify-between">
                                                <span>{log.subject} ({log.semester})</span>
                                                <span className="text-red-500 font-bold">{log.status}</span>
                                            </div>
                                        ))
                                    ) : <p className="text-gray-400 text-sm">No Active Backlogs</p>}
                                </div>

                                {/* UFM */}
                                <div className="bg-white/60 dark:bg-[#121212]/60 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-white/20 dark:border-white/10">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                                            <XCircle className="h-5 w-5 text-red-500" /> UFM History
                                        </h3>
                                        {isTeacherOrAdmin && (
                                            <button onClick={() => setShowUfmModal(true)} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Add</button>
                                        )}
                                    </div>
                                    {selectedStudent.ufmHistory?.length > 0 ? (
                                        selectedStudent.ufmHistory.map((ufm, i) => (
                                            <div key={i} className="p-2 bg-red-50 dark:bg-red-900/20 rounded mb-2 text-sm">
                                                <div className="font-bold">{ufm.subject}</div>
                                                <div className="text-xs text-gray-500">{ufm.actionTaken}</div>
                                            </div>
                                        ))
                                    ) : <p className="text-gray-400 text-sm">No UFM Records</p>}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-12 bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-dashed border-gray-300 dark:border-white/10">
                            <User className="h-16 w-16 mb-4 opacity-20" />
                            <p className="text-lg font-medium">Select a student</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals ... (Keep existing modals for Backlog/UFM/Stats) */}
            {/* ... We need to update Stats Modal to Edit Profile Modal later ... */}
            {showBacklogModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-2xl w-full max-w-md rounded-2xl p-6 shadow-2xl animate-scale-in border border-white/20 dark:border-white/10">
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
                                    className="w-full p-2.5 rounded-xl border bg-white dark:bg-white/5 dark:border-white/10 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                    value={backlogData.subject}
                                    onChange={(e) => setBacklogData({ ...backlogData, subject: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester</label>
                                <select
                                    className="w-full p-2.5 rounded-xl border bg-white dark:bg-white/5 dark:border-white/10 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                    value={backlogData.semester}
                                    onChange={(e) => setBacklogData({ ...backlogData, semester: e.target.value })}
                                >
                                    <option value="1st">1st</option>
                                    <option value="2nd">2nd</option>
                                    <option value="3rd">3rd</option>
                                    <option value="4th">4th</option>
                                    <option value="5th">5th</option>
                                    <option value="6th">6th Sem</option>
                                    <option value="7th">7th</option>
                                    <option value="8th">8th</option>
                                </select>
                            </div>
                            <button type="submit" disabled={formLoading} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30">
                                {formLoading ? 'Adding...' : 'Add Backlog'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showIDCard && selectedStudent && (
                <IDCard student={selectedStudent} onClose={() => setShowIDCard(false)} />
            )}

            {showUfmModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-2xl w-full max-w-md rounded-2xl p-6 shadow-2xl animate-scale-in border border-white/20 dark:border-white/10">
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
                                    className="w-full p-2.5 rounded-xl border bg-white dark:bg-white/5 dark:border-white/10 dark:text-white focus:ring-2 focus:ring-red-500/50 outline-none"
                                    value={ufmData.subject}
                                    onChange={(e) => setUfmData({ ...ufmData, subject: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2.5 rounded-xl border bg-white dark:bg-white/5 dark:border-white/10 dark:text-white focus:ring-2 focus:ring-red-500/50 outline-none"
                                    value={ufmData.reason}
                                    onChange={(e) => setUfmData({ ...ufmData, reason: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Action Taken</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2.5 rounded-xl border bg-white dark:bg-white/5 dark:border-white/10 dark:text-white focus:ring-2 focus:ring-red-500/50 outline-none"
                                    value={ufmData.actionTaken}
                                    onChange={(e) => setUfmData({ ...ufmData, actionTaken: e.target.value })}
                                />
                            </div>
                            <button type="submit" disabled={formLoading} className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition shadow-lg shadow-red-500/30">
                                {formLoading ? 'Adding...' : 'Add UFM Record'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showStatsModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-2xl w-full max-w-md rounded-2xl p-6 shadow-2xl animate-scale-in border border-white/20 dark:border-white/10">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold dark:text-white">Edit Academic Stats</h3>
                            <button onClick={() => setShowStatsModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateStats} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CPI (Cumulative)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full p-2.5 rounded-xl border bg-white dark:bg-white/5 dark:border-white/10 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                    value={statsData.cpi}
                                    onChange={(e) => setStatsData({ ...statsData, cpi: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Credits Earned</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    className="w-full p-2.5 rounded-xl border bg-white dark:bg-white/5 dark:border-white/10 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                    value={statsData.totalCredits}
                                    onChange={(e) => setStatsData({ ...statsData, totalCredits: e.target.value })}
                                />
                            </div>
                            <button type="submit" disabled={formLoading} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30">
                                {formLoading ? 'Updating...' : 'Update Stats'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* Profile Edit Modal */}
            {showProfileModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-2xl w-full max-w-2xl rounded-2xl p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto border border-white/20 dark:border-white/10">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                                <Edit2 className="h-5 w-5 text-indigo-600" /> Edit Student Profile
                            </h3>
                            <button onClick={() => setShowProfileModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Personal Details */}
                            <div className="md:col-span-2">
                                <h4 className="font-semibold text-gray-500 mb-2 border-b pb-1">Personal Details</h4>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                <input type="text" className="input-field" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Father's Name</label>
                                <input type="text" className="input-field" value={profileData.fatherName} onChange={(e) => setProfileData({ ...profileData, fatherName: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Mother's Name</label>
                                <input type="text" className="input-field" value={profileData.motherName} onChange={(e) => setProfileData({ ...profileData, motherName: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                                <input type="date" className="input-field" value={profileData.dob} onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                                <select className="input-field" value={profileData.gender} onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                                <select className="input-field" value={profileData.category} onChange={(e) => setProfileData({ ...profileData, category: e.target.value })}>
                                    <option value="GEN">General</option>
                                    <option value="OBC">OBC</option>
                                    <option value="SC/ST">SC/ST</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Blood Group</label>
                                <input type="text" className="input-field" value={profileData.bloodGroup} onChange={(e) => setProfileData({ ...profileData, bloodGroup: e.target.value })} />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                                <textarea className="input-field" rows="2" value={profileData.address} onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}></textarea>
                            </div>

                            {/* Contact Details */}
                            <div className="md:col-span-2 mt-2">
                                <h4 className="font-semibold text-gray-500 mb-2 border-b pb-1">Contact Info</h4>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile No</label>
                                <input type="text" className="input-field" value={profileData.mobile} onChange={(e) => setProfileData({ ...profileData, mobile: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email ID</label>
                                <input type="email" className="input-field" value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} />
                            </div>

                            {/* Academic Details */}
                            <div className="md:col-span-2 mt-2">
                                <h4 className="font-semibold text-gray-500 mb-2 border-b pb-1">Academic Info</h4>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">University Roll No</label>
                                <input type="text" className="input-field" value={profileData.univRollNo} onChange={(e) => setProfileData({ ...profileData, univRollNo: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Registration No</label>
                                <input type="text" className="input-field" value={profileData.regNo} onChange={(e) => setProfileData({ ...profileData, regNo: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Section</label>
                                <input type="text" className="input-field" value={profileData.section} onChange={(e) => setProfileData({ ...profileData, section: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Library Code</label>
                                <input type="text" className="input-field" value={profileData.libCode} onChange={(e) => setProfileData({ ...profileData, libCode: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">10th Percentage</label>
                                <input type="number" className="input-field" value={profileData.hsPercentage} onChange={(e) => setProfileData({ ...profileData, hsPercentage: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">12th Percentage</label>
                                <input type="number" className="input-field" value={profileData.interPercentage} onChange={(e) => setProfileData({ ...profileData, interPercentage: e.target.value })} />
                            </div>

                            <div className="md:col-span-2 mt-4 flex gap-4">
                                <button type="button" onClick={() => setShowProfileModal(false)} className="flex-1 py-3 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-white/10 transition">
                                    Cancel
                                </button>
                                <button type="submit" disabled={formLoading} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30">
                                    {formLoading ? 'Saving...' : 'Save Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentHistory;

