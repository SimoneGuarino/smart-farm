export function randBetween(min: number, max: number) {
    return Math.random() * (max - min) + min
}


export function drift(prev: number, step: number, lo: number, hi: number) {
    const v = prev + (Math.random() - 0.5) * step
    return Math.min(hi, Math.max(lo, v))
}