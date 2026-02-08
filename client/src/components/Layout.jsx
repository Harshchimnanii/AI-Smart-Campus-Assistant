import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import logo from '../assets/logo.svg';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300 ease-in-out relative selection:bg-lime-400 selection:text-black overflow-x-hidden">
            {/* Background Chaos (Fixed position for dashboard) */}
            <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse z-0 pointer-events-none"></div>
            <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-lime-500/10 rounded-full blur-[100px] animate-pulse delay-75 z-0 pointer-events-none"></div>
            <div className="fixed top-[40%] left-[60%] w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-[80px] z-0 pointer-events-none"></div>

            <div className="relative z-10">
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                {/* Mobile Header */}
                <div className="md:hidden bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 p-4 sticky top-0 z-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="NexCampus Logo" className="h-8 w-8 object-contain" />
                        <span className="font-bold text-xl text-gray-800 dark:text-white tracking-tight">Nex<span className="text-indigo-600">Campus</span></span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
                        <Menu className="h-6 w-6" />
                    </button>
                </div>

                <div className="ml-0 md:ml-64 p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Layout;
