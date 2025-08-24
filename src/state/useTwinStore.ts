import { create } from 'zustand';
import { Sector, SectorMetric, MetricKey } from '@/types/twin';


export type TwinState = {
    sectors: Sector[];
    metrics: Record<string, SectorMetric>;
    colorBy: MetricKey;
    selected: string | null;
    setColorBy: (m: MetricKey) => void;
    setSelected: (id: string | null) => void;
    setMetrics: (m: Record<string, SectorMetric>) => void;
    upsertMetric: (m: SectorMetric) => void;
    setSectors: (s: Sector[]) => void;
};


export const useTwinStore = create<TwinState>((set) => ({
    sectors: [],
    metrics: {},
    colorBy: 'stress',
    selected: null,
    setColorBy: (colorBy) => set({ colorBy }),
    setSelected: (selected) => set({ selected }),
    setMetrics: (metrics) => set({ metrics }),
    upsertMetric: (m) => set((st) => ({ metrics: { ...st.metrics, [m.id]: m } })),
    setSectors: (sectors) => set({ sectors })
}));