import { useParams } from 'react-router-dom'
import Card from '@/components/ui/Card'
import TimeSeries from '@/components/charts/TimeSeries'
import { useSensorsStore } from '@/stores/useSensorsStore'


export default function MetricsDetail() {
    const { id } = useParams<{ id: string }>()
    const sensors = useSensorsStore(s => s.sensors)
    const s = sensors.find(x => x.id === id)
    const series = useSensorsStore(st => st.series[id ?? ''] ?? [])
    if (!s) return <div>Nessun sensore con id {id}</div>
    return (
        <div className="space-y-4">
            <Card className="p-4">
                <div className="text-sm text-slate-500">Dettaglio metrica</div>
                <div className="text-xl font-semibold">{s.label}</div>
                <div className="text-xs text-slate-500">Unità: {s.unit}</div>
            </Card>
            <Card className="p-4">
                <TimeSeries data={series} unit={s.unit} />
            </Card>
        </div>
    )
}