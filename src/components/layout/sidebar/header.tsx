import React from "react"
import { NavLink } from "react-router-dom";

import { BsLayoutSidebar } from "react-icons/bs";

import logo from "@/assets/logo.png";
import IconButton from "@/components/ui/buttons/IconButton";
import { useSidebarStore } from "@/hooks/controller";
import { useResponsiveSidebar } from "./useResponsiveSidebar";

const SidebarIcon = BsLayoutSidebar as React.FC<{ size?: number }>;

interface SideNavHeaderProps {
    NavLink: typeof NavLink;
    navIsFocused: boolean;
};

export const SideNavHeader: React.FC<SideNavHeaderProps> = ({ navIsFocused }) => {
    const { isOpen, toggleSidebar } = useSidebarStore();
    const { isMobile } = useResponsiveSidebar();

    const btn = (className?: string) => (
        <IconButton
            icon={<SidebarIcon size={20} />}
            variant="text"
            dataTooltipId="general-sidenav-tooltip"
            dataTooltipContent={`${!isOpen ? "chiudi" : "apri"} barra di navigazione`}
            onClick={toggleSidebar}
            className={`${className} h-fit`}
        />
    );

    return <div className={`flex justify-between items-center mb-2 p-2 border-b border-neutral-200 dark:border-neutral-800`}>
        {(navIsFocused && isOpen) ? btn("ml-auto mr-auto") : 
        <>
            <div className={`flex items-center gap-2 w-full ${isOpen && 'justify-center'}`}>
                <img src={logo} alt="Logo" className={`w-full max-w-[40px] select-none`} />
                {isMobile ? <p className={`text-lg font-semibold`}>AgriSense</p> : !isOpen && <p className={`text-lg font-semibold`}>AgriSense</p>}
            </div>
            {!isOpen && btn()}
        </>}
    </div>
}