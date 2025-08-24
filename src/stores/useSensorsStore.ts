import { create } from 'zustand'
import type { Sensor, Sample } from '@/types/sensors'
import { buildMockSensors, startMockFeed } from '@/data/mock'


interface SensorsState {
    sensors: Sensor[]
    series: Record<string, Sample[]>
    upsertSample: (id: string, sample: Sample) => void
}


export const useSensorsStore = create<SensorsState>((set, get) => ({
    sensors: buildMockSensors(),
    series: {},
    upsertSample: (id, sample) => set(s => ({
        series: {
            ...s.series,
            [id]: [...(s.series[id] ?? []), sample].slice(-600) // ultimi 10 minuti @1s
        }
    }))
}))

export function useLastByRow(territoryId?: string) {
    const sensors = useSensorsStore(s => s.sensors)
    const series = useSensorsStore(s => s.series)
    return (row: number) => {
        const cands = sensors.filter(s => s.territoryId === territoryId && s.row === row && s.kind === 'VWC')
        const vals = cands.map(s => series[s.id]?.at(-1)?.v).filter((x): x is number => x != null)
        if (!vals.length) return undefined
        return vals.reduce((a, b) => a + b, 0) / vals.length
    }
}

// avvia la simulazione quando importato dalla Dashboard
startMockFeed((id: any, sample: any) => useSensorsStore.getState().upsertSample(id, sample))