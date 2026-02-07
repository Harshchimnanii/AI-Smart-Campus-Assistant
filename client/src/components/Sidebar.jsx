import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, GraduationCap, FileText, Calendar, MessageSquare, Briefcase, LogOut, Users, CheckSquare, Sun, Moon, Bell, AlertCircle, Utensils } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Sidebar = () => {
    const { pathname } = useLocation();
    const { logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const getLinks = (role) => {
        const commonLinks = [];

        if (role === 'student') {
            return [
                { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
                { name: 'Academics', path: '/dashboard/academics', icon: GraduationCap },
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
                { name: 'Assignments', path: '/dashboard/assignments', icon: FileText },
                { name: 'Student History', path: '/dashboard/student-history', icon: Users }, // New
                { name: 'Manage Notices', path: '/dashboard/admin/notices', icon: Bell }, // New
                { name: 'Help Desk', path: '/dashboard/admin/complaints', icon: AlertCircle }, // New
            ];
        } else if (role === 'admin' || role === 'ceo') {
            return [
                { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
                { name: 'User Management', path: '/dashboard/users', icon: Users },
                { name: 'Manage Notices', path: '/dashboard/admin/notices', icon: Bell }, // New
                { name: 'Help Desk', path: '/dashboard/admin/complaints', icon: AlertCircle }, // New
            ];
        }
        return [];
    };

    const links = getLinks(user?.role);

    return (
        <div className="h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col fixed left-0 top-0 z-10 shadow-sm transition-colors duration-200">
            <div className="p-6 flex items-center gap-3">
                <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                    AI
                </div>
                <span className="font-bold text-xl text-gray-800 dark:text-white tracking-tight">Campus<span className="text-indigo-600">AI</span></span>
            </div>

            <div className="p-4 border-b border-gray-50 dark:border-gray-800 mb-2">
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                    <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold">
                        {user?.name?.[0] || 'U'}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{user?.name || 'User'}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">{user?.role || 'Guest'}</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.path;
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${isActive
                                ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-50 dark:border-gray-800 space-y-2">
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
    );
};

export default Sidebar;
