import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import TimeSeries from '@/components/charts/TimeSeries'
import { useSensorsStore } from '@/stores/useSensorsStore'
import { useMemo } from 'react'
import DashboardLayout from '@/components/DashboardLayout'


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


    return (
        <DashboardLayout>
            <div className="space-y-6">
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
        </DashboardLayout>
    )
}