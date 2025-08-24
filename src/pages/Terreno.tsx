import { useParams, Link } from 'react-router-dom'
import { territories } from '@/config/territories'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { useSensorsStore } from '@/stores/useSensorsStore'
import { useMemo, useEffect } from 'react'
import { useUIStore } from '@/stores/useUIStore'
import DashboardLayout from '@/components/DashboardLayout'

export default function Terreno() {
    const { tid } = useParams<{ tid: string }>()
    const setTerritory = useUIStore(s => s.setTerritory)
    useEffect(() => { if (tid) setTerritory(tid) }, [tid, setTerritory])

    const t = territories.find(x => x.id === tid)
    const sensors = useSensorsStore(s => s.sensors.filter(k => k.territoryId === tid))
    const series = useSensorsStore(s => s.series)

    const pH = series[`PH_INLINE_${tid}`]?.at(-1)?.v ?? 0
    const ec = series[`EC_INLINE_${tid}`]?.at(-1)?.v ?? 0

    if (!t) return <div>Terreno non trovato</div>

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-2xl font-semibold">{t.name}</div>
                        <div className="text-sm text-slate-600">{t.areaHa} ha • Settori {t.layout.sectors.map(s => s.id).join(', ')}</div>
                    </div>
                    <Link to={`/terreni/${tid}/3d`} className="px-4 py-2 rounded-xl bg-brand-600 text-white">Apri 3D</Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        <div className="text-sm text-slate-500">Sonde attive</div>
                        <div className="text-3xl font-semibold">{sensors.length}</div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-sm text-slate-500">Settori</div>
                        <div className="text-3xl font-semibold">{t.layout.sectors.length}</div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                    {t.layout.sectors.map(s => (
                        <Card key={s.id} className="p-3">
                            <div className="text-sm text-slate-500">Settore</div>
                            <div className="text-xl font-semibold">{s.id}</div>
                            <div className="text-sm mt-1">File: {s.rows.join(', ')}</div>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    )
}
