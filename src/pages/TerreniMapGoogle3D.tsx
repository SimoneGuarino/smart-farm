// src/components/map/TerreniMapGoogle3D.tsx
import { useMemo, useState, useCallback, useEffect, useRef } from "react";
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

const containerStyle: google.maps.MapOptions['styles'] | any = { width: '100%', height: '100%' }

export default function TerreniMapGoogle3D() {
    const [terriListBar, setTerriListBar] = useState(false);
    const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
    const [summaryOpen, setSummaryOpen] = useState(false);
    const handleOpenSummary = () => setSummaryOpen(true);

    const [tiltOn, setTiltOn] = useState(false)
    const mapRef = useRef<google.maps.Map | null>(null)
    const [mapReady, setMapReady] = useState(false);
    const didFit = useRef(false);

    const selected = TERRITORIES_GEO.find(t => t.id === selectedId) ?? TERRITORIES_GEO[0];

    const { isLoaded } = useJsApiLoader({
        id: "gmaps-3d", //"google-map-script",
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY as string,
        libraries: ['maps']
        // consigliato: abilita vector maps (di default) e mapId se ne hai uno custom
    });

    const normalized = useMemo(() => {
        return TERRITORIES_GEO.map(t => ({
            ...t,
            paths: normalizePaths(t.polygon)
        }));
    }, []); // TERRITORIES_GEO è statico: ok deps vuote

    const initialCenter = useMemo(() => {
        const first = normalized[0]?.paths as any;
        const pt = Array.isArray(first?.[0]) ? first[0][0] : first?.[0];
        return pt ?? { lat: 41.9, lng: 12.5 };
    }, [normalized]);


    const onIdle = useCallback(() => {
        // primo idle => mappa “stabile”
        setMapReady(true);
    }, []);

    const onLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map
    }, []);

    const onUnmount = () => { mapRef && (mapRef.current = null) }

    const toggle3D = useCallback(() => {
        const map = mapRef.current
        if (!map) return

        if (tiltOn) {
            // Torna 2D
            map.setTilt(0)
            map.setHeading(0)
            setTiltOn(false)
        } else {
            // Attiva 3D (tilt max ~67.5). Heading opzionale per “obliquo”
            map.setTilt(47.5)
            map.setHeading(35)
            setTiltOn(true)
        }
    }, [tiltOn])

    useEffect(() => {
        if (!mapRef || !mapReady || didFit.current) return;

        const bounds = new google.maps.LatLngBounds();
        normalized.forEach(t => {
            const rings = Array.isArray((t.paths as any)[0])
                ? (t.paths as google.maps.LatLngLiteral[][])
                : [t.paths as google.maps.LatLngLiteral[]];
            rings.forEach(r => r.forEach(pt => bounds.extend(pt)));
        });

        if (!bounds.isEmpty()) {
            mapRef.current?.fitBounds(bounds);
            // settiamo 3D un frame dopo il fit
            requestAnimationFrame(() => {
                mapRef.current?.setTilt(47.5);
                mapRef.current?.setHeading(25);
            });
            didFit.current = true;
        }
    }, [mapRef, mapReady, normalized]);



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
                        center={initialCenter}
                        zoom={16}
                        onLoad={onLoad}
                        onIdle={onIdle}
                        onUnmount={onUnmount}
                        options={{
                            mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string,
                            mapTypeId: "satellite",
                            gestureHandling: "greedy",
                            disableDefaultUI: true,
                            clickableIcons: false,
                        }}
                    >
                        {mapReady && normalized.map(t => (
                            <Polygon
                                key={t.id}
                                paths={t.paths} // attenzione: "paths", non "path"
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

                        {mapReady && normalized.flatMap(t =>
                            (t.sensors ?? []).map(s => (
                                <Marker
                                    key={s.id}
                                    position={toLLAuto(s.pos as [number, number])}
                                    title={s.id}
                                />
                            ))
                        )}
                    </GoogleMap>
                )}
            </div>

            {/* Bottone overlay */}
            <button
                onClick={toggle3D}
                className="absolute bottom-25 left-1/2 z-10 
                rounded-xl border border-slate-300 bg-white/90 px-3 py-1.5 text-sm shadow hover:bg-white"
            >
                {tiltOn ? 'Vista 2D' : 'Vista 3D'}
            </button>

            {/* Quick Summary a destra (tuo componente) */}
            <MapSummary selected={selected} summaryOpen={summaryOpen} setSummaryOpen={setSummaryOpen} />
        </>
    );
}
