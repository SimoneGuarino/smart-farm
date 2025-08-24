import { MapContainer, TileLayer } from "react-leaflet";
import TerritoryPolygon from "@/components/map/TerritoryPolygon";
import SensorMarker from "@/components/map/SensorMarker";
import { TERRITORIES_GEO } from "@/config/territories.geo";
import Card from "@/components/ui/Card";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";

export default function TerreniMap() {
    const nav = useNavigate();
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
        <DashboardLayout>
            <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr_320px] gap-4 items-start">
            {/* Sidebar sinistra: elenco terreni */}
            <Card className="p-4 h-[calc(100vh-120px)] overflow-auto">
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
                <div className="mt-4">
                    <button
                        className="w-full px-3 py-2 rounded-xl bg-brand-600 text-white"
                        onClick={() => nav(`/terreni/${selected?.id}`)}
                    >Apri dashboard terreno</button>
                    <button
                        className="w-full mt-2 px-3 py-2 rounded-xl bg-slate-900 text-white"
                        onClick={() => nav(`/terreni/${selected?.id}/3d`)}
                    >Apri vista 3D</button>
                </div>
            </Card>

            {/* Mappa centrale */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 h-[calc(100vh-120px)]">
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
            <Card className="p-4 h-[calc(100vh-120px)]">
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
            </Card>
            </div>
        </DashboardLayout>
    );
}
