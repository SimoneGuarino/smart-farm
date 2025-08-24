export type SensorKind = 'VWC' | 'EC_DRAIN' | 'SOIL_TEMP' | 'LEAF_WETNESS' | 'PH_INLINE' | 'EC_INLINE' | 'FLOW_PULSE' | 'PRESSURE' | 'METEO'


export interface Sensor {
    id: string
    kind: SensorKind
    label: string
    sector?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
    row?: number
    depthCm?: number
    unit: string
    battery?: number
}


export interface Sample { t: number; v: number }