import { Plot, Sector } from '@/types/twin';

const FIELD_W = 100; // meters
const FIELD_H = 60; // meters
const ROW_LENGTH = 14;
const ROW_WIDTH = 1.2;
const ROW_HEIGHT = 0.6;
const SECTORS = 6;
const ROWS_PER_SECTOR = 5;
const ROW_GAP = 3.0;

export function makeDemoSectors(): Sector[] {
    const origin = { x: -FIELD_W / 2, y: 0, z: -FIELD_H / 2 };
    const gapSector = (FIELD_W - SECTORS * ROW_LENGTH) / (SECTORS + 1);


    const sectors: Sector[] = [];
    for (let s = 0; s < SECTORS; s++) {
        const sid = String.fromCharCode(65 + s); // 'A'..'F'
        const plots: Plot[] = [];
        const xBlockCenter = origin.x + gapSector * (s + 1) + ROW_LENGTH * (s + 0.5);


        for (let r = 0; r < ROWS_PER_SECTOR; r++) {
            const z1 = origin.z + 10 + r * ROW_GAP;
            const z2 = z1 + 30; // second block
            const size = { x: ROW_LENGTH, y: ROW_HEIGHT, z: ROW_WIDTH };
            plots.push({ id: `${sid}-R${r}-A`, center: { x: xBlockCenter, y: ROW_HEIGHT / 2, z: z1 }, size });
            plots.push({ id: `${sid}-R${r}-B`, center: { x: xBlockCenter, y: ROW_HEIGHT / 2, z: z2 }, size });
        }


        sectors.push({ id: sid, name: `Settore ${sid}`, plots });
    }
    return sectors;
}