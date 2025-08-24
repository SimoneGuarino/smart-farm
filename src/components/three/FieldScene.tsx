import { Canvas } from '@react-three/fiber'
import { OrbitControls, Line, Html } from '@react-three/drei'
import { territories } from '@/config/territories'
import { useParams } from 'react-router-dom'
import { useUIStore } from '@/stores/useUIStore'
import { useLastByRow } from '@/stores/useSensorsStore'
import DashboardLayout from '../DashboardLayout'

function RowMesh({ index, rowId, sector, spacing, length, getVwc }: { index: number; rowId: number; sector: string; spacing: number; length: number; getVwc: (row: number) => number | undefined }) {
    const { setSelected } = useUIStore()
    const z = index * spacing
    const vwc = getVwc(rowId)
    // mappa colore: <22% rosso, 22-30% verde, >30% ambra
    let color = '#94a3b8' // default
    if (vwc != null) {
        if (vwc < 22) color = '#f87171'
        else if (vwc > 30) color = '#f59e0b'
        else color = '#34d399'
    }
    return (
        <group position={[0, 0, z]}>
            <mesh position={[0, 0.05, 0]} onClick={() => setSelected({ row: rowId })}>
                <boxGeometry args={[length, 0.1, 0.8]} />
                <meshStandardMaterial color={color} />
            </mesh>
        </group>
    )
}

function SectorOutline({ rows, spacing, length }: { rows: number[]; spacing: number; length: number }) {
    // disegna un rettangolo che abbraccia il range di righe del settore
    const first = Math.min(...rows) - 1
    const last = Math.max(...rows) - 1
    const z0 = first * spacing - spacing / 2
    const z1 = (last + 1) * spacing + spacing / 2
    const x0 = -length / 2 - 0.5, x1 = length / 2 + 0.5
    const points = [
        [x0, 0.02, z0], [x1, 0.02, z0],
        [x1, 0.02, z1], [x0, 0.02, z1],
        [x0, 0.02, z0]
    ] as [number, number, number][]
    return <Line points={points} lineWidth={2} color="#0ea5e9" dashed dashSize={2} gapSize={1} />
}

function Ground({ width, depth }: { width: number; depth: number }) {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, depth / 2]}>
            <planeGeometry args={[width, depth]} />
            <meshStandardMaterial color="#e2e8f0" />
        </mesh>
    )
}

export default function FieldScene() {
    const { tid } = useParams<{ tid: string }>()
    const t = territories.find(x => x.id === tid) ?? territories[0]
    const { rows, rowSpacing, rowLength, sectors } = t.layout
    const getVwc = useLastByRow(t.id)

    const depth = rows.length * rowSpacing + 10
    const width = rowLength + 10

    return (
        <div className="h-[100vh] overflow-hidden">
            <Canvas camera={{ position: [-40, 50, 80], fov: 45 }}>
                <ambientLight intensity={0.9} />
                <directionalLight position={[50, 80, 40]} intensity={1} />
                <Ground width={width} depth={depth} />
                {rows.map((r, i) => (
                    <RowMesh key={r.id} index={i} rowId={r.id} sector={r.sector as string} spacing={rowSpacing} length={rowLength} getVwc={getVwc} />
                ))}
                {sectors.map(s => (
                    <SectorOutline key={String(s.id)} rows={s.rows} spacing={rowSpacing} length={rowLength} />
                ))}
                {t.layout.sectors.map(s => {
                    const mid = (Math.min(...s.rows) - 1 + Math.max(...s.rows) - 1) / 2 * rowSpacing
                    // condizione demo:
                    const needWater = s.rows.some(r => (getVwc(r) ?? 26) < 22)
                    return needWater ? (
                        <Html key={String(s.id)} position={[rowLength / 2 + 1, 0.3, mid]}>
                            <span className="px-2 py-1 text-xs rounded bg-amber-100 text-amber-800 shadow">Need water</span>
                        </Html>
                    ) : null
                })}
                <OrbitControls makeDefault target={[0, 0, (rows.length * rowSpacing) / 2]} />
            </Canvas>
            {/* overlay UI minimale */}
            <DashboardLayout>
            <div className="fixed top-3 bg-white/90 backdrop-blur px-3 py-2 rounded-xl text-sm shadow">
                <div className="font-medium">{t.name}</div>
                <div className="text-slate-600">{t.areaHa} ha • {rows.length} file • {sectors.length} settori</div>
            </div>
            </DashboardLayout>
        </div>
    )
}
