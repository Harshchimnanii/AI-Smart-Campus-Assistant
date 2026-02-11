import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, ArrowRight, Sparkles, Zap, Flame } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(email, password);
        setLoading(false);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#0a0a0a] text-white overflow-hidden relative selection:bg-lime-400 selection:text-black">
            {/* Background Chaos */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/30 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-lime-500/20 rounded-full blur-[100px] animate-pulse delay-75"></div>
            <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-pink-500/20 rounded-full blur-[80px]"></div>

            {/* Split Layout */}
            <div className="w-full flex">

                {/* Left Side: VIBES (Hidden on mobile) */}
                <div className="hidden lg:flex w-1/2 relative items-center justify-center p-12 border-r border-white/10">
                    <div className="relative z-10 space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                            <Sparkles className="h-4 w-4 text-yellow-400" />
                            <span className="text-xs font-bold tracking-widest text-gray-300 uppercase">The Future is Here</span>
                        </div>

                        <h1 className="text-8xl font-black leading-[0.9] tracking-tighter">
                            CMP <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-emerald-400 to-teal-400">OS</span> <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">AI.</span>
                        </h1>

                        <p className="text-xl text-gray-400 max-w-md font-medium">
                            No cap, the smartest way to manage your campus life. Attendance, Results, and Vibes—all in one place.
                        </p>

                        <div className="flex gap-4">
                            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition hover:scale-105 cursor-crosshair">
                                <Zap className="h-8 w-8 text-lime-400 mb-2" />
                                <div className="font-bold text-lg">Fast AF</div>
                            </div>
                            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition hover:scale-105 cursor-crosshair">
                                <Shield className="h-8 w-8 text-pink-400 mb-2" />
                                <div className="font-bold text-lg">Secure</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: LOGIN FORM */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-20">
                    <div className="w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl">

                        <div className="mb-8">
                            <h2 className="text-4xl font-black tracking-tighter mb-2">
                                WAGWAN 👋
                            </h2>
                            <p className="text-gray-400 font-medium">
                                Enter your details to get into the mainframe.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-400">
                                <Flame className="h-5 w-5" />
                                <span className="text-sm font-bold">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-500 group-focus-within:text-lime-400 transition-colors" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/50 transition-all font-medium"
                                        placeholder="you@campus.edu"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/50 transition-all font-medium"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="flex justify-end mt-2">
                                    <Link to="/forgot-password" className="text-sm text-lime-400 hover:text-white transition-colors font-medium">Forgot Password?</Link>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-lime-400 to-emerald-400 text-black font-black text-lg py-4 rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(132,204,22,0.3)] flex items-center justify-center gap-2"
                            >
                                {loading ? 'LOADING...' : (
                                    <>
                                        LET'S GO <ArrowRight className="h-6 w-6" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-gray-400 font-medium">
                                New here? <Link to="/register" className="text-lime-400 hover:text-white transition-colors font-bold underline decoration-wavy decoration-lime-400/30">Create Account</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Simple Shield Icon component since lucide-react might not export Shield in this version or to match usage
const Shield = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
);

export default Login;
