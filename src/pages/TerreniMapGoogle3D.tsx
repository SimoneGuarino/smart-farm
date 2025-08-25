// src/components/map/TerreniMapGoogle3D.tsx
import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { GoogleMap, useJsApiLoader, Polygon, Marker } from "@react-google-maps/api";
import MapSummary from "@/components/map/Summary";
import Button from "@/components/ui/buttons/Button";
import IconButton from "@/components/ui/buttons/IconButton";
import { RiArrowLeftWideFill, RiArrowRightWideLine } from "react-icons/ri";
import clsx from "clsx";
import { normalizePaths } from "src/utils/map";
import { useSensorsStore } from "@/stores/useSensorsStore";

import { territories } from "@/config/territories";

const ArrowLeft = RiArrowLeftWideFill as React.FC<{ size?: number }>;
const ArrowRight = RiArrowRightWideLine as React.FC<{ size?: number }>;

const containerStyle: google.maps.MapOptions['styles'] | any = { width: '100%', height: '100%' }

const cropIconSvg = (crop?: string) => {
    const icons: Record<string, string> = {
        chili: `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'>
               <circle cx='12' cy='12' r='11' fill='#fff6e6' stroke='#eab308' stroke-width='1.5'/>
               <path d='M7 14c4 0 6-4 9-4 1.6 0 2.8 1.3 2.8 2.9 0 3.8-3.8 6.5-7.8 6.5S5 17.9 5 15c0-0.6.1-1.2.3-1.7' fill='#ef4444'/>
               <path d='M15 9c-.2-1.8 1.6-3.3 3.1-2.4' stroke='#16a34a' stroke-width='1.5' fill='none'/>
             </svg>`,
        corn: `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'>
               <circle cx='12' cy='12' r='11' fill='#f0fdf4' stroke='#10b981' stroke-width='1.5'/>
               <path d='M12 5c2.5 0 4 2.5 4 6s-1.5 8-4 8-4-4.5-4-8 1.5-6 4-6z' fill='#f59e0b'/>
               <path d='M8 9c2 1 6 1 8 0' stroke='#a16207' stroke-width='1' fill='none'/>
             </svg>`,
        carrot: `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'>
               <circle cx='12' cy='12' r='11' fill='#fefce8' stroke='#f59e0b' stroke-width='1.5'/>
               <path d='M7 15l7-7 3 3-7 7-4 1z' fill='#fb923c'/>
               <path d='M14 7l2-3 3 2' stroke='#22c55e' stroke-width='1.5' fill='none'/>
             </svg>`,
        field: `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'>
               <rect x='2' y='2' width='20' height='20' rx='10' fill='#e2f3d6' stroke='#84cc16' stroke-width='1.5'/>
               <path d='M4 16c4-2 8-2 16 0M4 12c6-2 10-2 16 0' stroke='#65a30d' stroke-width='1.2' fill='none'/>
             </svg>`,
        blueberry: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="23" fill="#EEF2FF" stroke="#6366F1" stroke-width="1.5"/>
          <!-- bacche -->
          <circle cx="20" cy="27" r="8" fill="#3B82F6"/>
          <circle cx="28" cy="21" r="8" fill="#2563EB"/>
          <!-- calici -->
          <path d="M20 22.6l2 1.2-0.7 2.1 1.9 1.4-2.3.1-0.9 2-0.9-2-2.3-.1 1.9-1.4-0.7-2.1z" fill="#1E40AF" opacity=".9"/>
          <path d="M28 16.6l2 1.2-0.7 2.1 1.9 1.4-2.3.1-0.9 2-0.9-2-2.3-.1 1.9-1.4-0.7-2.1z" fill="#1E40AF" opacity=".9"/>
          <!-- foglioline -->
          <path d="M29 12c2.8 0 4.2 1.3 5 3-2.2.7-4.5.4-6.2-1.2 0 0 .8-1.8 1.2-1.8z" fill="#16A34A"/>
          <path d="M24 13c-1.8-1.1-3.6-1.1-5.5-.3.5 1.9 2 3.1 4 3.3 0 0 1.5-1.7 1.5-3z" fill="#22C55E"/>
        </svg>`,
        raspberry: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="23" fill="#FEE2E2" stroke="#EF4444" stroke-width="1.5"/>
          <path d="M16 22c-2 0-4-2-4-4s2-4 4-4 4 2 4 4-2 4-4 4z" fill="#F87171"/>
          <path d="M32 22c-2 0-4-2-4-4s2-4 4-4 4 2 4 4-2 4-4 4z" fill="#F87171"/>
        </svg>`,
        blackberry: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="23" fill="#E5E7EB" stroke="#6B7280" stroke-width="1.5"/>
          <path d="M16 22c-2 0-4-2-4-4s2-4 4-4 4 2 4 4-2 4-4 4z" fill="#FBBF24"/>
          <path d="M32 22c-2 0-4-2-4-4s2-4 4-4 4 2 4 4-2 4-4 4z" fill="#FBBF24"/>
        </svg>`
    }
    const svg = icons[crop ?? 'field'] ?? icons.field
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg)
}

// Icona ALERT acqua bassa
const waterAlertSvg = () =>
    'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24'>
       <circle cx='12' cy='12' r='11' fill='#fff' stroke='#f43f5e' stroke-width='1.5'/>
       <path d='M12 4c3 4 5 6 5 9a5 5 0 1 1-10 0c0-3 2-5 5-9z' fill='#ef4444'/>
       <circle cx='12' cy='12' r='2' fill='#fff' opacity='0.6'/>
     </svg>`
    )

export default function TerreniMapGoogle3D() {
    const [terriListBar, setTerriListBar] = useState(false);
    const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
    const [summaryOpen, setSummaryOpen] = useState(false);
    const handleOpenSummary = () => setSummaryOpen(true);

    const [tiltOn, setTiltOn] = useState(false)
    const mapRef = useRef<google.maps.Map | null>(null)
    const [mapReady, setMapReady] = useState(false);
    const didFit = useRef(false);

    const selected = territories.find(t => t.id === selectedId) ?? territories[0];

    const { isLoaded } = useJsApiLoader({
        id: "gmaps-3d", //"google-map-script",
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY as string,
        libraries: ['maps']
        // consigliato: abilita vector maps (di default) e mapId se ne hai uno custom
    });

    const normalized = useMemo(() => {
        return territories.map(t => ({
            ...t,
            paths: normalizePaths(t.geo.polygon)
        }));
    }, []); // territories è statico: ok deps vuote

    const initialCenter = useMemo(() => {
        const first = normalized[0]?.paths as any;
        const pt = Array.isArray(first?.[0]) ? first[0][0] : first?.[0];
        return pt ?? { lat: 41.9, lng: 12.5 };
    }, [normalized]);

    // centroid semplice per singolo anello; se multipoligono prendo il primo anello
    const centroids = useMemo(() => {
        return normalized.map(t => {
            const rings = Array.isArray((t.paths as any)[0])
                ? (t.paths as google.maps.LatLngLiteral[][])
                : [t.paths as google.maps.LatLngLiteral[]]
            const ring = rings[0] ?? []
            if (!ring.length) return { id: t.id, center: null as google.maps.LatLngLiteral | null }
            const { x, y } = ring.reduce((acc, p) => ({ x: acc.x + p.lng, y: acc.y + p.lat }), { x: 0, y: 0 })
            return { id: t.id, center: { lat: y / ring.length, lng: x / ring.length } }
        })
    }, [normalized]);


    const sensors = useSensorsStore(s => s.sensors)
    const series = useSensorsStore(s => s.series)

    const vwcByTerritory = useMemo(() => {
        // mappa terrenoId -> media VWC ultimi valori
        const map = new Map<string, number>()
        normalized.forEach(t => {
            const vwcSensors = sensors.filter(s => s.kind === 'VWC' && s.sector && (t.layout.sectors?.find(sec => sec.id === s.sector)))
            // se non hai sectors nel territories.geo, filtra per “area” come preferisci

            const lastVals = vwcSensors
                .map(s => series[s.id]?.at(-1)?.v)
                .filter((v): v is number => typeof v === 'number')

            const avg = lastVals.length ? lastVals.reduce((a, b) => a + b, 0) / lastVals.length : NaN
            map.set(t.id, avg)
        })
        return map
    }, [normalized, sensors, series])


    const onIdle = useCallback(() => {
        // primo idle => mappa “stabile”
        setMapReady(true);
    }, []);

    const onLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map
    }, []);
    const onUnmount = () => { mapRef && (mapRef.current = null) };

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
    }, [tiltOn]);

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
                    {territories.map(t => (
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
                                    strokeColor: "#fbff00ff",
                                    strokeOpacity: 0.9,
                                    strokeWeight: 3,
                                    fillColor: "#fbff00ff",
                                    fillOpacity: 0.2,
                                }}
                                onClick={() => { setSelectedId(t.id); handleOpenSummary(); }}
                            />
                        ))}

                        {/* Marker COLTURA per ogni terreno */}
                        {mapReady && normalized.map(t => {
                            const cx = centroids.find(c => c.id === t.id)?.center
                            const crop = (t as any).crop as string | undefined  // es. 'chili' | 'corn' | 'carrot'
                            if (!cx) return null
                            return (
                                <Marker
                                    key={`crop-${t.id}`}
                                    position={cx}
                                    icon={{
                                        url: cropIconSvg(crop),
                                        scaledSize: new google.maps.Size(48, 48),
                                        anchor: new google.maps.Point(24, 24),
                                    }}
                                    title={crop ? `Coltura: ${crop}` : 'Coltura'}
                                    zIndex={200}
                                />
                            )
                        })}

                        {/* Marker ALERT acqua bassa (VWC < 22%) */}
                        {mapReady && normalized.map(t => {
                            const cx = centroids.find(c => c.id === t.id)?.center
                            const avg = vwcByTerritory.get(t.id)
                            const needsWater = typeof avg === 'number' && avg < 22
                            if (!cx || !needsWater) return null
                            // leggera traslazione per non sovrapporre alla pillola coltura
                            const pos = { lat: cx.lat + 0.00025, lng: cx.lng + 0.00025 }
                            return (
                                <Marker
                                    key={`alert-water-${t.id}`}
                                    position={pos}
                                    icon={{
                                        url: waterAlertSvg(),
                                        scaledSize: new google.maps.Size(40, 40),
                                        anchor: new google.maps.Point(20, 20),
                                    }}
                                    title={`Acqua bassa – VWC medio: ${avg?.toFixed(1)}%`}
                                    zIndex={300}
                                />
                            )
                        })}
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
