import * as THREE from 'three';

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function colorFromStress(h: number) {
    const col = new THREE.Color();
    col.setHSL(h, 0.85, 0.58);
    return col;
}

// 0 -> blue (0.66), 1 -> red (0.0)
export function hueFromUnit(v: number) {
    return clamp(0.66 - 0.66 * v, 0, 0.66);
}