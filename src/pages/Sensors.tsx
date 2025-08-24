import DashboardLayout from '@/components/DashboardLayout'
import Card from '@/components/ui/Card'
import { useSensorsStore } from '@/stores/useSensorsStore'
import { useMemo } from 'react'


export default function Sensors() {
    const sensors = useSensorsStore(s => s.sensors)
    const series = useSensorsStore(s => s.series)

    // dedup per id (robusto verso input “sporchi”)
    const list = useMemo(() => {
        const map = new Map<string, typeof sensors[number]>()
        for (const s of sensors) if (!map.has(s.id)) map.set(s.id, s)
        return Array.from(map.values())
    }, [sensors])

    return (
        <DashboardLayout>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {list.map(s => {
                    const last = series[s.id]?.at(-1)?.v
                    return (
                        <Card key={s.id} className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="font-medium">{s.label}</div>
                                {s.battery != null && <div className="text-xs text-slate-500">🔋 {s.battery.toFixed(0)}%</div>}
                            </div>
                            <div className="text-2xl mt-1">{last?.toFixed(2) ?? '—'} <span className="text-base">{s.unit}</span></div>
                            <div className="text-xs text-slate-500 mt-1">{s.sector ? `Settore ${s.sector}` : ''} {s.row ? `• Fila ${s.row}` : ''} {s.depthCm ? `• ${s.depthCm} cm` : ''}</div>
                        </Card>
                    )
                })}
            </div>
        </DashboardLayout>
    )
}