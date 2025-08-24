import { useNavigate } from "react-router-dom"
import { AnimatePresence, motion, Variants } from "framer-motion"

import { IoWaterOutline, IoCloseOutline } from "react-icons/io5"
import { LuGlassWater } from "react-icons/lu"
import { BsBadge3D } from "react-icons/bs"
import { MdOutlineEnergySavingsLeaf } from "react-icons/md"
import { IoLayersOutline } from "react-icons/io5"
import { PiNetwork } from "react-icons/pi"

import { TerritoryGeo } from "@/types/geo"
import { territories } from "@/config/territories"
import { useSensorsStore } from "@/stores/useSensorsStore"

import Card from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import IconButton from "../ui/buttons/IconButton"
import Weather from "../layout/Weather"

const WaterIcon = IoWaterOutline as React.FC<{ size?: number }>
const PhIcon = LuGlassWater as React.FC<{ size?: number }>
const D3Icon = BsBadge3D as React.FC<{ size?: number }>
const EnergyIcon = MdOutlineEnergySavingsLeaf as React.FC<{ size?: number }>
const LayersIcon = IoLayersOutline as React.FC<{ size?: number }>
const NetworkIcon = PiNetwork as React.FC<{ size?: number }>
const CloseIcon = IoCloseOutline as React.FC<{ size?: number; className?: string }>

// Variants per il foglio
const sheetVariants: Variants = {
    open: {
        y: 0,
        transition: { type: "spring", stiffness: 380, damping: 30, mass: 0.7 }
    },
    closed: {
        y: "100%",
        transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } // ease-out morbida
    }
}

// Variants per piccoli ingressi interni (opzionale)
const contentStagger: Variants = {
    open: { transition: { staggerChildren: 0.05, delayChildren: 0.06 } },
    closed: {}
}
const item: Variants = {
    open: { opacity: 1, y: 0, transition: { duration: 0.22 } },
    closed: { opacity: 0, y: 8, transition: { duration: 0.12 } }
}

export default function MapSummary({
    selected,
    summaryOpen,
    setSummaryOpen
}: {
    selected: TerritoryGeo
    summaryOpen: boolean
    setSummaryOpen: (open: boolean) => void
}) {
    const nav = useNavigate()
    const tid = selected.id

    const t = territories.find((x) => x.id === tid)
    const sensors = useSensorsStore((s) => s.sensors.filter((k) => k.territoryId === tid))
    const series = useSensorsStore((s) => s.series)

    const pH = series[`PH_INLINE_${tid}`]?.at(-1)?.v ?? 0
    const ec = series[`EC_INLINE_${tid}`]?.at(-1)?.v ?? 0

    if (!t) return <div>Terreno non trovato</div>

    return (
        <AnimatePresence>
            {summaryOpen && (
                <>
                    {/* Backdrop con fade; chiude al click */}
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
                        className="fixed bottom-0 left-0 right-0 z-50"
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={sheetVariants}

                        // ——— Drag-to-close opzionale: sblocca se ti piace il gesto
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={0.12}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 120) setSummaryOpen(false)
                        }}
                    >
                        <motion.div
                            variants={contentStagger}
                            className="mx-auto w-full max-w-6xl h-[75vh] rounded-t-2xl border border-white/10 bg-neutral-900/90 text-white shadow-2xl"
                            onClick={(e) => e.stopPropagation()} // evita di chiudere cliccando dentro
                        >
                            {/* Handle / header */}
                            <motion.div variants={item} className="px-4 pt-3">
                                <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-white/30" />
                            </motion.div>

                            {/* Header superiore (nome + azioni) */}
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
                            <motion.div variants={item} className="overflow-auto p-4 space-y-6">
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
                                        <div className="text-sm">Settori</div>
                                        <div className="text-3xl font-semibold">{t.layout.sectors.length}</div>
                                    </Card>
                                </div>

                                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-black">
                                    {t.layout.sectors.map((s) => (
                                        <Card variant="dark" key={s.id} className="p-3">
                                            <div className="text-sm">Settore</div>
                                            <div className="text-xl font-semibold">{s.id}</div>
                                            <div className="text-sm mt-1 text-neutral-500">File: {s.rows.join(", ")}</div>
                                        </Card>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
