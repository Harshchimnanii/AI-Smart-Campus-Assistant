import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, KeyRound, ArrowRight, Loader2 } from 'lucide-react';

const AdminLogin = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login, setUser } = useAuth(); // We might need to manually set user state if login() only supports password
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await axios.post('http://localhost:5000/api/auth/send-otp', { email });
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP. Ensure you are an admin.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/login-otp', { email, otp });
            // Save to local storage and context
            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-8 text-white">
                <div className="text-center mb-8">
                    <div className="mx-auto h-16 w-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck className="h-8 w-8 text-indigo-400" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Admin Portal</h2>
                    <p className="text-slate-400">Secure OTP Authentication</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        {error}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSendOTP} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Admin Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-10 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                    placeholder="admin@college.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                            Send Access Code
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Enter OTP Code</label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
                                <input
                                    type="text"
                                    required
                                    maxLength="6"
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-10 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all tracking-widest text-lg"
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                            </div>
                            <p className="text-xs text-slate-500 text-right">Sent to {email}</p>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                            Verify & Login
                        </button>
                        <button
                            type="button"
                            onClick={() => { setStep(1); setError(''); }}
                            className="w-full text-slate-400 text-sm hover:text-white transition-colors"
                        >
                            Back to Email
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AdminLogin;
