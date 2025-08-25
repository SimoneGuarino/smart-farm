import React, { ReactNode } from "react";

type DashboardLayoutProps = {
    children: ReactNode;
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const baseClasses =
        "relative flex flex-col transition-[margin-left,margin-right] duration-300 ease-in-out pt-18"; // mt-12

    return (
        <div className={`${baseClasses}`}>
            {children}
        </div>
    );
};

export default DashboardLayout;