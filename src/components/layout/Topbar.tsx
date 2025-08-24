import { useUIStore } from '@/stores/useUIStore'


export default function Topbar() {
    const { features, toggleFeature } = useUIStore()
    return (
        <div className="hidden fixed right-0 z-10 top-5 flex items-center justify-between container-p">
            <div className="font-medium">Digital Twin • Demo</div>
            <div className="flex gap-3 items-center text-sm">
                <label className="flex items-center gap-2">
                    <input type="checkbox" checked={features.meteoStation} onChange={() => toggleFeature('meteoStation')} /> Meteo
                </label>
                <label className="flex items-center gap-2">
                    <input type="checkbox" checked={features.inlinePH} onChange={() => toggleFeature('inlinePH')} /> pH/EC in linea
                </label>
                <label className="flex items-center gap-2">
                    <input type="checkbox" checked={features.flowMeter} onChange={() => toggleFeature('flowMeter')} /> Contalitri
                </label>
                <label className="flex items-center gap-2">
                    <input type="checkbox" checked={features.leafWetness} onChange={() => toggleFeature('leafWetness')} /> Bagnatura fogliare
                </label>
            </div>
        </div>
    )
}