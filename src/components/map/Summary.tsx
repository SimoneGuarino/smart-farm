import { useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { AnimatePresence, motion, Variants } from "framer-motion"
import TimeSeries from "@/components/charts/TimeSeries"

import { IoWaterOutline, IoCloseOutline } from "react-icons/io5"
import { LuGlassWater } from "react-icons/lu"
import { BsBadge3D } from "react-icons/bs"
import { MdOutlineEnergySavingsLeaf } from "react-icons/md"
import { IoLayersOutline } from "react-icons/io5"
import { PiNetwork } from "react-icons/pi"

import { territories } from "@/config/territories"
import { useSensorsStore } from "@/stores/useSensorsStore"

import Card from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import IconButton from "../ui/buttons/IconButton"
import Weather from "../layout/Weather"
import { Territory } from "@/types/farm"

const WaterIcon = IoWaterOutline as React.FC<{ size?: number }>
const PhIcon = LuGlassWater as React.FC<{ size?: number }>
const D3Icon = BsBadge3D as React.FC<{ size?: number }>
const EnergyIcon = MdOutlineEnergySavingsLeaf as React.FC<{ size?: number }>
const LayersIcon = IoLayersOutline as React.FC<{ size?: number }>
const NetworkIcon = PiNetwork as React.FC<{ size?: number }>
const CloseIcon = IoCloseOutline as React.FC<{ size?: number; className?: string }>

// Variants per il foglio
const sheetVariants: Variants = {
    open: { y: 0, transition: { type: "spring", stiffness: 380, damping: 30, mass: 0.7 } },
    closed: { y: "100%", transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }
}

// Variants interni (ingressi leggeri)
const contentStagger: Variants = { open: { transition: { staggerChildren: 0.05, delayChildren: 0.06 } }, closed: {} }
const item: Variants = { open: { opacity: 1, y: 0, transition: { duration: 0.22 } }, closed: { opacity: 0, y: 8, transition: { duration: 0.12 } } }

export default function MapSummary({
    selected,
    summaryOpen,
    setSummaryOpen
}: {
    selected: Territory
    summaryOpen: boolean
    setSummaryOpen: (open: boolean) => void
}) {
    const nav = useNavigate()
    const tid = selected.id

    const t = territories.find((x) => x.id === tid)
    const sensors = useSensorsStore((s) => s.sensors.filter((k) => k.territoryId === tid))
    const series = useSensorsStore((s) => s.series)

    // ➜ Fix iOS: misura la porzione di UI che copre il viewport (barra Safari, home indicator)
    useEffect(() => {
        const vv = (window as any).visualViewport
        if (!vv) return
        const setVar = () => {
            // quanto del viewport "visivo" è coperto rispetto a innerHeight
            const obstruct = Math.max(0, window.innerHeight - (vv.height + vv.offsetTop))
            document.documentElement.style.setProperty("--ios-bottom-ui", obstruct + "px")
        }
        setVar()
        vv.addEventListener("resize", setVar)
        vv.addEventListener("scroll", setVar)
        return () => {
            vv.removeEventListener("resize", setVar)
            vv.removeEventListener("scroll", setVar)
        }
    }, [])

    if (!t) return <div>Terreno non trovato</div>

    // valore comodo da riusare nei style
    const bottomOffset = "max(var(--ios-bottom-ui, 0px), env(safe-area-inset-bottom))"
    // --- DERIVATE TOP-LEVEL (niente hook dentro IIFE/condizioni!) ---
    const vwcSensors = useMemo(
        () => sensors.filter((s) => s.kind === "VWC"),
        [sensors]
    )

    const vwcAvg = useMemo(() => {
        const lastVals = vwcSensors
            .map((s) => series[s.id]?.at(-1)?.v)
            .filter((v): v is number => typeof v === "number")
        return lastVals.length ? lastVals.reduce((a, b) => a + b, 0) / lastVals.length : 0
    }, [vwcSensors, series])

    const sampleId = vwcSensors[0]?.id ?? null
    const sampleSeries = useMemo(
        () => (sampleId ? (series[sampleId] ?? []) : []),
        [sampleId, series]
    )

    // dedup lista sonde (come in Sensors.tsx)
    const dedupList = useMemo(() => {
        const map = new Map<string, typeof sensors[number]>()
        for (const s of sensors) if (!map.has(s.id)) map.set(s.id, s)
        return Array.from(map.values())
    }, [sensors]);

    /**
     * Restituisce l'ultimo valore disponibile per una sonda dato il suo id.
     * @param sensorId id della sonda
     * @returns valore numerico o null se non disponibile
     */
    function getLastValueById(sensorId: string): number | null {
        const data = series[sensorId];
        if (!data || data.length === 0) return null;
        const last = data.at(-1);
        return typeof last?.v === "number" ? last.v : null;
    };

    const pH = getLastValueById(`PH_INLINE`) ?? 0
    const ec = getLastValueById(`EC_INLINE`) ?? 0
    // Δ pressione filtro (se pubblichi le chiavi per-terreno)
    const ppre = getLastValueById(`P_PRE`) ?? 0
    const ppost = getLastValueById(`P_POST`) ?? 0
    const delta = ppre - ppost

    useEffect(() => console.log(dedupList), [dedupList])

    return (
        <AnimatePresence>
            {summaryOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { duration: 0.2 } }}
                        exit={{ opacity: 0, transition: { duration: 0.2 } }}
                        onClick={() => setSummaryOpen(false)}
                        aria-hidden
                    />

                    {/* Bottom sheet */}
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        className="fixed left-0 right-0 z-50 overscroll-contain"
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={sheetVariants}
                        // ➜ ancoriamo SOPRA alla UI iOS (url bar/home) usando la var calcolata + safe-area
                        style={{ bottom: `calc(${bottomOffset})` }}

                        // Drag-to-close
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={0.12}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 120) setSummaryOpen(false)
                        }}
                    >
                        <motion.div
                            variants={contentStagger}
                            className="
                              mx-auto w-full max-w-6xl 
                              h-full         /* svh = altezza con barra visibile */
                              rounded-t-2xl border border-white/10 
                              bg-neutral-900/90 text-white shadow-2xl
                            "
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                // padding extra per evitare che il contenuto tocchi la UI in basso
                                paddingBottom: `max(${bottomOffset}, 16px)`
                            }}
                        >
                            {/* Handle */}
                            <motion.div variants={item} className="px-4 pt-3">
                                <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-white/30" />
                            </motion.div>

                            {/* Header */}
                            <motion.div variants={item} className="flex items-center justify-between p-4">
                                <div>
                                    <div className="text-2xl font-semibold">{t.name}</div>
                                    <div className="text-sm text-neutral-400">
                                        {t.areaHa} ha • Settori {t.layout.sectors.map((s) => s.id).join(", ")}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <IconButton icon={<D3Icon size={25} />} onClick={() => nav(`/terreni/${tid}/3d`)} />
                                    <IconButton variant="danger" icon={<CloseIcon size={25} />} onClick={() => setSummaryOpen(false)} />
                                </div>
                            </motion.div>

                            {/* Meteo */}
                            <motion.div variants={item} className="px-4">
                                <Weather temperature={20} weather={"sunny"} location={"casa"} />
                            </motion.div>

                            {/* Contenuto scrollabile */}
                            <motion.div variants={item} className="overflow-auto p-4 space-y-6 h-[calc(100svh-300px)]">
                                {/* === KPI TOP ROW (LIVE) === */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-black">
                                    <Card variant="dark" className="p-4">
                                        <WaterIcon size={25} />
                                        <div className="text-sm">pH in linea</div>
                                        <div className="text-3xl font-semibold">{pH.toFixed(2)}</div>
                                        <div className="mt-2">
                                            {pH < 5.0 || pH > 5.8 ? <Badge tone="warn">Correggere</Badge> : <Badge tone="ok">OK</Badge>}
                                        </div>
                                    </Card>

                                    <Card variant="dark" className="p-4">
                                        <EnergyIcon size={25} />
                                        <div className="text-sm">EC in linea</div>
                                        <div className="text-3xl font-semibold">
                                            {ec.toFixed(2)} <span className="text-base">mS/cm</span>
                                        </div>
                                        <div className="mt-2">{ec > 1.5 ? <Badge tone="warn">Alta</Badge> : <Badge tone="ok">OK</Badge>}</div>
                                    </Card>

                                    <Card variant="dark" className="p-4">
                                        <NetworkIcon size={25} />
                                        <div className="text-sm">Sonde attive</div>
                                        <div className="text-3xl font-semibold">{sensors.length}</div>
                                    </Card>

                                    <Card variant="dark" className="p-4">
                                        <LayersIcon size={25} />
                                        <div className="text-sm">Δ Pressione filtro</div>
                                        <div className="text-3xl font-semibold">{delta.toFixed(2)} <span className="text-base">bar</span></div>
                                        <div className="mt-2">{delta > 0.6 ? <Badge tone="warn">Lavaggio</Badge> : <Badge tone="ok">OK</Badge>}</div>
                                    </Card>
                                </div>

                                {/* === MEDIA VWC + TREND === */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <Card variant="dark" className="p-4 text-black">
                                        <div className="text-sm text-neutral-300">Umidità suolo media (VWC)</div>
                                        <div className="text-3xl font-semibold text-white">
                                            {vwcAvg ? vwcAvg.toFixed(1) : "—"} <span className="text-base">% v/v</span>
                                        </div>
                                        <div className="mt-2">
                                            {vwcAvg === 0 ? (
                                                <Badge tone="warn">N/D</Badge>
                                            ) : vwcAvg < 22 ? (
                                                <Badge tone="warn">Bassa</Badge>
                                            ) : vwcAvg > 30 ? (
                                                <Badge tone="warn">Alta</Badge>
                                            ) : (
                                                <Badge tone="ok">Ottimale</Badge>
                                            )}
                                        </div>
                                    </Card>

                                    <Card variant="dark" className="p-4">
                                        <div className="font-medium mb-2">Trend pH & EC (ultimi 10 min)</div>
                                        <div className="space-y-3">
                                            {/* Se non usi TimeSeries nel progetto, puoi rimuovere queste due righe */}
                                            <TimeSeries data={series[`PH_INLINE`] ?? []} />
                                            <TimeSeries data={series[`EC_INLINE`] ?? []} />
                                        </div>
                                    </Card>

                                    <Card variant="dark" className="p-4 lg:col-span-2">
                                        <div className="font-medium mb-2">VWC – campione sonda</div>
                                        {/* opzionale: rimuovi se TimeSeries non c'è */}
                                        <TimeSeries data={sampleSeries} unit="%" />
                                        <div className="text-xs text-neutral-400 mt-1">
                                            {sampleId ? `Sonda: ${sampleId}` : "Nessuna sonda VWC disponibile in questo terreno"}
                                        </div>
                                    </Card>
                                </div>

                                {/* === RIASSUNTO PER SETTORE === */}
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-black">
                                    {t.layout.sectors.map((sec) => {
                                        const secVWCs = vwcSensors.filter((s) => s.sector === sec.id)
                                        const lastVals = secVWCs
                                            .map((s) => series[s.id]?.at(-1)?.v)
                                            .filter((v): v is number => typeof v === "number")
                                        const avg = lastVals.length ? lastVals.reduce((a, b) => a + b, 0) / lastVals.length : 0

                                        const tone = avg === 0 ? "warn" : avg < 22 ? "warn" : avg > 30 ? "warn" : "ok"
                                        const label = avg === 0 ? "N/D" : avg < 22 ? "Bassa" : avg > 30 ? "Alta" : "Ottimale"

                                        return (
                                            <Card variant="dark" key={sec.id} className="p-3">
                                                <div className="text-sm">Settore {sec.id}</div>
                                                <div className="text-xl font-semibold">{avg ? avg.toFixed(1) : "—"}%</div>
                                                <div className="text-xs text-neutral-400">File: {sec.rows.join(", ")}</div>
                                                <div className="mt-1"><Badge tone={tone as any}>{label}</Badge></div>
                                            </Card>
                                        )
                                    })}
                                </div>

                                {/* === LISTA SONDE (dedup) === */}
                                <div className="grid grid-cols-3 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                    {dedupList.filter((s) => !(["PH_INLINE", "EC_INLINE", "P_PRE", "P_POST"]
                                    .includes(s.id))).map((s) => {
                                        const last = series[s.id]?.at(-1)?.v
                                        return (
                                            <Card key={s.id} variant="dark" className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="font-medium">{s.label}</div>
                                                </div>
                                                <div className="text-2xl mt-1 text-white">
                                                    {typeof last === "number" ? last.toFixed(2) : "—"} <span className="text-base">{s.unit}</span>
                                                </div>
                                                <div className="text-xs text-neutral-400 mt-1">
                                                    {s.sector ? `Settore ${s.sector}` : ""} {s.row ? `• Fila ${s.row}` : ""} {s.depthCm ? `• ${s.depthCm} cm` : ""}
                                                </div>
                                            </Card>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
