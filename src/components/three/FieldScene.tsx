import { Canvas } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import { rows, rowSpacing, rowLength, sectors } from '@/config/fieldLayout'
import { useUIStore } from '@/stores/useUIStore'
import { useSensorsStore } from '@/stores/useSensorsStore'
import { useMemo } from 'react'

/** centro del blocco di file: comodo per allineare tutto a z=0 */
const CENTER_Z = 0
const START_Z = CENTER_Z - ((rows.length - 1) * rowSpacing) / 2

function useRowStressColor(rowId: number) {
    const series = useSensorsStore(s => s.series)

    return useMemo(() => {
        // prendo VWC 20 e 35 cm della fila se presenti, altrimenti cerco la fila strumentata più vicina
        const probeRows = [1, 16, 30, 33]
        const nearest =
            probeRows.reduce((best, r) =>
                Math.abs(r - rowId) < Math.abs(best - rowId) ? r : best
                , probeRows[0])

        const v20 = series[`VWC_${nearest}_20`]?.at(-1)?.v
        const v35 = series[`VWC_${nearest}_35`]?.at(-1)?.v
        const v = (v20 != null && v35 != null) ? (v20 + v35) / 2
            : (v20 ?? v35 ?? 26) // default “neutro” se mancano dati

        // mappa stress: 0 ok (22–30), >0 fino a 1 = critico
        let stress = 0
        if (v < 22) stress = Math.min(1, (22 - v) / 8)         // fino a 14% → 1
        else if (v > 30) stress = Math.min(1, (v - 30) / 8)    // fino a 38% → 1

        // gradiente HSL: 120° (verde) → 0° (rosso)
        const hue = 120 * (1 - stress)
        const color = `hsl(${hue} 70% 55%)`
        return color
    }, [rowId, series])
}

function RowMesh({ index, sector }: { index: number; sector: string }) {
    const { setSelected } = useUIStore()
    const z = START_Z + index * rowSpacing
    const color = useRowStressColor(index + 1)

    return (
        <group position={[0, 0, z]}>
            {/* rettangolo fila */}
            <mesh onClick={() => setSelected({ row: index + 1 })}>
                <boxGeometry args={[rowLength, 0.2, 0.8]} />
                <meshStandardMaterial color={color} />
            </mesh>
        </group>
    )
}

function Ground() {
    // piano centrato a z=0, niente offset “fantasma”
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.11, 0]}>
            <planeGeometry args={[rowLength + 10, rows.length * rowSpacing + 10]} />
            <meshStandardMaterial color="#e2e8f0" />
        </mesh>
    )
}

/** linee e label dei settori A–F */
function SectorOverlays() {
    const lineThickness = 0.06
    const marginX = rowLength / 2 + 5

    return (
        <group>
            {sectors.map((s) => {
                const firstIdx = Math.min(...s.rows) - 1
                const lastIdx = Math.max(...s.rows) - 1
                const zStart = START_Z + (firstIdx - 0.5) * rowSpacing
                const zEnd = START_Z + (lastIdx + 0.5) * rowSpacing
                const zCenter = (zStart + zEnd) / 2

                return (
                    <group key={s.id}>
                        {/* linee sottili ai bordi del settore */}
                        <mesh position={[0, 0.01, zStart]}>
                            <boxGeometry args={[rowLength + 10, lineThickness, lineThickness]} />
                            <meshStandardMaterial color="#475569" />
                        </mesh>
                        <mesh position={[0, 0.01, zEnd]}>
                            <boxGeometry args={[rowLength + 10, lineThickness, lineThickness]} />
                            <meshStandardMaterial color="#475569" />
                        </mesh>

                        {/* etichetta sospesa sul bordo sinistro */}
                        <Html
                            position={[-marginX, 0.6, zCenter]}
                            center
                            distanceFactor={15}
                            transform
                        >
                            <div className="px-2 py-1 rounded-md text-xs bg-white/80 border border-slate-300 shadow">
                                Settore <b>{s.id}</b>
                            </div>
                        </Html>
                    </group>
                )
            })}
        </group>
    )
}

export default function FieldScene() {
    return (
        <div className="h-full w-full">
            <Canvas camera={{ position: [-40, 50, 80], fov: 45 }}>
                <ambientLight intensity={0.8} />
                <directionalLight position={[50, 80, 40]} intensity={1} />
                <Ground />
                <SectorOverlays />
                {rows.map((r, i) => (
                    <RowMesh key={r.id} index={i} sector={r.sector} />
                ))}
                {/* target al centro vero del campo */}
                <OrbitControls makeDefault target={[0, 0, 0]} />
            </Canvas>
        </div>
    )
}
