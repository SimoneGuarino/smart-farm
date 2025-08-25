// src/components/map/TerreniMapGoogle3D.tsx
import { useMemo, useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Polygon, Marker } from "@react-google-maps/api";
import { TERRITORIES_GEO } from "@/config/territories.geo";
import MapSummary from "@/components/map/Summary";
import Button from "@/components/ui/buttons/Button";
import IconButton from "@/components/ui/buttons/IconButton";
import { RiArrowLeftWideFill, RiArrowRightWideLine } from "react-icons/ri";
import clsx from "clsx";
import { normalizePaths, toLLAuto } from "src/utils/map";

const ArrowLeft = RiArrowLeftWideFill as React.FC<{ size?: number }>;
const ArrowRight = RiArrowRightWideLine as React.FC<{ size?: number }>;

const containerStyle = { width: "100%", height: "100%" };

export default function TerreniMapGoogle3D() {
    const [terriListBar, setTerriListBar] = useState(false);
    const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
    const [summaryOpen, setSummaryOpen] = useState(false);
    const handleOpenSummary = () => setSummaryOpen(true);

    // centro mappa = media semplice dei centroidi dei poligoni (come nel tuo TerreniMap)
    const center = useMemo(() => {
        const all = TERRITORIES_GEO.flatMap(t => t.polygon);
        const lat = all.reduce((a, b) => a + b[0], 0) / all.length;
        const lng = all.reduce((a, b) => a + b[1], 0) / all.length;
        return { lat, lng };
    }, []);

    const selected = TERRITORIES_GEO.find(t => t.id === selectedId) ?? TERRITORIES_GEO[0];

    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY as string,
        // consigliato: abilita vector maps (di default) e mapId se ne hai uno custom
    });

    const onLoad = useCallback((map: google.maps.Map) => {
        const bounds = new google.maps.LatLngBounds()
        TERRITORIES_GEO.forEach(t => {
            const paths = normalizePaths(t.polygon)
            const rings = Array.isArray(paths[0]) ? (paths as google.maps.LatLngLiteral[][]) : [paths as google.maps.LatLngLiteral[]]
            rings.forEach(ring => ring.forEach(pt => bounds.extend(pt)))
        })
        map.fitBounds(bounds)
        map.setTilt(67.5)
        map.setHeading(25)
    }, [])
    return (
        <>
            {/* Sidebar sinistra: elenco terreni (stessa UX del tuo file) */}
            <aside
                className={clsx(
                    "bg-white",
                    "fixed z-5 flex flex-col h-full shrink-0 left-0 top-0 p-4",
                    "transition-transform duration-200 ease-in-out",
                    terriListBar ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="text-lg font-semibold mb-3">Terreni</div>
                <div className="space-y-2">
                    {TERRITORIES_GEO.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setSelectedId(t.id)}
                            className={`w-full text-left px-3 py-2 rounded-xl border ${selectedId === t.id ? "bg-yellow-50 border-yellow-300" : "hover:bg-slate-50 border-slate-200"}`}
                        >
                            <div className="font-medium">{t.name}</div>
                            <div className="text-xs opacity-70">{t.areaHa} ha</div>
                        </button>
                    ))}
                </div>

                <div className="mt-4 space-y-2">
                    {/* Mantieni i tuoi bottoni: uno porta alla dashboard, uno alla 3D */}
                    <Button className="w-full" onClick={handleOpenSummary}>Apri quick summary</Button>
                </div>

                <IconButton
                    variant="secondary"
                    className="absolute top-1/2 -right-8 z-10 h-20 rounded-none"
                    onClick={() => setTerriListBar(!terriListBar)}
                    icon={<ArrowRight size={16} />}
                />
            </aside>

            {/* Mappa centrale */}
            <div className="fixed top-0 left-0 w-full h-full">
                {isLoaded && (
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={center}
                        zoom={16}
                        onLoad={onLoad}
                        options={{
                            mapTypeId: "satellite",
                            tilt: 67.5,            // iniziale (riapplicato anche in onLoad)
                            heading: 25,
                            gestureHandling: "greedy",
                            disableDefaultUI: true,
                            clickableIcons: false,
                        }}
                    >
                        {/* Poligoni */}
                        {TERRITORIES_GEO.map(t => (
                            <Polygon
                                key={t.id}
                                paths={normalizePaths(t.polygon)}
                                options={{
                                    strokeColor: "#22c55e",
                                    strokeOpacity: 0.9,
                                    strokeWeight: 2,
                                    fillColor: "#22c55e",
                                    fillOpacity: 0.15,
                                }}
                                onClick={() => { setSelectedId(t.id); handleOpenSummary(); }}
                            />
                        ))}

                        {/* Marker sonde */}
                        {TERRITORIES_GEO.flatMap(t =>
                            t.sensors?.map(s => (
                                <Marker
                                    key={s.id}
                                    position={toLLAuto(s.pos as [number, number])}
                                    title={s.id}
                                />
                            )) ?? []
                        )}
                    </GoogleMap>
                )}
            </div>

            {/* Quick Summary a destra (tuo componente) */}
            <MapSummary selected={selected} summaryOpen={summaryOpen} setSummaryOpen={setSummaryOpen} />
        </>
    );
}
