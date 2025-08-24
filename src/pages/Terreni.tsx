import { territories } from '@/config/territories'
import Card from '@/components/ui/Card'
import { Link } from 'react-router-dom'
import DashboardLayout from '@/components/DashboardLayout'

export default function Terreni() {
    return (
        <DashboardLayout>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {territories.map(t => (
                <Card key={t.id} className="p-4 flex flex-col gap-2">
                    <div className="text-xl font-semibold">{t.name}</div>
                    <div className="text-sm text-slate-600">Superficie: {t.areaHa} ha</div>
                    <div className="text-xs text-slate-500">Settori: {t.layout.sectors.map(s => s.id).join(', ')}</div>
                    <div className="mt-3 flex gap-2">
                        <Link to={`/terreni/${t.id}`} className="px-3 py-1 rounded-lg bg-slate-900 text-white text-sm">Statistiche</Link>
                        <Link to={`/terreni/${t.id}/3d`} className="px-3 py-1 rounded-lg bg-slate-100 text-slate-900 text-sm">Vista 3D</Link>
                    </div>
                </Card>
            ))}
        </div>
    </DashboardLayout>
    )
}
