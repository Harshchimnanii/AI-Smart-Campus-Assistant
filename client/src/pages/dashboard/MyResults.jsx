import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Calculator, X, Printer, Menu } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

const MyResults = () => {
    const { user } = useAuth();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCalculator, setShowCalculator] = useState(false);

    // Previous Academic Data
    const [stats, setStats] = useState({ cpi: 0, totalCredits: 0 });

    // Sem 6 Presets
    const [currentSubjects, setCurrentSubjects] = useState([
        { code: 'BCSC 1012', name: 'DESIGN AND ANALYSIS OF ALGORITHMS', credits: 3, expectedGrade: 'A+' },
        { code: 'BCSE 0105', name: 'MACHINE LEARNING', credits: 3, expectedGrade: 'A+' },
        { code: 'BCSE 0252', name: 'FULL STACK USING NODE JS', credits: 3, expectedGrade: 'A+' },
        { code: 'BCSC 1807', name: 'DESIGN AND ANALYSIS OF ALGORITHMS LAB', credits: 1, expectedGrade: 'A+' },
        { code: 'BCSE 0133', name: 'MACHINE LEARNING LAB', credits: 1, expectedGrade: 'A+' },
        { code: 'BCSE 0282', name: 'FULL STACK USING NODE JS LAB', credits: 1, expectedGrade: 'A+' },
        { code: 'BCSJ 0951', name: 'MINI PROJECT - II', credits: 2, expectedGrade: 'A+' },
        { code: 'BTDH 0304', name: 'SOFT SKILLS - IV', credits: 4, expectedGrade: 'A+' },
        { code: 'MBAM 0002', name: 'LEADERSHIP AND ORGANISATIONAL BEHAVIOUR', credits: 0, expectedGrade: 'S' }
    ]);

    const gradePoints = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'P': 4, 'F': 0, 'S': 0 };

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

        if (user.academicStats) {
            setStats(user.academicStats);
        }
        fetchResults();
    }, [user]);

    // Graph Data Preparation
    const resultsBySem = results.reduce((acc, curr) => {
        (acc[curr.semester] = acc[curr.semester] || []).push(curr);
        return acc;
    }, {});

    const graphData = Object.keys(resultsBySem).sort().map(sem => {
        const semesterResults = resultsBySem[sem];
        const totalPoints = semesterResults.reduce((sum, r) => sum + (gradePoints[r.grade] || 0), 0);
        const spi = (totalPoints / semesterResults.length).toFixed(2);
        // CPI logic is complex without history, using random slight variation for demo or simplistic calc
        return {
            name: sem,
            SPI: parseFloat(spi),
            CPI: parseFloat((parseFloat(spi) - 0.2).toFixed(2)) // Mocking CPI trend for visual
        };
    });

    const overallPercentage = ((stats.cpi / 10) * 100).toFixed(1);

    // Calculator Logic
    const calculateStats = () => {
        let currentSemWeightedPoints = 0;
        let currentSemCredits = 0;

        currentSubjects.forEach(sub => {
            if (sub.credits > 0) { // Only count graded subjects
                const gp = gradePoints[sub.expectedGrade] || 0;
                currentSemWeightedPoints += (sub.credits * gp);
                currentSemCredits += sub.credits;
            }
        });

        const safeCredits = currentSemCredits || 1;
        const expSPI = (currentSemWeightedPoints / safeCredits).toFixed(2);

        const previousWeightedPoints = stats.cpi * stats.totalCredits;
        const totalWeightedPoints = previousWeightedPoints + currentSemWeightedPoints;
        const totalCreditsAll = stats.totalCredits + currentSemCredits;

        const expCPI = totalCreditsAll > 0 ? (totalWeightedPoints / totalCreditsAll).toFixed(2) : 0;

        return { expSPI, expCPI, currentSemCredits, currentSemWeightedPoints };
    };

    const { expSPI, expCPI, currentSemCredits, currentSemWeightedPoints } = calculateStats();

    // COLORS
    const COLORS = ['#00C49F', '#f3f4f6'];

    return (
        <div className="space-y-6 animate-fade-in p-2 md:p-6 bg-gray-50 dark:bg-black min-h-screen font-sans">

            {/* Header / Title */}
            <div className="bg-white dark:bg-[#121212] p-4 rounded-xl shadow-sm border-l-4 border-blue-500 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wide">
                    My Result
                </h1>
                <Printer className="text-red-500 h-6 w-6 cursor-pointer hover:scale-110 transition" />
            </div>

            {/* Graphs Section */}
            <div className="bg-white dark:bg-[#121212] p-6 rounded-xl shadow-sm">
                <h2 className="text-blue-500 font-semibold mb-6 flex items-center gap-2">
                    <span className="text-xl">➔</span> Progress Graph
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Bar Chart */}
                    <div className="lg:col-span-2 h-80">
                        <h3 className="text-gray-500 mb-4 text-sm font-medium">Progress Line</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={graphData} barGap={0} barCategoryGap="20%">
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis hide domain={[0, 10]} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Legend iconType="square" />
                                <Bar dataKey="SPI" fill="#007bff" name="SPI" radius={[2, 2, 0, 0]} />
                                <Bar dataKey="CPI" fill="#00d2d3" name="CPI" radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Donut Chart */}
                    <div className="h-80 flex flex-col items-center justify-center">
                        <h3 className="text-gray-500 mb-4 text-sm font-medium w-full text-left">Overall Percentage</h3>
                        <div className="relative w-48 h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[{ value: parseFloat(overallPercentage) }, { value: 100 - parseFloat(overallPercentage) }]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        startAngle={90}
                                        endAngle={-270}
                                        dataKey="value"
                                    >
                                        <Cell fill="#00d2d3" />
                                        <Cell fill="#f3f4f6" />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <p className="text-gray-400 text-xs">Percentage</p>
                                <p className="text-3xl font-bold text-white dark:text-white">{overallPercentage}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CPI Calculator Button (Floating or distinct) */}
            <div className="flex justify-end">
                <button
                    onClick={() => setShowCalculator(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white px-6 py-3 rounded-full hover:shadow-xl transition-all font-bold tracking-wide"
                >
                    <Calculator className="h-5 w-5" />
                    OPEN CPI CALCULATOR
                </button>
            </div>


            {/* Previous Semesters List */}
            <div className="space-y-4">
                {Object.keys(resultsBySem).map(sem => (
                    <div key={sem} className="bg-white dark:bg-[#121212] p-4 rounded-xl shadow-sm border-l-4 border-green-400">
                        <div className="flex justify-between items-center cursor-pointer">
                            <h3 className="text-blue-400 font-medium">Semester -{sem}</h3>
                            <span className="text-gray-400 text-sm">Click to Expand</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* CPI Calculator Modal - Full Screen Overlay Style */}
            {showCalculator && (
                <div className="fixed inset-0 bg-gray-100 dark:bg-[#0a0a0a] z-50 overflow-auto animate-fade-in font-sans">
                    {/* Top Bar */}
                    <div className="bg-white dark:bg-[#121212] h-16 flex items-center justify-between px-6 shadow-sm sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <Menu className="h-6 w-6 text-gray-500" />
                            <img src="/logo.svg" alt="Logo" className="h-8" />
                            <span className="text-blue-500 font-bold text-lg hidden md:block">Campus AI</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-semibold text-gray-700 dark:text-gray-200">{user.name}</span>
                            <button onClick={() => setShowCalculator(false)} className="bg-red-50 text-red-500 p-2 rounded-full hover:bg-red-100">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto p-4 md:p-8">
                        <div className="bg-white dark:bg-[#121212] rounded-xl shadow-xl overflow-hidden min-h-[80vh]">

                            {/* Title Bar */}
                            <div className="p-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                                <h2 className="flex items-center gap-2 text-xl font-bold text-gray-700 dark:text-gray-200">
                                    <Calculator className="text-blue-500" />
                                    CPI CALCULATOR
                                </h2>
                                <button className="border border-blue-400 text-blue-500 px-4 py-1 rounded text-sm font-medium hover:bg-blue-50">Instructions</button>
                            </div>

                            {/* Stat Boxes */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
                                <div className="bg-blue-200/50 p-4 rounded text-center">
                                    <p className="text-white font-bold text-lg">Current Semester : VI</p>
                                </div>
                                <div className="bg-cyan-500 p-4 rounded text-center">
                                    <p className="text-white font-bold text-lg">CPI Upto VI Sem : {stats.cpi}</p>
                                </div>
                                <div className="bg-orange-500 p-4 rounded text-center shadow-lg shadow-orange-500/30 transform hover:scale-105 transition">
                                    <p className="text-white/80 text-xs uppercase font-bold tracking-wider">Expected SPI</p>
                                    <p className="text-white font-bold text-3xl mt-1">{expSPI}</p>
                                </div>
                                <div className="bg-cyan-500 p-4 rounded text-center shadow-lg shadow-cyan-500/30 transform hover:scale-105 transition">
                                    <p className="text-white/80 text-xs uppercase font-bold tracking-wider">Expected CPI</p>
                                    <p className="text-white font-bold text-3xl mt-1">{expCPI}</p>
                                </div>
                            </div>

                            <p className="px-6 text-sm text-gray-500">* Select your 'Expected Grade' from list for specified subject</p>

                            {/* Table */}
                            <div className="p-6 overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-blue-400 text-white">
                                            <th className="p-3 text-center w-12">#</th>
                                            <th className="p-3 text-left">Sub.Code</th>
                                            <th className="p-3 text-left">Sub.Name</th>
                                            <th className="p-3 text-left w-32">Exp. Grade</th>
                                            <th className="p-3 text-center w-20">Credit</th>
                                            <th className="p-3 text-center w-20">GP</th>
                                            <th className="p-3 text-center w-20">Weight</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-gray-700 dark:text-gray-300">
                                        {currentSubjects.map((sub, idx) => {
                                            const gp = gradePoints[sub.expectedGrade] || 0;
                                            const weight = sub.credits * gp;
                                            return (
                                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                                    <td className="p-3 text-center">{idx + 1}</td>
                                                    <td className="p-3 font-medium text-gray-500">{sub.code}</td>
                                                    <td className="p-3 uppercase font-medium">{sub.name}</td>
                                                    <td className="p-3">
                                                        <select
                                                            className="w-full border rounded p-1 dark:bg-black dark:border-white/20"
                                                            value={sub.expectedGrade}
                                                            onChange={(e) => {
                                                                const newSubs = [...currentSubjects];
                                                                newSubs[idx].expectedGrade = e.target.value;
                                                                setCurrentSubjects(newSubs);
                                                            }}
                                                        >
                                                            {['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F', 'S'].map(g => (
                                                                <option key={g} value={g}>{g}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="p-3 text-center bg-green-500 text-white font-bold rounded-sm mx-1">{sub.credits}</td>
                                                    <td className="p-3 text-center">{gp}</td>
                                                    <td className="p-3 text-center">{weight}</td>
                                                </tr>
                                            );
                                        })}
                                        {/* Total Row */}
                                        <tr className="bg-blue-400 text-white font-bold">
                                            <td colSpan={4} className="p-3 text-center">Total</td>
                                            <td className="p-3 text-center">{currentSemCredits}</td>
                                            <td className="p-3 text-center">0</td>
                                            <td className="p-3 text-center">{currentSemWeightedPoints}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Calculation Logic & Formulas */}
                            <div className="p-6 bg-gray-50 dark:bg-white/5 mx-6 mb-6 rounded-xl border border-gray-200 dark:border-white/10">
                                <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                                    <Calculator className="h-4 w-4 text-indigo-500" /> Calculation Logic
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                    <div className="space-y-2">
                                        <p><span className="font-semibold">SPI (Semester Performance Index):</span></p>
                                        <code className="block bg-white dark:bg-black/30 p-2 rounded border border-gray-200 dark:border-white/10 text-xs text-indigo-600 dark:text-indigo-400">
                                            SPI = (Σ (Credit × Grade Point)) / (Σ Credits)
                                        </code>
                                        <p className="text-gray-500 text-xs mt-1">Calculated based on the selected 'Expected Grade' for current semester subjects.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p><span className="font-semibold">CPI (Cumulative Performance Index):</span></p>
                                        <code className="block bg-white dark:bg-black/30 p-2 rounded border border-gray-200 dark:border-white/10 text-xs text-indigo-600 dark:text-indigo-400">
                                            CPI = (Prev. weighted points + Curr. weighted points) / (Prev. Credits + Curr. Credits)
                                        </code>
                                        <p className="text-gray-500 text-xs mt-1">Combines your previous academic history with the projected current semester performance.</p>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
                                    <p className="font-semibold text-xs mb-2">Grade Point Mapping:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(gradePoints).map(([grade, point]) => (
                                            <span key={grade} className="px-2 py-1 bg-white dark:bg-black/30 rounded border border-gray-200 dark:border-white/10 text-xs">
                                                <span className="font-bold text-gray-700 dark:text-gray-300">{grade}</span> = <span className="text-indigo-600 font-bold">{point}</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyResults;
