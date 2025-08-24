import { useMemo } from 'react';
import { useSensorsStore } from '@/stores/useSensorsStore';
import { rows, sectors } from '@/config/fieldLayout';

type RowStress = { rowId: number; stress: number; vwc?: number };

function clamp(v: number, a: number, b: number) { return Math.max(a, Math.min(b, v)); }

/** converte VWC (%) in penalità: 0 ottimo, 1 pessimo. target 22-30% */
function vwcPenalty(vwc?: number) {
    if (vwc == null) return 0.2; // incertezza
    if (vwc >= 22 && vwc <= 30) return 0;        // sweet spot
    if (vwc < 22) return clamp((22 - vwc) / 10, 0, 1); // troppo secco
    return clamp((vwc - 30) / 12, 0, 1);         // troppo bagnato
}

export function useRowMetrics(): RowStress[] {
    const sensors = useSensorsStore(s => s.sensors);
    const series = useSensorsStore(s => s.series);

    // Valori di contesto (ultimi)
    const ecInline = series['EC_INLINE']?.at(-1)?.v; // mS/cm
    const pH = series['PH_INLINE']?.at(-1)?.v;
    const lws1 = series['LWS_1']?.at(-1)?.v ?? 0;
    const lws2 = series['LWS_2']?.at(-1)?.v ?? 0;
    const leafWet = Math.max(lws1, lws2); // indicatore bagnatura

    // mappa fila -> VWC (%) se disponibile (usiamo i sensori VWC_{row}_{depth})
    const vwcByRow: Record<number, number> = {};
    sensors.filter(s => s.id.startsWith('VWC_')).forEach(s => {
        const last = series[s.id]?.at(-1)?.v; // i mock VWC sono ~18..32 (percent)
        if (last != null && s.row) {
            // se hai due profondità, fai media
            vwcByRow[s.row] = vwcByRow[s.row] != null ? (vwcByRow[s.row] + last) / 2 : last;
        }
    });

    // media di settore come fallback
    const sectorAvgVWC: Record<string, number> = {};
    sectors.forEach(sec => {
        const values = sec.rows.map(r => vwcByRow[r]).filter(v => v != null) as number[];
        if (values.length) sectorAvgVWC[sec.id] = values.reduce((a, b) => a + b, 0) / values.length;
    });

    return useMemo(() => {
        return rows.map(r => {
            const sectorId = r.sector;
            const vwcRow = vwcByRow[r.id] ?? sectorAvgVWC[sectorId] ?? 26; // default 26%
            let stress = 0;

            // 1) base: VWC
            stress += vwcPenalty(vwcRow);

            // 2) EC in linea: >1.5 mS/cm penalizza (salinità alta)
            if (ecInline != null && ecInline > 1.5) {
                stress += clamp((ecInline - 1.5) / 1.5, 0, 0.4); // max +0.4
            }

            // 3) bagnatura fogliare: se >0.6, aggiungi rischio (malattie)
            if (leafWet > 0.6) stress += 0.2;

            // 4) pH fuori range (5.0..5.8): piccola penalità
            if (pH != null && (pH < 5.0 || pH > 5.8)) stress += 0.1;

            stress = clamp(stress, 0, 1);

            return { rowId: r.id, stress, vwc: vwcRow };
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(vwcByRow), ecInline, pH, leafWet, JSON.stringify(sectorAvgVWC)]);
}
