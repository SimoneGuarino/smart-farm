import { Outlet, NavLink } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { useEffect } from 'react';
import { useDarkModeStore } from './hooks/controller';

export default function App() {
    const { isDarkMode } = useDarkModeStore();
    
    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    }, [isDarkMode]);

    return (
        <div className="min-h-screen min-w-screen bg-gray-50 dark:bg-stone-800 text-gray-900 flex">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Topbar />
                <main className="flex-1 overflow-hidden">{/* <- niente padding qui */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
}