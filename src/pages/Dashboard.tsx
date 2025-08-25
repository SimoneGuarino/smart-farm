import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import TimeSeries from '@/components/charts/TimeSeries'
import { useSensorsStore } from '@/stores/useSensorsStore'
import { useEffect, useMemo, useRef, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import bg from "@/assets/appletree.png";

import { useWeatherStore } from '@/stores/useWeatherStore'
import WeatherPanel from '@/components/meteo/WeatherPanel'
import { territories } from '@/config/territories'
import { cropIcons, cropIconSvg } from '@/utils/svgIcons'

import { motion } from "framer-motion"

type IconKey = keyof typeof cropIcons

type Status = "in_progress" | "not_started" | "done" | "scheduled"

export type FieldCropItem = {
    id: string
    fieldName: string         // es. "Chili Field" / "Settore A"
    crop: string              // es. "Peperoncino"
    icon: IconKey             // nome dell’icona come esportata in cropIcons
    time?: string             // es. "09:00 AM"
    status: Status
}

const statusChip: Record<Status, { label: string; cls: string }> = {
    in_progress: { label: "In Progress", cls: "bg-amber-100 text-amber-800" },
    not_started: { label: "Not Started", cls: "bg-slate-100 text-slate-700" },
    scheduled: { label: "Scheduled", cls: "bg-sky-100 text-sky-700" },
    done: { label: "Done", cls: "bg-emerald-100 text-emerald-700" },
}
export default function Dashboard() {
    const sensors = useSensorsStore(s => s.sensors)
    const series = useSensorsStore(s => s.series)


    const vwc = sensors.filter(s => s.kind === 'VWC')
    const vwcAvg = useMemo(() => {
        const last = vwc.map(s => series[s.id]?.at(-1)?.v).filter(Boolean) as number[]
        return last.length ? last.reduce((a, b) => a + b, 0) / last.length : 0
    }, [vwc, series])


    const pH = series['PH_INLINE']?.at(-1)?.v ?? 0
    const ec = series['EC_INLINE']?.at(-1)?.v ?? 0
    const ppre = series['P_PRE']?.at(-1)?.v ?? 0
    const ppost = series['P_POST']?.at(-1)?.v ?? 0


    const { byTerrain, fetch, loading } = useWeatherStore();
    const terrainId = "T1";
    const lat = 41.590; const lon = 12.830; // <- coordinate del terreno

    useEffect(() => { fetch(terrainId, lat, lon, 'openmeteo'); }, [terrainId, lat, lon, fetch]);
    const meteo = byTerrain[terrainId];


    const viewportRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const [dragBounds, setDragBounds] = useState({ left: 0, right: 0 });

    useEffect(() => {
        const vp = viewportRef.current;
        const tr = trackRef.current;
        if (!vp || !tr) return;
        const maxScroll = tr.scrollWidth - vp.clientWidth;
        setDragBounds({ left: -Math.max(0, maxScroll), right: 0 });
    }, [territories.length]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Background */}
                <div
                    className="absolute inset-0 bg-cover bg-center top-0"
                    style={{ backgroundImage: `url(${bg})` }}
                />
                <div className="w-full h-[55vh]">
                    {/* Overlay scuro leggero per leggibilità */}
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="relative p-6">
                        {meteo
                            ? <WeatherPanel data={meteo} />
                            : <div className="text-white">Caricamento meteo…</div>}
                    </div>

                    {/* Lista dei Terreni con icona crop di cosa si sta coltivando */}
                    <div className="relative">
                        {/* viewport: scroll nativo + snap + scrollbar nascosta */}
                        <div
                            ref={viewportRef}
                            className="overflow-x-auto pb-1 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        >
                            {/* track: flex + drag framer-motion */}
                            <motion.div
                                ref={trackRef}
                                className="flex w-full gap-3 pl-6 pr-6 touch-pan-x"
                                drag="x"
                                dragElastic={0.04}
                                dragConstraints={dragBounds}
                            >
                                {territories.map((it, i) => {
                                    const sc = statusChip[it.status];

                                    return (
                                        <motion.div
                                            key={it.id}
                                            className="snap-start pt-10"
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.35, delay: i * 0.06, ease: "easeOut" }}
                                            whileHover={{ y: -2 }}
                                        >
                                            <Card
                                                className="relative min-w-[150px] p-4 flex flex-col items-center border-none
                                                rounded-2xl shadow-sm text-center bg-white/85 backdrop-blur-md"
                                            >
                                                {/* Icona coltura (via data-uri) */}
                                                <motion.img
                                                    src={cropIconSvg(it.crop)}
                                                    alt={it.crop}
                                                    className="w-12 h-12 absolute -top-6"
                                                    draggable={false}
                                                    initial={{ scale: 0, y: -10, opacity: 0 }}
                                                    animate={{ scale: 1, y: 0, opacity: 1 }}
                                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                />

                                                <div className="mt-6">
                                                    <div className="text-xs text-slate-700 leading-tight">{it.name}</div>
                                                    <div className="text-xl font-semibold">{it.crop}</div>
                                                </div>

                                                <span className={`mt-2 text-xs px-2 py-0.5 rounded-full ${sc.cls}`}>{sc.label}</span>
                                            </Card>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        </div>

                        {/* fade edges (opzionale, migliora la percezione di scroll) */}
                        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/10 to-transparent rounded-l-2xl" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/10 to-transparent rounded-r-2xl" />
                    </div>
                </div>

                <div className='bg-white relative p-6 space-y-4 rounded-tr-4xl rounded-tl-4xl'>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="p-4">
                            <div className="text-sm text-slate-500">Umidità suolo (media)</div>
                            <div className="text-3xl font-semibold">{vwcAvg.toFixed(1)} <span className="text-base">% v/v</span></div>
                            <div className="mt-2">{vwcAvg < 22 ? <Badge tone="warn">Bassa</Badge> : vwcAvg > 30 ? <Badge tone="warn">Alta</Badge> : <Badge tone="ok">Ottimale</Badge>}</div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-sm text-slate-500">pH in linea</div>
                            <div className="text-3xl font-semibold">{pH.toFixed(2)}</div>
                            <div className="mt-2">{pH < 5.0 || pH > 5.8 ? <Badge tone="warn">Correggere</Badge> : <Badge tone="ok">OK</Badge>}</div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-sm text-slate-500">EC in linea</div>
                            <div className="text-3xl font-semibold">{ec.toFixed(2)} <span className="text-base">mS/cm</span></div>
                            <div className="mt-2">{ec > 1.5 ? <Badge tone="warn">Alta</Badge> : <Badge tone="ok">OK</Badge>}</div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-sm text-slate-500">Δ Pressione filtro</div>
                            <div className="text-3xl font-semibold">{(ppre - ppost).toFixed(2)} <span className="text-base">bar</span></div>
                            <div className="mt-2">{ppre - ppost > 0.6 ? <Badge tone="warn">Lavaggio</Badge> : <Badge tone="ok">OK</Badge>}</div>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card className="p-4">
                            <div className="font-medium mb-2">Andamento pH/EC in linea</div>
                            <TimeSeries data={series['PH_INLINE'] ?? []} />
                            <TimeSeries data={series['EC_INLINE'] ?? []} />
                        </Card>
                        <Card className="p-4">
                            <div className="font-medium mb-2">Umidità suolo (VWC) – campione</div>
                            <TimeSeries data={(series['VWC_1_20'] ?? [])} unit="%" />
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}