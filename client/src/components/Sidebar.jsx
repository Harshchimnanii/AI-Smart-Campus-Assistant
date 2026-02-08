import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LayoutDashboard, GraduationCap, FileText, Calendar, MessageSquare, Briefcase, LogOut, Users, CheckSquare, Sun, Moon, Bell, AlertCircle, Utensils, X, Trophy, Calculator, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import logo from '../assets/logo.svg';

const Sidebar = ({ isOpen, onClose }) => {
    const { pathname } = useLocation();
    const { logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const getLinks = (role) => {
        // ... (keep usage of role helper if needed, or simplfy)
        if (role === 'student') {
            return [
                { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
                { name: 'Academics', path: '/dashboard/academics', icon: GraduationCap },
                { name: 'My Results', path: '/dashboard/results', icon: Trophy },
                { name: 'Attendance', path: '/dashboard/attendance', icon: Calendar },
                { name: 'Assignments', path: '/dashboard/assignments', icon: FileText },
                { name: 'Notices', path: '/dashboard/notices', icon: Bell },
                { name: 'Complaints', path: '/dashboard/complaints', icon: AlertCircle },
                { name: 'Mess Menu', path: '/dashboard/mess', icon: Utensils },
                { name: 'AI Assistant', path: '/dashboard/chat', icon: MessageSquare },
            ];
        } else if (role === 'teacher') {
            return [
                { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
                { name: 'Take Attendance', path: '/dashboard/attendance/take', icon: CheckSquare },
                { name: 'Upload Marks', path: '/dashboard/marks/upload', icon: Calculator },
                { name: 'My Subjects', path: '/dashboard/classes', icon: Briefcase },
                { name: 'Class Schedule', path: '/dashboard/schedule', icon: Calendar },
                { name: 'Assignments', path: '/dashboard/assignments', icon: FileText },
                { name: 'Student History', path: '/dashboard/student-history', icon: Users },
                { name: 'Manage Notices', path: '/dashboard/admin/notices', icon: Bell },
                { name: 'Help Desk', path: '/dashboard/admin/complaints', icon: AlertCircle },
            ];
        } else if (role === 'admin' || role === 'ceo') {
            return [
                { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
                { name: 'User Management', path: '/dashboard/users', icon: Users },
                { name: 'Section Management', path: '/dashboard/admin/sections', icon: Layers },
                { name: 'Manage Notices', path: '/dashboard/admin/notices', icon: Bell },
                { name: 'Help Desk', path: '/dashboard/admin/complaints', icon: AlertCircle },
            ];
        }
        return [];
    };

    const links = getLinks(user?.role);

    // PWA Install Logic
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            <div className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col z-50 shadow-xl md:shadow-sm transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}>
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Campus AI Logo" className="h-10 w-10 object-contain hover:scale-110 transition-transform duration-300 drop-shadow-lg" />
                        <span className="font-bold text-xl text-gray-800 dark:text-white tracking-tight">Campus<span className="text-indigo-600">AI</span></span>
                    </div>
                    {/* Close Button for Mobile */}
                    <button onClick={onClose} className="md:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-4 border-b border-gray-50 dark:border-gray-800 mb-2">
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                        <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold">
                            {user?.name?.[0] || 'U'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{user?.name || 'User'}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">{user?.role || 'Guest'}</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => onClose()} // Close sidebar on link click (mobile)
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${isActive
                                    ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-800'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-50 dark:border-gray-800 space-y-2 pb-24 md:pb-4">
                    {/* Install App Button (Only visible if installable) */}
                    {deferredPrompt && (
                        <button
                            onClick={handleInstallClick}
                            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:shadow-lg transition-all animate-bounce-slow"
                        >
                            <Briefcase className="h-5 w-5" />
                            Install App 📲
                        </button>
                    )}

                    <button
                        onClick={toggleTheme}
                        className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                    </button>
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
