import { useSidebarStore } from "@/hooks/controller";
import React, { useEffect, ReactNode } from "react";
import { useLocation } from "react-router-dom";

type DashboardLayoutProps = {
    children: ReactNode;
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const { isOpen, toggleSidebar } = useSidebarStore();

    // Tailwind classes for base and xl screens
    // margin-left: 105px if miniSidenav, else 274px (px-0 for base, custom for xl)
    // transition for margin-left/right
    const baseClasses =
        "p-6 relative flex flex-col transition-[margin-left,margin-right] duration-300 ease-in-out";
    const marginLeftClass = isOpen
        ? "xl:ml-[105px]"
        : "xl:ml-[274px]";

    return (
        <div className={`${baseClasses} ${marginLeftClass}`}>
            {children}
        </div>
    );
};

export default DashboardLayout;