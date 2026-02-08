import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, GraduationCap, BookOpen, Building, Zap, Cpu, Globe, Hash } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        rollNumber: '',
        department: '',
        year: '',
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await register(formData);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden flex items-center justify-center p-4 py-10">
            {/* Gen Z Ambient Background */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-pink-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
            <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[100px] rotate-45"></div>

            <div className="relative w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 md:p-12 overflow-hidden group hover:border-white/20 transition-all duration-500">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 p-4 opacity-50">
                    <Zap className="text-yellow-400 h-10 w-10 animate-spin-slow" />
                </div>

                <div className="text-center mb-10 relative z-10">
                    <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 mb-2 tracking-tighter hover:scale-105 transition-transform cursor-default">
                        JOIN THE SQUAD
                    </h2>
                    <p className="text-gray-400 font-medium tracking-widest text-xs uppercase">
                        Initialize Your Digital Avatar
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 text-sm flex items-center gap-3 backdrop-blur-sm animate-shake">
                        <div className="h-2 w-2 bg-red-500 rounded-full animate-ping"></div>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 group/input">
                            <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-wider group-focus-within/input:text-purple-400 transition-colors">User Alias</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5 group-focus-within/input:text-white transition-colors" />
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-12 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-medium"
                                    placeholder="Your Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 group/input">
                            <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-wider group-focus-within/input:text-pink-400 transition-colors">Digital ID (Email)</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5 group-focus-within/input:text-white transition-colors" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-12 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all font-medium"
                                    placeholder="you@college.edu"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 group/input">
                            <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-wider group-focus-within/input:text-indigo-400 transition-colors">Secret Key</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5 group-focus-within/input:text-white transition-colors" />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-12 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 group/input">
                            <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-wider group-focus-within/input:text-cyan-400 transition-colors">Character Class</label>
                            <div className="relative">
                                <select
                                    name="role"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-medium appearance-none cursor-pointer hover:bg-black/60"
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value="student" className="bg-gray-900">Student (Learner)</option>
                                    <option value="admin" className="bg-gray-900">Admin (Operator)</option>
                                    <option value="teacher" className="bg-gray-900">Teacher (Sensei)</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <Cpu className="h-4 w-4 text-gray-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {formData.role === 'student' && (
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-6 animate-fade-in relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 group/input">
                                    <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-wider group-focus-within/input:text-emerald-400 transition-colors">Faction (Dept)</label>
                                    <div className="relative">
                                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4 group-focus-within/input:text-white" />
                                        <select
                                            name="department"
                                            required
                                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium appearance-none"
                                            value={formData.department}
                                            onChange={handleChange}
                                        >
                                            <option value="" disabled className="bg-gray-900">Select Dept</option>
                                            {['CSE', 'ECE', 'ME', 'CE', 'EE'].map(d => (
                                                <option key={d} value={d} className="bg-gray-900">{d}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2 group/input">
                                    <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-wider group-focus-within/input:text-orange-400 transition-colors">Level (Year)</label>
                                    <div className="relative">
                                        <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4 group-focus-within/input:text-white" />
                                        <select
                                            name="year"
                                            required
                                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all font-medium appearance-none"
                                            value={formData.year}
                                            onChange={handleChange}
                                        >
                                            <option value="" disabled className="bg-gray-900">Select Year</option>
                                            {['1st', '2nd', '3rd', '4th'].map(y => (
                                                <option key={y} value={y} className="bg-gray-900">{y}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2 group/input">
                                <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-wider group-focus-within/input:text-blue-400 transition-colors">Unique Identifier (Roll No)</label>
                                <div className="relative">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5 group-focus-within/input:text-white transition-colors" />
                                    <input
                                        type="text"
                                        name="rollNumber"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-12 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                                        placeholder="2023CSE101"
                                        value={formData.rollNumber}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={formData.role === 'student' && (!formData.department || !formData.year)}
                        className="w-full bg-white text-black font-black text-lg py-4 px-6 rounded-xl hover:bg-gray-200 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-white/10 flex items-center justify-center gap-3 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        <span className="relative z-10">INITIATE SEQUENCE</span>
                        <UserPlus className="h-6 w-6 relative z-10 group-hover:rotate-12 transition-transform" />
                    </button>
                </form>

                <div className="mt-10 text-center relative z-10">
                    <p className="text-gray-400 text-sm">
                        Already a member?{' '}
                        <Link to="/login" className="text-white font-bold hover:text-purple-400 transition-colors uppercase tracking-wider border-b border-transparent hover:border-purple-400">
                            Plug In Here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
