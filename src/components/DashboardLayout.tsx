import { useSidebarStore } from "@/hooks/controller";
import React, { ReactNode } from "react";

type DashboardLayoutProps = {
    children: ReactNode;
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const { isOpen } = useSidebarStore();

    // Tailwind classes for base and xl screens
    // margin-left: 105px if miniSidenav, else 274px (px-0 for base, custom for xl)
    // transition for margin-left/right
    const baseClasses =
        "p-6 relative flex flex-col transition-[margin-left,margin-right] duration-300 ease-in-out mt-10";
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