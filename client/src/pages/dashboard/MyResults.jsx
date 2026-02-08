import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Trophy, TrendingUp, Award, Calculator, X } from 'lucide-react';

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

    // --- CPI Calculator Logic ---
    const [showCalculator, setShowCalculator] = useState(false);
    const [currentCPI, setCurrentCPI] = useState(0);
    const [totalCredits, setTotalCredits] = useState(0);
    const [currentSemSubjects, setCurrentSemSubjects] = useState([{ name: '', credits: 3, expectedGrade: 'A' }]);

    useEffect(() => {
        if (user.academicStats) {
            setCurrentCPI(user.academicStats.cpi || 0);
            setTotalCredits(user.academicStats.totalCredits || 0);
        }
    }, [user]);

    const handleAddSubject = () => {
        setCurrentSemSubjects([...currentSemSubjects, { name: '', credits: 3, expectedGrade: 'A' }]);
    };

    const handleRemoveSubject = (index) => {
        const newSubjects = [...currentSemSubjects];
        newSubjects.splice(index, 1);
        setCurrentSemSubjects(newSubjects);
    };

    const handleSubjectChange = (index, field, value) => {
        const newSubjects = [...currentSemSubjects];
        newSubjects[index][field] = value;
        setCurrentSemSubjects(newSubjects);
    };

    const calculateProjectedCPI = () => {
        let totalPoints = currentCPI * totalCredits;
        let newCredits = totalCredits;

        currentSemSubjects.forEach(sub => {
            const credits = Number(sub.credits) || 0;
            const points = getGradePoint(sub.expectedGrade);
            totalPoints += points * credits;
            newCredits += credits;
        });

        return newCredits > 0 ? (totalPoints / newCredits).toFixed(2) : 0;
    };

    return (
        <div className="space-y-6 animate-fade-in p-2 md:p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
                    <Trophy className="h-8 w-8 text-yellow-500" />
                    My Academic Results
                </h1>
                <button
                    onClick={() => setShowCalculator(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition shadow-lg"
                >
                    <Calculator className="h-5 w-5" />
                    CPI Calculator
                </button>
            </div>

            {/* Current Stats Card */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-indigo-100 mb-1">Current CPI</p>
                        <h2 className="text-4xl font-bold">{currentCPI}</h2>
                    </div>
                    <div className="text-right">
                        <p className="text-indigo-100 mb-1">Total Credits</p>
                        <h2 className="text-2xl font-bold">{totalCredits}</h2>
                    </div>
                </div>
            </div>

            {loading ? <p>Loading...</p> : Object.keys(resultsBySem).length === 0 ? (
                <div className="p-12 text-center text-gray-500 bg-white/60 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10">
                    <Award className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No results declared yet.</p>
                </div>
            ) : (
                Object.keys(resultsBySem).map(sem => (
                    <div key={sem} className="bg-white/60 dark:bg-[#121212]/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-white/10 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                            <h3 className="text-lg font-bold dark:text-white">{sem} Semester</h3>
                            <div className="flex items-center gap-2 bg-indigo-100 dark:bg-indigo-500/20 px-3 py-1 rounded-full text-indigo-700 dark:text-indigo-300 text-sm font-bold border border-indigo-200 dark:border-indigo-500/30">
                                <TrendingUp className="h-4 w-4" />
                                SPI: {calculateSPI(resultsBySem[sem])}
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50/30 dark:bg-white/5 border-b dark:border-white/10">
                                    <tr>
                                        <th className="px-6 py-3">Subject</th>
                                        <th className="px-6 py-3">Exam Type</th>
                                        <th className="px-6 py-3">Marks</th>
                                        <th className="px-6 py-3">Grade</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {resultsBySem[sem].map((res) => (
                                        <tr key={res._id} className="hover:bg-indigo-50/50 dark:hover:bg-white/5 transition">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{res.subject}</td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{res.examType}</td>
                                            <td className="px-6 py-4 text-gray-900 dark:text-gray-300 font-medium">
                                                {res.marks} <span className="text-gray-400 text-xs">/ {res.totalMarks}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold 
                                                    ${res.grade === 'F' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 border border-red-200 dark:border-red-500/30' :
                                                        res.grade.startsWith('A') ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300 border border-green-200 dark:border-green-500/30' :
                                                            'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30'}`}>
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

            {/* Calculator Modal */}
            {showCalculator && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-2xl w-full max-w-2xl rounded-2xl p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto border border-white/20 dark:border-white/10">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                                <Calculator className="h-6 w-6 text-indigo-600" />
                                CPI Predictor
                            </h3>
                            <button onClick={() => setShowCalculator(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Current CPI</p>
                                <p className="text-2xl font-bold dark:text-white">{currentCPI}</p>
                            </div>
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                                <p className="text-sm text-indigo-600 dark:text-indigo-400">Projected CPI</p>
                                <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">{calculateProjectedCPI()}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="font-semibold dark:text-white">Current Semester Subjects</h4>
                                <button onClick={handleAddSubject} className="text-sm text-indigo-600 font-bold hover:underline">+ Add Subject</button>
                            </div>

                            {currentSemSubjects.map((sub, index) => (
                                <div key={index} className="flex gap-3 items-end">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500">Subject Name</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 rounded-lg border bg-white dark:bg-white/5 dark:border-white/10 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                            value={sub.name}
                                            onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                                            placeholder="Subject"
                                        />
                                    </div>
                                    <div className="w-20">
                                        <label className="text-xs text-gray-500">Credits</label>
                                        <input
                                            type="number"
                                            className="w-full p-2 rounded-lg border bg-white dark:bg-white/5 dark:border-white/10 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                            value={sub.credits}
                                            onChange={(e) => handleSubjectChange(index, 'credits', e.target.value)}
                                        />
                                    </div>
                                    <div className="w-24">
                                        <label className="text-xs text-gray-500">Exp. Grade</label>
                                        <select
                                            className="w-full p-2 rounded-lg border bg-white dark:bg-white/5 dark:border-white/10 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                            value={sub.expectedGrade}
                                            onChange={(e) => handleSubjectChange(index, 'expectedGrade', e.target.value)}
                                        >
                                            {['A+', 'A', 'B+', 'B', 'C', 'D', 'F'].map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </div>
                                    <button onClick={() => handleRemoveSubject(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyResults;
