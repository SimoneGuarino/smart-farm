import { useDarkModeStore, useSidebarStore } from '@/hooks/controller';
import { useCallback, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom'
import { useResponsiveSidebar } from './sidebar/useResponsiveSidebar';
import SidebarContainer from './sidebar/SidebarContainer';
import { SideNavHeader } from './sidebar/header';
import { Tooltip } from 'react-tooltip';

//icons
import { MdOutlineDashboard } from "react-icons/md";
import { PiFarm } from "react-icons/pi";
import { MdOutlineAnalytics } from "react-icons/md";
import { useEffect } from 'react';

const DashboardIcon = MdOutlineDashboard as React.FC<{ size?: number }>;
const Campo3DIcon = PiFarm as React.FC<{ size?: number }>;
const AnalyticsIcon = MdOutlineAnalytics as React.FC<{ size?: number }>;


const LinkItem = ({ to, label, icon }: { to: string; label: string; icon: React.ReactNode }) => {
    const { isOpen, closeSidebar } = useSidebarStore();
    const { isMobile } = useResponsiveSidebar();

    return (
        <NavLink to={to} onClick={() => isMobile && closeSidebar()} className={({ isActive }) =>
            `flex gap-2 py-2 ${isOpen ? 'px-8' : 'px-4' } 
            text-gray-800 dark:text-gray-200
            w-full transition ${isActive ? 'bg-neutral-100 text-sky-600' : 'hover:bg-slate-100'}`
        }>
            {icon}
            {isMobile ? label : !isOpen && label}
        </NavLink>
    );
}


export default function Sidebar() {
    const { isMobile } = useResponsiveSidebar(); // 👈 ora abbiamo isMobile
    const { isOpen, closeSidebar } = useSidebarStore();
    const { isDarkMode } = useDarkModeStore();

    // hover/scrollbar show-hide
    const [navIsFocused, setNavIsFocused] = useState(false);
    const activedBar = useRef(false);
    const timeoutId = useRef<number | null>(null);


    const handleFocus = useCallback(() => {
        activedBar.current = true;
        if (timeoutId.current) {
            window.clearTimeout(timeoutId.current);
            timeoutId.current = null;
        }
        setNavIsFocused(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        activedBar.current = false;
        timeoutId.current = window.setTimeout(() => setNavIsFocused(false), 800);
    }, []);


    return (<>
        {/* Backdrop mobile */}
        {isMobile && isOpen && (
            <div
                onClick={() => closeSidebar()}
                className="fixed inset-0 z-10 bg-black/40 backdrop-blur-[1px]"
                aria-hidden
            />
        )}
        <SidebarContainer
            onMouseEnter={handleFocus}
            onMouseLeave={handleMouseLeave}
            white={true}
            dark={isDarkMode}
            isMobile={isMobile}
            open={isOpen}
        >
            <SideNavHeader NavLink={NavLink} navIsFocused={navIsFocused} />

            <LinkItem to="/" label="Dashboard" icon={<DashboardIcon size={25}/>} />
            <LinkItem to="/terreni" label={"Terreni"} icon={<Campo3DIcon size={25}/>} />
            <LinkItem to="/sonde" label={"Sonde"} icon={<AnalyticsIcon size={25}/>} />
        </SidebarContainer>

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