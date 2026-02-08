import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { Users, Layers, ArrowRight } from 'lucide-react';

const SectionManagement = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [department, setDepartment] = useState('CSE');
    const [year, setYear] = useState('1st');
    const [resultData, setResultData] = useState(null);

    const departments = ['CSE', 'ECE', 'ME', 'CE', 'EE'];
    const years = ['1st', '2nd', '3rd', '4th'];

    const handleGenerate = async () => {
        if (!window.confirm(`Are you sure you want to re-assign sections for ${department} - ${year} Year? This will overwrite existing section assignments based on current academic performance.`)) {
            return;
        }

        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/academics/generate-sections`, {
                department,
                year
            }, config);

            setResultData(data);
            alert('Sections generated successfully!');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error generating sections');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in p-2 md:p-6">
            <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
                <Layers className="h-8 w-8 text-indigo-600" />
                Section Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
                Automatically assign sections to students based on their academic performance (CPI).
                Students are ranked by score and assigned to sections (A, B, C...) in batches of 50.
            </p>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department</label>
                        <select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Year</label>
                        <select
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                            {years.map(y => <option key={y} value={y}>{y} Year</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className={`flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 dark:shadow-none ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Processing...' : (
                            <>
                                <Users className="h-5 w-5" />
                                Generate Sections
                            </>
                        )}
                    </button>
                </div>
            </div>

            {resultData && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-xl font-bold dark:text-white mb-4">Results</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium">Total Students Processed</p>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{resultData.totalStudents}</p>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Sections Created</p>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{resultData.sectionsCreated}</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto max-h-96">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3">Rank</th>
                                    <th className="px-4 py-3">Student Name</th>
                                    <th className="px-4 py-3">Score (%)</th>
                                    <th className="px-4 py-3">Assigned Section</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {resultData.details.map((student, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">#{index + 1}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{student.name}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{student.score}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded font-bold">
                                                Section {student.section}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SectionManagement;
