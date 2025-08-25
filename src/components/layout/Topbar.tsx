//import { useUIStore } from '@/stores/useUIStore'
//import { useResponsiveSidebar } from './sidebar/useResponsiveSidebar';
import logo from "@/assets/logo.png";
import IconButton from '../ui/buttons/IconButton';

import { BsLayoutSidebar } from "react-icons/bs";
import { IoSettingsOutline, IoNotificationsOutline } from "react-icons/io5";

import { useSidebarStore } from '@/hooks/controller';
import { useResponsiveSidebar } from "./sidebar/useResponsiveSidebar";
import Card from "../ui/Card";

const SidebarIcon = BsLayoutSidebar as React.FC<{ size?: number }>;
const SettingsIcon = IoSettingsOutline as React.FC<{ size?: number }>;
const NotificationsIcon = IoNotificationsOutline as React.FC<{ size?: number }>;

export default function Topbar() {
    //const { features, toggleFeature } = useUIStore();
    const { isOpen, toggleSidebar } = useSidebarStore();
    const { isMobile } = useResponsiveSidebar();

    return (
        <div className="fixed top-0 z-5 flex p-2 space-x-4 w-full items-center">
            <>
            {isMobile && <IconButton
                icon={<img src={logo} alt="Logo" className={`w-full max-w-[40px] select-none`} />}
                variant="secondary"
                dataTooltipId="general-sidenav-tooltip"
                dataTooltipContent={`${!isOpen ? "chiudi" : "apri"} barra di navigazione`}
                onClick={toggleSidebar}
                className={`h-fit`}
            />}
            <Card className="flex ml-auto p-2 rounded-full gap-2">
                <IconButton
                    icon={<NotificationsIcon size={20} />}
                    variant="secondary"
                    dataTooltipId="general-sidenav-tooltip"
                    dataTooltipContent={`${!isOpen ? "chiudi" : "apri"} barra di navigazione`}
                    onClick={toggleSidebar}
                    className={`h-fit`}
                />
                <IconButton
                    icon={<SettingsIcon size={20} />}
                    variant="secondary"
                    dataTooltipId="general-sidenav-tooltip"
                    dataTooltipContent={`${!isOpen ? "chiudi" : "apri"} barra di navigazione`}
                    onClick={toggleSidebar}
                    className={`h-fit`}
                />
            </Card>
        </>
            {/*<div className="flex gap-3 items-center text-sm">
                <label className="flex items-center gap-2">
                    <input type="checkbox" checked={features.meteoStation} onChange={() => toggleFeature('meteoStation')} /> Meteo
                </label>
                <label className="flex items-center gap-2">
                    <input type="checkbox" checked={features.inlinePH} onChange={() => toggleFeature('inlinePH')} /> pH/EC in linea
                </label>
                <label className="flex items-center gap-2">
                    <input type="checkbox" checked={features.flowMeter} onChange={() => toggleFeature('flowMeter')} /> Contalitri
                </label>
                <label className="flex items-center gap-2">
                    <input type="checkbox" checked={features.leafWetness} onChange={() => toggleFeature('leafWetness')} /> Bagnatura fogliare
                </label>
            </div>*/}
        </div>
    )
}