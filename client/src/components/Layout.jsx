import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300 ease-in-out">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Mobile Header */}
            <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-4 sticky top-0 z-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                        AI
                    </div>
                    <span className="font-bold text-xl text-gray-800 dark:text-white tracking-tight">Campus<span className="text-indigo-600">AI</span></span>
                </div>
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                    <Menu className="h-6 w-6" />
                </button>
            </div>

            <div className="ml-0 md:ml-64 p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;
