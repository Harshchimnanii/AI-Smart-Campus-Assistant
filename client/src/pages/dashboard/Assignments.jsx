import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FileText, Calendar, Upload, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const Assignments = () => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const [submittingId, setSubmittingId] = useState(null);
    const [file, setFile] = useState(null); // File state
    const [comment, setComment] = useState('');

    // Teacher specific states
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newAssignment, setNewAssignment] = useState({ title: '', subject: '', description: '', dueDate: '' });
    const [viewingSubmissions, setViewingSubmissions] = useState(null); // assignmentId
    const [assignmentSubmissions, setAssignmentSubmissions] = useState([]); // List of submissions for a specific assignment

    const isStudent = user?.role === 'student';
    const isStatf = ['teacher', 'admin', 'ceo'].includes(user?.role);

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const reqs = [axios.get(`${import.meta.env.VITE_API_URL}/api/assignments`, config)];
            if (isStudent) {
                reqs.push(axios.get(`${import.meta.env.VITE_API_URL}/api/assignments/my-submissions`, config));
            }

            const results = await Promise.all(reqs);
            setAssignments(results[0].data);
            if (isStudent) setSubmissions(results[1].data);

            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' } };
            const formData = new FormData();
            formData.append('title', newAssignment.title);
            formData.append('subject', newAssignment.subject);
            formData.append('description', newAssignment.description);
            formData.append('dueDate', newAssignment.dueDate);
            if (newAssignment.file) formData.append('file', newAssignment.file);

            await axios.post(`${import.meta.env.VITE_API_URL}/api/assignments`, formData, config);
            setShowCreateForm(false);
            setNewAssignment({ title: '', subject: '', description: '', dueDate: '', file: null });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating assignment');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this assignment?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/assignments/${id}`, config);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error deleting assignment');
        }
    };

    const handleSubmit = async (e, assignmentId) => {
        e.preventDefault();
        if (!file) return alert('Please upload a file');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('comments', comment);

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/assignments/${assignmentId}/submit`,
                formData,
                config
            );

            setSubmittingId(null);
            setFile(null);
            setComment('');
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Submission failed');
        }
    };

    const getSubmissionStatus = (assignmentId) => {
        return submissions.find(s => s.assignment._id === assignmentId || s.assignment === assignmentId);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assignments</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage coursework and submissions</p>
                </div>
                {isStudent && (
                    <div className="flex gap-2 bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'pending' ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>Pending</button>
                        <button onClick={() => setActiveTab('completed')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'completed' ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>Completed</button>
                    </div>
                )}
                {isStatf && (
                    <button onClick={() => setShowCreateForm(!showCreateForm)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition">
                        <FileText className="w-4 h-4" /> Create Assignment
                    </button>
                )}
            </div>

            {isStatf && showCreateForm && (
                <form onSubmit={handleCreate} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                    <h3 className="font-semibold text-lg dark:text-white">New Assignment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Title" required className="p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newAssignment.title} onChange={e => setNewAssignment({ ...newAssignment, title: e.target.value })} />
                        <input type="text" placeholder="Subject" required className="p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newAssignment.subject} onChange={e => setNewAssignment({ ...newAssignment, subject: e.target.value })} />
                        <input type="date" required className="p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newAssignment.dueDate} onChange={e => setNewAssignment({ ...newAssignment, dueDate: e.target.value })} />
                        <input type="file" className="p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white" onChange={e => setNewAssignment({ ...newAssignment, file: e.target.files[0] })} />
                    </div>
                    <textarea placeholder="Description" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newAssignment.description} onChange={e => setNewAssignment({ ...newAssignment, description: e.target.value })} />
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setShowCreateForm(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Create</button>
                    </div>
                </form>
            )}

            <div className="grid gap-6">
                {assignments
                    .filter(assignment => {
                        if (isStatf) return true;
                        const isSubmitted = getSubmissionStatus(assignment._id);
                        return activeTab === 'pending' ? !isSubmitted : isSubmitted;
                    })
                    .map((assignment) => {
                        const submission = isStudent ? getSubmissionStatus(assignment._id) : null;
                        const isExpanded = submittingId === assignment._id;

                        return (
                            <div key={assignment._id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{assignment.title}</h3>
                                                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                                    {assignment.subject}
                                                </span>
                                            </div>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{assignment.description || 'No description provided.'}</p>
                                            <div className="text-xs text-gray-400 mt-1">By: {assignment.createdBy?.name || 'Teacher'}</div>
                                            {assignment.questionPaper && (
                                                <a href={`${import.meta.env.VITE_API_URL}${assignment.questionPaper}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 text-sm font-medium mt-2 flex items-center gap-1 hover:underline">
                                                    <FileText className="h-4 w-4" /> View Question Paper
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${submission ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' : 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400'}`}>
                                            <Calendar className="h-4 w-4" />
                                            <span className="text-sm font-medium">Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                        </div>
                                        {isStatf && (
                                            <button onClick={() => handleDelete(assignment._id)} className="text-red-500 hover:text-red-700 text-sm underline">Delete</button>
                                        )}
                                    </div>
                                </div>

                                {isStudent && (
                                    <>
                                        {submission ? (
                                            <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700 flex justify-between items-center">
                                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                                    <CheckCircle className="h-5 w-5" />
                                                    <span className="font-medium">Submitted on {new Date(submission.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                {submission.grade && <span className="font-bold text-gray-900 dark:text-white">Grade: {submission.grade}</span>}
                                            </div>
                                        ) : (
                                            <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700">
                                                {isExpanded ? (
                                                    <form onSubmit={(e) => handleSubmit(e, assignment._id)} className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload File (PDF/Docs)</label>
                                                            <input type="file" required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-300" onChange={(e) => setFile(e.target.files[0])} />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comments (Optional)</label>
                                                            <textarea className="w-full rounded-xl border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-indigo-500 focus:ring-indigo-500" rows="2" value={comment} onChange={(e) => setComment(e.target.value)} />
                                                        </div>
                                                        <div className="flex gap-3 justify-end">
                                                            <button type="button" onClick={() => setSubmittingId(null)} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
                                                            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2"><Upload className="h-4 w-4" /> Submit Assignment</button>
                                                        </div>
                                                    </form>
                                                ) : (
                                                    <button onClick={() => setSubmittingId(assignment._id)} className="w-full py-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center justify-center gap-2">Submit Work</button>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};

export default Assignments;
