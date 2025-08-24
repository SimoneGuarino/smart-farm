import type { TerritoryGeo } from "@/types/geo";

/**
 * ESEMPI: inserisci le tue coord reali (Google Maps → click dest. → "Copia latitudine, longitudine").
 * Il poligono deve essere CHIUSO: ultimo punto = primo punto.
 */
export const TERRITORIES_GEO: TerritoryGeo[] = [
    {
        id: "T1",
        name: "Terreno Nord",
        areaHa: 1.2,
        polygon: [
            [41.59094, 12.97212],
            [41.59039, 12.97373],
            [41.58953, 12.97322],
            [41.59003, 12.97169],
            [41.59094, 12.97212] // chiusura
        ],
        sensors: [
            { id: "PH_INLINE_T1", pos: [41.59060, 12.97260] },
        ]
    },
    {
        id: "T2",
        name: "Terreno Sud",
        areaHa: 3.0,
        polygon: [
            [41.58792, 12.97551],
            [41.58724, 12.97686],
            [41.58632, 12.97615],
            [41.58696, 12.97485],
            [41.58792, 12.97551]
        ],
        sensors: [
            { id: "PH_INLINE_T2", pos: [41.58745, 12.97590] },
        ]
    }
];
