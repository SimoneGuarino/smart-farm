import { Outlet, NavLink } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'

export default function App() {
    return (
        <div className="min-h-screen min-w-screen bg-gray-50 text-gray-900 flex">
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