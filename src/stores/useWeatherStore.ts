// src/stores/useWeatherStore.ts
import { create } from "zustand";
import type { WeatherPack } from "@/types/weather";
import { getForecastOpenMeteo } from "@/services/weather/openmeteo";
// in futuro: import { getForecastGoogle } from "@/services/weather/google";

type State = {
    byTerrain: Record<string, WeatherPack | undefined>;
    loading: Record<string, boolean>;
    fetch: (terrainId: string, lat: number, lon: number, provider?: 'openmeteo' | 'google') => Promise<void>;
};

export const useWeatherStore = create<State>((set) => ({
    byTerrain: {}, loading: {},
    fetch: async (terrainId, lat, lon, provider = 'openmeteo') => {
        set(s => ({ loading: { ...s.loading, [terrainId]: true } }));
        try {
            const pack = provider === 'openmeteo'
                ? await getForecastOpenMeteo(lat, lon)
                // : await getForecastGoogle(lat, lon)
                : await getForecastOpenMeteo(lat, lon);
            set(s => ({ byTerrain: { ...s.byTerrain, [terrainId]: pack } }));
        } finally {
            set(s => ({ loading: { ...s.loading, [terrainId]: false } }));
        }
    }
}));