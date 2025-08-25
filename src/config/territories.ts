import type { Territory } from '@/types/farm';

export const territories: Territory[] = [
    {
        id: 'T1',
        name: 'Terreno Nord',
        crop: "blueberry",
        areaHa: 1.2,
        layout: {
            sectors: [
                { id: 'A', rows: [1, 2, 3, 4, 5, 6] },
                { id: 'B', rows: [7, 8, 9, 10, 11, 12] },
                { id: 'C', rows: [13, 14, 15, 16, 17, 18] },
                { id: 'D', rows: [19, 20, 21, 22, 23, 24] },
                { id: 'E', rows: [25, 26, 27, 28, 29, 30] },
                { id: 'F', rows: [31, 32, 33] },
            ],
            rows: Array.from({ length: 33 }, (_, i) => {
                const id = i + 1;
                const sec = ['A', 'B', 'C', 'D', 'E', 'F'].find(s => {
                    const def = { A: [1, 2, 3, 4, 5, 6], B: [7, 8, 9, 10, 11, 12], C: [13, 14, 15, 16, 17, 18], D: [19, 20, 21, 22, 23, 24], E: [25, 26, 27, 28, 29, 30], F: [31, 32, 33] };
                    // @ts-ignore
                    return def[s].includes(id);
                })!;
                return { id, sector: sec as any };
            }),
            rowSpacing: 3,
            rowLength: 100
        },
        geo: {
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
        }
    },
    {
        id: 'T2',
        name: 'Terreno Sud',
        crop: "chili",
        areaHa: 3.0,
        layout: {
            sectors: [
                { id: 'A', rows: [1, 2, 3, 4, 5] },
                { id: 'B', rows: [6, 7, 8, 9, 10] },
                { id: 'C', rows: [11, 12, 13, 14, 15] },
            ],
            rows: Array.from({ length: 15 }, (_, i) => ({ id: i + 1, sector: (i < 5 ? 'A' : i < 10 ? 'B' : 'C') as any })),
            rowSpacing: 3.2,
            rowLength: 120
        },
        geo: {
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
    }
];
