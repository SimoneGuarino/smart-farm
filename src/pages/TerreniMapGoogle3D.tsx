// src/components/map/TerreniMapGoogle3D.tsx
import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { GoogleMap, useJsApiLoader, Polygon, Marker, Libraries } from "@react-google-maps/api";
import MapSummary from "@/components/map/Summary";
import Button from "@/components/ui/buttons/Button";
import IconButton from "@/components/ui/buttons/IconButton";
import { RiArrowLeftWideFill, RiArrowRightWideLine } from "react-icons/ri";
import clsx from "clsx";
import { normalizePaths } from "src/utils/map";
import { useSensorsStore } from "@/stores/useSensorsStore";

import { getAdviceForTerritory } from '@/ai/advisor';
import type { Crop } from '@/ai/types';

import { territories } from "@/config/territories";
import { cropIconSvg, iconToDataUrl } from "src/utils/svgIcons";

import { TbAlertTriangleFilled } from "react-icons/tb";
import { GoAlert } from "react-icons/go";

import { motion } from "framer-motion"


const ArrowLeft = RiArrowLeftWideFill as React.FC<{ size?: number }>;
const ArrowRight = RiArrowRightWideLine as React.FC<{ size?: number }>;
const GoAlertIcon = GoAlert as React.FC<{ size?: number; className: string }>;

const containerStyle: google.maps.MapOptions['styles'] | any = { width: '100%', height: '100%' }
const LIBRARIES: Libraries = ['maps'];

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
        libraries: LIBRARIES
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

    // Mappa: territorio -> presenza di warning/critical dall'advisor (profilato per crop)
    const perTerritoryFlags = useMemo(() => {
        const flags = new Map<string, { hasWarning: boolean; hasCritical: boolean }>();

        normalized.forEach((t) => {
            const sectorIds = t.layout?.sectors?.map((s: any) => s.id) ?? [];
            if (!sectorIds.length) { flags.set(t.id, { hasWarning: false, hasCritical: false }); return; }

            const crop = ((t as any).crop ?? 'field') as Crop;
            const advice = getAdviceForTerritory(t.id, sectorIds, crop);
            const hasCritical = advice.insights.some(i => i.severity === 'critical');
            const hasWarning = advice.insights.some(i => i.severity === 'warning');

            flags.set(t.id, { hasWarning, hasCritical });
        });

        return flags;
    }, [normalized, series]); // <— si aggiorna ad ogni nuovo campione sensori

    return (
        <>
            {/* Backdrop */}
            {terriListBar && <motion.div
                className="fixed inset-0 z-5 bg-black/40 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.2 } }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                onClick={() => setTerriListBar(false)}
                aria-hidden
            />}
            {/* Sidebar sinistra: elenco terreni (stessa UX del tuo file) */}
            <aside
                className={clsx(
                    "bg-white dark:bg-neutral-800 dark:text-gray-300",
                    "fixed z-5 flex flex-col h-full shrink-0 left-0 top-0 p-4",
                    "transition-transform duration-200 ease-in-out",
                    terriListBar ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <p className="text-lg font-semibold mb-3 dark:text-grey-300">Terreni</p>
                <div className="space-y-2">
                    {territories.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setSelectedId(t.id)}
                            className={`w-full text-left px-3 py-2 rounded-xl border 
                                ${selectedId === t.id ? "bg-yellow-50 border-yellow-300 dark:text-gray-800" : "hover:bg-slate-50 border-slate-200 dark:border-neutral-700"}`}
                        >
                            <span className="font-medium">
                                {(perTerritoryFlags.get(t.id)?.hasCritical || perTerritoryFlags.get(t.id)?.hasWarning) &&
                                    <GoAlertIcon className="inline-block mr-1" />}
                                {t.name}</span>
                            <div className="text-xs opacity-70">{t.areaHa} ha</div>
                        </button>
                    ))}
                </div>

                <div className="mt-4 space-y-2">
                    {/* Mantieni i tuoi bottoni: uno porta alla dashboard, uno alla 3D */}
                    <Button className="w-full" onClick={handleOpenSummary}>Apri riepilogo</Button>
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
                                    strokeColor: "#ffae00ff",
                                    strokeOpacity: 0.9,
                                    strokeWeight: 3,
                                    fillColor: "#ffae00ff",
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
                        {/* Marker SEVERITÀ AI: triangoli giallo/rosso accanto alla coltura */}
                        {mapReady && normalized.map(t => {
                            const cx = centroids.find(c => c.id === t.id)?.center;
                            if (!cx) return null;

                            const flags = perTerritoryFlags.get(t.id) ?? { hasWarning: false, hasCritical: false };

                            // offset leggeri per non sovrapporre all'icona della coltura e tra loro
                            const posWarn = { lat: cx.lat + 0.00028, lng: cx.lng - 0.00028 };
                            const posCrit = { lat: cx.lat + 0.00028, lng: cx.lng + 0.00028 };

                            return (
                                <>
                                    {flags.hasWarning && (
                                        <Marker
                                            key={`ai-warn-${t.id}`}
                                            position={posWarn}
                                            icon={iconToDataUrl(<TbAlertTriangleFilled color="#f5ca0bff" />, 36)}
                                            title="Attenzioni presenti (advisor)"
                                            zIndex={350}
                                        />
                                    )}
                                    {flags.hasCritical && (
                                        <Marker
                                            key={`ai-crit-${t.id}`}
                                            position={posCrit}
                                            icon={iconToDataUrl(<TbAlertTriangleFilled color="#DC2626" />, 36)}
                                            title="Problemi critici presenti (advisor)"
                                            zIndex={360}
                                        />
                                    )}
                                </>
                            );
                        })}
                    </GoogleMap>
                )}
            </div>

            {/* Bottone overlay */}
            <button
                onClick={toggle3D}
                className="absolute bottom-25 left-1/2 z-2 
                rounded-xl border border-slate-300 bg-white/90 px-3 py-1.5 text-sm shadow hover:bg-white"
            >
                {tiltOn ? 'Vista 2D' : 'Vista 3D'}
            </button>

            {/* Quick Summary a destra (tuo componente) */}
            <MapSummary t={selected} summaryOpen={summaryOpen} setSummaryOpen={setSummaryOpen} />
        </>
    );
}
