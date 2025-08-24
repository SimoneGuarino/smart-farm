import FieldScene from '@/components/three/FieldScene'
import Card from '@/components/ui/Card'
import { territories } from '@/config/territories'
import { useParams } from 'react-router-dom'
import { useUIStore } from '@/stores/useUIStore'
import DashboardLayout from '@/components/DashboardLayout'

export default function Field3D() {
    const { tid } = useParams<{ tid: string }>()
    const selected = useUIStore(s => s.selected)
    const t = territories.find(x => x.id === tid) ?? territories[0]

    return (
        <div>
            <FieldScene />
            <div className="fixed bottom-10 space-y-4">
                <DashboardLayout>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                        {t.layout.sectors.map(s => (
                            <Card key={String(s.id)} className="p-3">
                                <div className="text-sm text-slate-500">Settore</div>
                                <div className="text-xl font-semibold">{String(s.id)}</div>
                                <div className="text-sm mt-1">File: {s.rows.join(', ')}</div>
                            </Card>
                        ))}
                    </div>
                    {selected?.row && (
                        <Card className="p-4">
                            <div className="font-medium">Dettaglio fila {selected.row}</div>
                            <div className="text-sm text-slate-600">Qui puoi mostrare sonde vicine, ultimo VWC, suggerimenti irrigui, ecc.</div>
                        </Card>
                    )}
                </DashboardLayout>
            </div>
        </div>
    )
}
