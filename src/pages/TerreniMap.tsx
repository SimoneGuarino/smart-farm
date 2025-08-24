import { MapContainer, TileLayer } from "react-leaflet";
import TerritoryPolygon from "@/components/map/TerritoryPolygon";
import SensorMarker from "@/components/map/SensorMarker";
import { TERRITORIES_GEO } from "@/config/territories.geo";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSidebarStore } from "@/hooks/controller";
import Button from "@/components/ui/buttons/Button";
import { RiArrowLeftWideFill } from "react-icons/ri";
import { RiArrowRightWideLine } from "react-icons/ri";
import IconButton from "@/components/ui/buttons/IconButton";
import clsx from "clsx";

const ArrowLeft = RiArrowLeftWideFill as React.FC<{ size?: number }>;
const ArrowRight = RiArrowRightWideLine as React.FC<{ size?: number }>;

export default function TerreniMap() {
    const nav = useNavigate();
    const { isOpen } = useSidebarStore();
    const [terriListBar, setTerriListBar] = useState<boolean>(false);

    const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

    // centro mappa = media semplice dei centroidi dei poligoni
    const center = useMemo(() => {
        const all = TERRITORIES_GEO.flatMap(t => t.polygon);
        const lat = all.reduce((a, b) => a + b[0], 0) / all.length;
        const lng = all.reduce((a, b) => a + b[1], 0) / all.length;
        return [lat, lng] as [number, number];
    }, []);

    const selected = TERRITORIES_GEO.find(t => t.id === selectedId) ?? TERRITORIES_GEO[0];

    return (
        <>
            {/* Sidebar sinistra: elenco terreni */}
            <aside
                className={clsx(
                    "bg-white",
                    "fixed z-5 flex flex-col h-full shrink-0 left-0 top-0 p-4",   // z più alto per stare sopra
                    isOpen ? 'xl:ml-[88px]' : 'xl:ml-[279px]',  // sposta a destra se sidebar aperta
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

                <IconButton variant="secondary" className="absolute top-1/3 -right-8 z-10 rounded-none h-40"
                    onClick={() => setTerriListBar(!terriListBar)}
                    icon={<ArrowRight size={16} />} />
            </aside>

            {/* Mappa centrale */}
            <div className="fixed top-0 left-0 w-full rounded-2xl overflow-hidden border border-slate-200 h-full">
                <MapContainer center={center} zoom={16} scrollWheelZoom className="h-full w-full">
                    <TileLayer
                        // OSM standard; puoi sostituire con satellite (es. MapTiler/Mapbox se vuoi chiavi)
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap'
                    />
                    {TERRITORIES_GEO.map(t => (
                        <TerritoryPolygon key={t.id} t={t} />
                    ))}
                    {TERRITORIES_GEO.flatMap(t => t.sensors?.map(s => (
                        <SensorMarker key={s.id} id={s.id} pos={s.pos} />
                    )) ?? [])}
                </MapContainer>
            </div>

            {/* Quick Summary a destra */}
            {/*<Card className="fixed right-0 p-4 z-5">
                <div className="text-lg font-semibold mb-3">Quick Summary</div>
                <div className="text-sm mb-2 opacity-80">{selected?.name}</div>
                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between text-xs opacity-70">
                            <span>Device status</span><span>OK</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full w-4/5 bg-emerald-400" />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs opacity-70">
                            <span>Signal</span><span>avg: good</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full w-3/4 bg-blue-400" />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs opacity-70">
                            <span>Battery</span><span>60–100%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full w-4/5 bg-amber-400" />
                        </div>
                    </div>
                </div>

                <div className="mt-6 space-y-2">
                    <div className="text-sm font-medium">Azioni rapide</div>
                    <button className="w-full px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200"
                        onClick={() => nav(`/terreni/${selected?.id}/3d`)}
                    >Mostra sezioni e filari in 3D</button>
                    <button className="w-full px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200"
                        onClick={() => nav(`/terreni/${selected?.id}`)}
                    >Apri metriche e KPI</button>
                </div>
            </Card>*/}
        </>
    );
}
