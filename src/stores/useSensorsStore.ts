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


// avvia la simulazione quando importato dalla Dashboard
startMockFeed((id: any, sample: any) => useSensorsStore.getState().upsertSample(id, sample))