import React, { ReactNode } from "react";

type DashboardLayoutProps = {
    children: ReactNode;
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const baseClasses =
        "p-6 relative flex flex-col transition-[margin-left,margin-right] duration-300 ease-in-out mt-12";

    return (
        <div className={`${baseClasses}`}>
            {children}
        </div>
    );
};

export default DashboardLayout;