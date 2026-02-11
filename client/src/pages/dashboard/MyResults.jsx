import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Calculator, X, Printer, Menu, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

const MyResults = () => {
    const { user } = useAuth();
    console.log("MyResults User Context:", user); // Debugging
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCalculator, setShowCalculator] = useState(false);
    const [expandedSemesters, setExpandedSemesters] = useState({});

    const toggleSem = (sem) => {
        setExpandedSemesters(prev => ({ ...prev, [sem]: !prev[sem] }));
    };

    // Previous Academic Data
    const [stats, setStats] = useState({ cpi: 0, totalCredits: 0 });

    // Default Sem 6 Subjects
    const defaultSubjects = [
        { code: 'BCSC 1012', name: 'DESIGN AND ANALYSIS OF ALGORITHMS', credits: 3, expectedGrade: 'A+' },
        { code: 'BCSE 0105', name: 'MACHINE LEARNING', credits: 3, expectedGrade: 'A+' },
        { code: 'BCSE 0252', name: 'FULL STACK USING NODE JS', credits: 3, expectedGrade: 'A+' },
        { code: 'BCSC 1807', name: 'DESIGN AND ANALYSIS OF ALGORITHMS LAB', credits: 1, expectedGrade: 'A+' },
        { code: 'BCSE 0133', name: 'MACHINE LEARNING LAB', credits: 1, expectedGrade: 'A+' },
        { code: 'BCSE 0282', name: 'FULL STACK USING NODE JS LAB', credits: 1, expectedGrade: 'A+' },
        { code: 'BCSJ 0951', name: 'MINI PROJECT - II', credits: 2, expectedGrade: 'A+' },
        { code: 'BTDH 0304', name: 'SOFT SKILLS - IV', credits: 4, expectedGrade: 'A+' },
        { code: 'MBAM 0002', name: 'LEADERSHIP AND ORGANISATIONAL BEHAVIOUR', credits: 0, expectedGrade: 'S' }
    ];

    const [currentSubjects, setCurrentSubjects] = useState(defaultSubjects);

    const resetSubjects = () => {
        setCurrentSubjects(defaultSubjects);
    };

    const gradePoints = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'P': 4, 'F': 0, 'S': 0 };

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/results/my-results`, config);
                // API now returns { results, academicStats } or just results (array)
                if (data.results) {
                    setResults(data.results);
                    if (data.academicStats) {
                        console.log("Fetched Academic Stats from API:", data.academicStats);
                        setStats(data.academicStats);
                    }
                } else {
                    // Fallback for old API structure (array)
                    if (Array.isArray(data)) {
                        setResults(data);
                    }
                }
            } catch (error) {
                console.error("Error fetching results", error);
            } finally {
                setLoading(false);
            }
        };

        // Initialize with context data if available, but API will override with fresh data
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

        // Previous Data
        const previousWeightedPoints = stats.cpi * stats.totalCredits;

        // Total
        const totalWeightedPoints = previousWeightedPoints + currentSemWeightedPoints;
        const totalCreditsAll = stats.totalCredits + currentSemCredits;

        const expCPI = totalCreditsAll > 0 ? (totalWeightedPoints / totalCreditsAll).toFixed(2) : 0;

        return { expSPI, expCPI, currentSemCredits, currentSemWeightedPoints };
    };

    const { expSPI, expCPI, currentSemCredits, currentSemWeightedPoints } = calculateStats();

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

            {/* CPI Calculator Button */}
            <div className="flex justify-end">
                <button
                    onClick={() => setShowCalculator(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold tracking-wide ring-2 ring-indigo-200 dark:ring-indigo-900"
                >
                    <Calculator className="h-6 w-6" />
                    OPEN INTELLIGENT CALCULATOR
                </button>
            </div>


            {/* Previous Semesters List */}
            <div className="space-y-4">
                {Object.keys(resultsBySem).sort().reverse().map(sem => (
                    <div key={sem} className="bg-white dark:bg-[#121212] p-4 rounded-xl shadow-sm border-l-4 border-green-400 overflow-hidden transition-all duration-300">
                        <div
                            className="flex justify-between items-center cursor-pointer"
                            onClick={() => toggleSem(sem)}
                        >
                            <h3 className="text-blue-500 font-bold text-lg">Semester {sem}</h3>
                            <span className="text-gray-400 text-sm flex items-center gap-1">
                                {expandedSemesters[sem] ? (
                                    <>Collapse <ChevronUp className="h-4 w-4" /></>
                                ) : (
                                    <>Expand <ChevronDown className="h-4 w-4" /></>
                                )}
                            </span>
                        </div>

                        {/* Collapsible Content */}
                        {expandedSemesters[sem] && (
                            <div className="mt-4 animate-fade-in border-t border-gray-100 dark:border-white/5 pt-4">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-white/5">
                                            <tr>
                                                <th className="px-4 py-3 rounded-l-lg">Subject Code</th>
                                                <th className="px-4 py-3">Subject Name</th>
                                                <th className="px-4 py-3 text-center">Grade</th>
                                                <th className="px-4 py-3 text-center rounded-r-lg">Credits</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                            {resultsBySem[sem].map((result, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-white/5 transition">
                                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">{result.subCode}</td>
                                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 min-w-[200px]">{result.subName}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${['O', 'A+', 'A'].includes(result.grade) ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                            ['F'].includes(result.grade) ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                            }`}>
                                                            {result.grade}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-gray-500 dark:text-gray-400 font-medium">{result.credits}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="border-t border-gray-200 dark:border-white/10">
                                            <tr>
                                                <td colSpan="3" className="px-4 py-3 text-right font-bold text-gray-700 dark:text-gray-300">Total Credits:</td>
                                                <td className="px-4 py-3 text-center font-bold text-indigo-600 dark:text-indigo-400">
                                                    {resultsBySem[sem].reduce((sum, r) => sum + (Number(r.credits) || 0), 0)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* CPI Calculator Modal - Enhanced Glassmorphism */}
            {showCalculator && (
                <div className="fixed inset-0 z-50 overflow-auto animate-fade-in flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowCalculator(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative bg-white/90 dark:bg-[#1a1a1a]/95 backdrop-blur-xl w-full max-w-6xl rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden text-gray-800 dark:text-gray-100">

                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-white/5 dark:to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                    <Calculator className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight">CPI Simulator</h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Predict your academic performance</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={resetSubjects}
                                    className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition"
                                >
                                    <RotateCcw className="h-4 w-4" /> Reset Default
                                </button>
                                <button
                                    onClick={() => setShowCalculator(false)}
                                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-500 rounded-full transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">

                            {/* Left Panel: Inputs */}
                            <div className="lg:col-span-8 flex flex-col gap-6">
                                {/* Warning / Info */}
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-r-lg text-sm text-yellow-800 dark:text-yellow-200 flex justify-between items-center">
                                    <p>Adjust expected grades to see how they impact your final CPI.</p>
                                    <button onClick={resetSubjects} className="md:hidden text-xs bg-yellow-200 dark:bg-yellow-800 px-2 py-1 rounded">Reset</button>
                                </div>

                                {/* Subjects Table */}
                                <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-gray-50 dark:bg-white/5 text-left text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                    <th className="p-4 w-16 text-center">#</th>
                                                    <th className="p-4">Subject</th>
                                                    <th className="p-4 w-32">Grade</th>
                                                    <th className="p-4 w-20 text-center">Credit</th>
                                                    <th className="p-4 w-20 text-center">Points</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                                {currentSubjects.map((sub, idx) => {
                                                    const gp = gradePoints[sub.expectedGrade] || 0;
                                                    const weight = sub.credits * gp;
                                                    return (
                                                        <tr key={idx} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors group">
                                                            <td className="p-4 text-center text-gray-400 group-hover:text-blue-500">{idx + 1}</td>
                                                            <td className="p-4">
                                                                <div className="font-semibold text-gray-700 dark:text-gray-200">{sub.code}</div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mt-0.5">{sub.name}</div>
                                                            </td>
                                                            <td className="p-4">
                                                                <div className="relative">
                                                                    <select
                                                                        className="w-full appearance-none bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg py-2 px-3 pr-8 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow cursor-pointer hover:bg-white dark:hover:bg-white/20"
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
                                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                                                        <ChevronDown className="h-4 w-4" />
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="p-4 text-center">
                                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 text-xs font-bold text-gray-600 dark:text-gray-300">
                                                                    {sub.credits}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 text-center font-mono text-gray-600 dark:text-gray-400">
                                                                {weight}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel: Results & Stats */}
                            <div className="lg:col-span-4 space-y-6">
                                {/* Main Results Card */}
                                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                                    {/* Background Decor */}
                                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
                                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-black/10 blur-3xl"></div>

                                    <h3 className="text-white/80 font-medium text-sm uppercase tracking-wider mb-6">Predicted Performance</h3>

                                    <div className="grid grid-cols-2 gap-6 mb-6">
                                        <div className="relative z-10">
                                            <p className="text-white/60 text-xs font-medium mb-1">Expected SPI</p>
                                            <p className="text-4xl font-extrabold tracking-tight">{expSPI}</p>
                                        </div>
                                        <div className="relative z-10">
                                            <p className="text-indigo-200 text-xs font-medium mb-1">Total Credits</p>
                                            <p className="text-4xl font-extrabold tracking-tight">{currentSemCredits}</p>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-white/20 relative z-10">
                                        <p className="text-white/80 text-xs font-medium mb-1 uppercase">Expected Cumulative CPI</p>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-6xl font-black tracking-tight">{expCPI}</p>
                                            <span className="text-indigo-200 font-medium">/ 10.0</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Historical Data Snippet */}
                                <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-6 border border-gray-200 dark:border-white/10">
                                    <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Academic History</h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-300">Previous CPI</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="10"
                                                value={stats.cpi}
                                                onChange={(e) => setStats({ ...stats, cpi: parseFloat(e.target.value) || 0 })}
                                                className="w-24 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded px-2 py-1 text-right font-mono font-bold text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-300">Credits Earned</span>
                                            <input
                                                type="number"
                                                step="1"
                                                min="0"
                                                value={stats.totalCredits}
                                                onChange={(e) => setStats({ ...stats, totalCredits: parseFloat(e.target.value) || 0 })}
                                                className="w-24 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded px-2 py-1 text-right font-mono font-bold text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-300">Points Earned</span>
                                            <span className="font-mono font-bold text-gray-800 dark:text-white">{(stats.cpi * stats.totalCredits).toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="text-xs text-gray-400 text-center leading-relaxed px-4">
                                    Calculation assumes standard credit weighting.
                                    <br />
                                    CPI = (Total Weighted Points) / (Total Credits)
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
