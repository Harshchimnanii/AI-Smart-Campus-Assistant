import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, GraduationCap, BookOpen, Building } from 'lucide-react';

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
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4 py-10">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl w-full max-w-lg p-8 text-white">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">Create Account</h2>
                    <p className="text-white/70">Join the smart campus community</p>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-100 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80 ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 h-5 w-5" />
                            <input
                                type="text"
                                name="name"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80 ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 h-5 w-5" />
                            <input
                                type="email"
                                name="email"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                                placeholder="student@college.edu"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 h-5 w-5" />
                            <input
                                type="password"
                                name="password"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80 ml-1">Role</label>
                        <div className="relative">
                            <select
                                name="role"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all [&>option]:bg-slate-800"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <option value="student">Student</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>

                    {formData.role === 'student' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/80 ml-1">Department</label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 h-4 w-4" />
                                        <input
                                            type="text"
                                            name="department"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                                            placeholder="CSE"
                                            value={formData.department}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/80 ml-1">Year</label>
                                    <div className="relative">
                                        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 h-4 w-4" />
                                        <input
                                            type="text"
                                            name="year"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                                            placeholder="3rd"
                                            value={formData.year}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/80 ml-1">Roll Number</label>
                                <div className="relative">
                                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 h-5 w-5" />
                                    <input
                                        type="text"
                                        name="rollNumber"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                                        placeholder="2023CSE101"
                                        value={formData.rollNumber}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-white text-indigo-600 font-bold py-3 px-4 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 mt-4"
                    >
                        <UserPlus className="h-5 w-5" />
                        Create Account
                    </button>
                </form>

                <div className="mt-8 text-center text-white/60 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-white font-semibold hover:underline">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
