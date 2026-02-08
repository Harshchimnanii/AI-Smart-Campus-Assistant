import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Plus, Trash2, BookOpen } from 'lucide-react';

const ClassMapping = () => {
    const { user } = useAuth();
    const [mappings, setMappings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [department, setDepartment] = useState('CSE');
    const [year, setYear] = useState('1st');
    const [subject, setSubject] = useState('');
    const [section, setSection] = useState('');

    const departments = ['CSE', 'ECE', 'ME', 'CE', 'EE'];
    const years = ['1st', '2nd', '3rd', '4th'];

    useEffect(() => {
        fetchMappings();
    }, []);

    const fetchMappings = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/class-map/my-classes`, config);
            setMappings(data);
        } catch (error) {
            console.error('Error fetching mappings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!subject) return alert('Please enter a subject name');

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/class-map/add`, {
                department,
                year,
                subject,
                section
            }, config);

            setMappings([...mappings, data]);
            setSubject('');
            setSection('');
        } catch (error) {
            alert(error.response?.data?.message || 'Error adding class');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this class?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/class-map/${id}`, config);
            setMappings(mappings.filter(m => m._id !== id));
        } catch (error) {
            alert('Error removing class');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in p-2 md:p-6">
            <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-indigo-600" />
                Manage Subjects
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Map the subjects you teach to specific classes.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Add New Class Form */}
                <div className="lg:col-span-1">
                    <form onSubmit={handleAdd} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-semibold mb-4 dark:text-white">Add New Class</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                                <select
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                >
                                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
                                <select
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                >
                                    {years.map(y => <option key={y} value={y}>{y} Year</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject Name</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="e.g. Data Structures"
                                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section (Optional)</label>
                                <input
                                    type="text"
                                    value={section}
                                    onChange={(e) => setSection(e.target.value)}
                                    placeholder="e.g. A"
                                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition">
                                <Plus className="h-5 w-5" />
                                Add Class
                            </button>
                        </div>
                    </form>
                </div>

                {/* Mapped Classes List */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-semibold dark:text-white">Your Mapped Classes</h3>
                        </div>

                        {loading ? (
                            <div className="p-6 text-center text-gray-500">Loading...</div>
                        ) : mappings.length === 0 ? (
                            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                                <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                <p>No classes mapped yet. Add one to get started.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {mappings.map((map) => (
                                    <div key={map._id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white">{map.subject}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {map.department} • {map.year} Year {map.section && `• Section ${map.section}`}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(map._id)}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                            title="Remove Class"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassMapping;
