export type SectorId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
export interface Row { id: number; sector: SectorId }
export interface Sector { id: SectorId; rows: number[] }