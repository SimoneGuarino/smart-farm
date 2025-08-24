export type LatLng = [number, number]; // [lat, lng]

export interface TerritoryGeo {
  id: string;
  name: string;
  areaHa: number;
  polygon: LatLng[];      // poligono semplice (chiuso: ripeti primo punto in coda)
  sensors?: { id: string; pos: LatLng }[];
}