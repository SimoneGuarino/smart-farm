import type { Row, Sector } from '@/types/field'


export const sectors: Sector[] = [
    { id: 'A', rows: [1, 2, 3, 4, 5, 6] },
    { id: 'B', rows: [7, 8, 9, 10, 11, 12] },
    { id: 'C', rows: [13, 14, 15, 16, 17, 18] },
    { id: 'D', rows: [19, 20, 21, 22, 23, 24] },
    { id: 'E', rows: [25, 26, 27, 28, 29, 30] },
    { id: 'F', rows: [31, 32, 33] }, // settore leggero
]


export const rows: Row[] = Array.from({ length: 33 }, (_, i) => ({ id: i + 1, sector: sectors.find(s => s.rows.includes(i + 1))!.id }))


export const rowSpacing = 3 // metri (scala 1 unità = 1 m)
export const rowLength = 100 // m