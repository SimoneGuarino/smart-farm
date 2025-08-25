import { MapContainer, TileLayer } from "react-leaflet";
import TerritoryPolygon from "@/components/map/TerritoryPolygon";
import SensorMarker from "@/components/map/SensorMarker";
import { TERRITORIES_GEO } from "@/config/territories.geo";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/buttons/Button";

import { RiArrowLeftWideFill, RiArrowRightWideLine } from "react-icons/ri";

import IconButton from "@/components/ui/buttons/IconButton";
import clsx from "clsx";
import MapSummary from "@/components/map/Summary";

const ArrowLeft = RiArrowLeftWideFill as React.FC<{ size?: number }>;
const ArrowRight = RiArrowRightWideLine as React.FC<{ size?: number }>;


export default function TerreniMap() {
    const nav = useNavigate();
    const [terriListBar, setTerriListBar] = useState<boolean>(false);

    const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
    const [summaryOpen, setSummaryOpen] = useState<boolean>(false);
    const handleOpenSummary = () => setSummaryOpen(true);

    // centro mappa = media semplice dei centroidi dei poligoni
    const center = useMemo(() => {
        const all = TERRITORIES_GEO.flatMap(t => t.polygon);
        const lat = all.reduce((a, b) => a + b[0], 0) / all.length;
        const lng = all.reduce((a, b) => a + b[1], 0) / all.length;
        return [lat, lng] as [number, number];
    }, []);

    const selected = TERRITORIES_GEO.find(t => t.id === selectedId) ?? TERRITORIES_GEO[0];
    const mapTilerKey = import.meta.env.VITE_MAPTILER_KEY as string | undefined;

    return (
        <>
            {/* Sidebar sinistra: elenco terreni */}
            <aside
                className={clsx(
                    "bg-white",
                    "fixed z-5 flex flex-col h-full shrink-0 left-0 top-0 p-4",   // z più alto per stare sopra
                    // 👇 animazione: su mobile usiamo translateX
                    clsx(
                        "transition-transform duration-200 ease-in-out",
                        terriListBar ? "translate-x-0" : "-translate-x-full"
                    )
                )}
            >
                <div className="text-lg font-semibold mb-3">Terreni</div>
                <div className="space-y-2">
                    {TERRITORIES_GEO.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setSelectedId(t.id)}
                            className={`w-full text-left px-3 py-2 rounded-xl border ${selectedId === t.id ? 'bg-yellow-50 border-yellow-300' : 'hover:bg-slate-50 border-slate-200'}`}
                        >
                            <div className="font-medium">{t.name}</div>
                            <div className="text-xs opacity-70">{t.areaHa} ha</div>
                        </button>
                    ))}
                </div>
                <div className="mt-4 space-y-2">
                    <Button
                        className="w-full"
                        onClick={() => nav(`/terreni/${selected?.id}`)}
                    >Apri dashboard terreno</Button>
                    <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => nav(`/terreni/${selected?.id}/3d`)}
                    >Apri vista 3D</Button>
                </div>

                <IconButton variant="secondary" className="absolute top-1/2 -right-8 z-10 h-20
                rounded-none"

                    onClick={() => setTerriListBar(!terriListBar)}
                    icon={<ArrowRight size={16} />} />
            </aside>

            {/* Mappa centrale */}
            <div className="fixed top-0 left-0 w-full h-full">
                <MapContainer zoomControl={false} center={center} zoom={16} scrollWheelZoom className="h-full w-full">
                    <TileLayer
                        url={
                            mapTilerKey
                                ? `https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg?key=${mapTilerKey}`
                                : // fallback pubblico (World Imagery)
                                "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        }
                        attribution="&copy; MapTiler & OpenStreetMap contributors"
                    />
                    {TERRITORIES_GEO.map(t => (
                        <TerritoryPolygon key={t.id} t={t} handleOpenSummary={handleOpenSummary} setSelectedId={setSelectedId}/>
                    ))}
                    {TERRITORIES_GEO.flatMap(t => t.sensors?.map(s => (
                        <SensorMarker key={s.id} id={s.id} pos={s.pos} />
                    )) ?? [])}
                </MapContainer>
            </div>

            {/* Quick Summary a destra */}
            <MapSummary selected={selected} summaryOpen={summaryOpen} setSummaryOpen={setSummaryOpen} />
        </>
    );
}
