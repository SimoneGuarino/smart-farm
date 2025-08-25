import { NavLink, useNavigate } from 'react-router-dom'
import { useResponsiveSidebar } from './sidebar/useResponsiveSidebar';
import { Tooltip } from 'react-tooltip';

//icons
import { MdOutlineDashboard } from "react-icons/md";
import { PiFarm } from "react-icons/pi";
import { MdOutlineAnalytics } from "react-icons/md";
import IconButton from '../ui/buttons/IconButton';

const DashboardIcon = MdOutlineDashboard as React.FC<{ size?: number }>;
const Campo3DIcon = PiFarm as React.FC<{ size?: number }>;
const AnalyticsIcon = MdOutlineAnalytics as React.FC<{ size?: number }>;


export default function Sidebar() {
    const nav = useNavigate();

    const routes = [
        { to: "/", label: "Dashboard", icon: <DashboardIcon size={20} /> },
        { to: "/terreni", label: "Terreni", icon: <Campo3DIcon size={25} /> },
        { to: "/terreni_google", label: "Terreni 3D", icon: <Campo3DIcon size={25} /> },
        { to: "/sonde", label: "Sonde", icon: <AnalyticsIcon size={25} /> },
    ];

    return (<>
        <aside className="fixed z-5 bottom-0 p-4 w-full">
            <div className='flex bg-white dark:bg-stone-900 px-6 py-2 ml-auto mr-auto gap-4 w-fit rounded-full'>
                {
                    routes.map(route => {
                        const isActive = window.location.pathname === route.to;
                        return (
                            <IconButton
                                key={route.to}
                                className={
                                    `transition !p-3 ${isActive ? 'bg-green-100 text-green-600' : 'hover:bg-slate-100'}`
                                }
                                onClick={() => nav(route.to)}
                                icon={route.icon}
                                dataTooltipId='general-sidenav-tooltip'
                                dataTooltipContent={route.label}
                            />
                        );
                    })
                }
            </div>
        </aside>

        <Tooltip
            id="general-sidenav-tooltip"
            place="bottom"
            style={{
                maxWidth: "15vw",
                minWidth: 150,
                fontSize: "0.87rem",
                textAlign: "center",
                zIndex: 9999,
            }}
        />
    </>
    )
}