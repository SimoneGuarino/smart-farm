import type { Territory } from '@/types/farm';

function mkRows(sectors: { id: string; rows: number[] }) {
    const rows = Array.from({ length: sectors.rows.reduce((m, r) => Math.max(m, r), 0) }, (_, i) => {
        const id = i + 1;
        const sec = sectors.rows.includes(id) ? sectors.id : 'A';
        return { id, sector: sec as any };
    });
    return rows;
}

export const territories: Territory[] = [
    {
        id: 'T1',
        name: 'Terreno Nord',
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
        }
    },
    {
        id: 'T2',
        name: 'Terreno Sud',
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
        }
    }
];
