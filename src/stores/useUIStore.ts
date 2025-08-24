import { create } from 'zustand'
import type { TerritoryId } from '@/types/farm'
import { defaultFeatures, type Features } from '@/config/features'

interface UIState {
    features: Features
    toggleFeature: (k: keyof Features) => void
    selected?: { sector?: string; row?: number; sensorId?: string }
    setSelected: (s: UIState['selected']) => void

    territoryId?: TerritoryId
    setTerritory: (id: TerritoryId) => void
}

export const useUIStore = create<UIState>((set) => ({
    features: defaultFeatures,
    toggleFeature: (k) => set(s => ({ features: { ...s.features, [k]: !s.features[k] } })),
    selected: undefined,
    setSelected: (selected) => set({ selected }),
    territoryId: undefined,
    setTerritory: (id) => set({ territoryId: id })
}))
