import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Trophy, TrendingUp, Award } from 'lucide-react';

const MyResults = () => {
    const { user } = useAuth();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/results/my-results`, config);
                setResults(data);
            } catch (error) {
                console.error("Error fetching results", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [user.token]);

    // Group results by semester
    const resultsBySem = results.reduce((acc, curr) => {
        (acc[curr.semester] = acc[curr.semester] || []).push(curr);
        return acc;
    }, {});

    // Calculate SPI (Simplistic: Average of Grades converted to points)
    const getGradePoint = (grade) => {
        const map = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C': 6, 'D': 5, 'F': 0 };
        return map[grade] || 0;
    };

    const calculateSPI = (semResults) => {
        if (!semResults || semResults.length === 0) return 0;
        const totalPoints = semResults.reduce((sum, r) => sum + getGradePoint(r.grade), 0);
        return (totalPoints / semResults.length).toFixed(2);
    };

    return (
        <div className="space-y-6 animate-fade-in p-2 md:p-6">
            <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
                <Trophy className="h-8 w-8 text-yellow-500" />
                My Academic Results
            </h1>

            {loading ? <p>Loading...</p> : Object.keys(resultsBySem).length === 0 ? (
                <div className="p-12 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-2xl">
                    <Award className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No results declared yet.</p>
                </div>
            ) : (
                Object.keys(resultsBySem).map(sem => (
                    <div key={sem} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                            <h3 className="text-lg font-bold dark:text-white">{sem} Semester</h3>
                            <div className="flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/50 px-3 py-1 rounded-full text-indigo-700 dark:text-indigo-300 text-sm font-bold">
                                <TrendingUp className="h-4 w-4" />
                                SPI: {calculateSPI(resultsBySem[sem])}
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-3">Subject</th>
                                        <th className="px-6 py-3">Exam Type</th>
                                        <th className="px-6 py-3">Marks</th>
                                        <th className="px-6 py-3">Grade</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {resultsBySem[sem].map((res) => (
                                        <tr key={res._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{res.subject}</td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{res.examType}</td>
                                            <td className="px-6 py-4 text-gray-900 dark:text-gray-300 font-medium">
                                                {res.marks} <span className="text-gray-400 text-xs">/ {res.totalMarks}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold 
                                                    ${res.grade === 'F' ? 'bg-red-100 text-red-700' :
                                                        res.grade.startsWith('A') ? 'bg-green-100 text-green-700' :
                                                            'bg-blue-100 text-blue-700'}`}>
                                                    {res.grade}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default MyResults;
