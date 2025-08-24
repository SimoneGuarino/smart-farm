export type TerritoryId = string;

export interface Territory {
  id: TerritoryId;
  name: string;
  areaHa: number;          // es. 1.0, 3.2
  note?: string;
  layout: FieldLayout;     // settori/filari specifici del terreno
}

export interface FieldLayout {
  sectors: Sector[];       // A..F (o più)
  rows: Row[];             // 1..N
  rowSpacing: number;      // m
  rowLength: number;       // m
}

export type SectorId = 'A'|'B'|'C'|'D'|'E'|'F'|string;

export interface Sector { id: SectorId; rows: number[]; label?: string }
export interface Row { id: number; sector: SectorId }