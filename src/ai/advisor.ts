import { useSensorsStore } from '@/stores/useSensorsStore';
import type { Advice, Snapshot, Insight, Crop } from './types';

// -------- helpers --------
function last(series: Record<string, { t: number; v: number }[]>, id: string) {
    const v = series[id]?.at(-1)?.v;
    return typeof v === 'number' ? v : undefined;
}

// -------- profili per coltura (demo ragionate) --------
// Nota: i valori sono indicativi e vanno rifiniti sui tuoi dati/tecnica.
// Per mirtillo ci allineiamo alle soglie già visibili in dashboard (VWC 22–30%, pH 5.0–5.6, EC inline alta >1.5 mS/cm; ΔP >0.6 bar). 
export const CROP_PROFILES: Record<Crop, {
    vwcOkLo: number; vwcOkHi: number;
    phLo?: number; phHi?: number;
    ecInlineHi?: number;
    dPBackwash: number;
    irrigationMinutesPerDeficitPt?: number; // min per punto % v/v
}> = {
    blueberry: { vwcOkLo: 22, vwcOkHi: 30, phLo: 5.0, phHi: 5.6, ecInlineHi: 1.5, dPBackwash: 0.6, irrigationMinutesPerDeficitPt: 2.5 },
    raspberry: { vwcOkLo: 20, vwcOkHi: 28, phLo: 5.5, phHi: 6.2, ecInlineHi: 1.6, dPBackwash: 0.6, irrigationMinutesPerDeficitPt: 2.0 },
    blackberry: { vwcOkLo: 20, vwcOkHi: 30, phLo: 5.5, phHi: 6.5, ecInlineHi: 1.6, dPBackwash: 0.6, irrigationMinutesPerDeficitPt: 2.0 },
    chili: { vwcOkLo: 18, vwcOkHi: 26, phLo: 5.8, phHi: 6.8, ecInlineHi: 2.2, dPBackwash: 0.6, irrigationMinutesPerDeficitPt: 1.8 },
    field: { vwcOkLo: 16, vwcOkHi: 24, ecInlineHi: 2.0, dPBackwash: 0.6, irrigationMinutesPerDeficitPt: 1.5 },
    corn: { vwcOkLo: 18, vwcOkHi: 26, phLo: 5.8, phHi: 7.0, ecInlineHi: 2.0, dPBackwash: 0.6, irrigationMinutesPerDeficitPt: 1.5 },
};

function getTargets(crop: Crop) {
    return CROP_PROFILES[crop] ?? CROP_PROFILES['field'];
}

// -------- snapshot limitato a TERRITORIO --------
function buildSnapshotForTerritory(territoryId: string, sectorIds: string[]): Snapshot {
    const { sensors, series } = useSensorsStore.getState();

    // inline (se li differenzi per territorio in futuro, sostituisci le chiavi con suffisso _{tid})
    const pH = last(series, 'PH_INLINE');
    const ecInline = last(series, 'EC_INLINE');
    const pPre = last(series, 'P_PRE');
    const pPost = last(series, 'P_POST');
    const flowPulse = last(series, 'FLOW_PULSE_MAIN');
    const soilTemp = last(series, 'T_SOIL_CENTRO');
    const leafWetnessHigh = (last(series, 'LWS_1') ?? 0) > 0.7 || (last(series, 'LWS_2') ?? 0) > 0.7;

    const terrSensors = sensors.filter(s => s.territoryId === territoryId);

    const vwcBySector: Snapshot['vwcBySector'] = {};
    sectorIds.forEach(id => (vwcBySector![id] = {}));

    const vwc = terrSensors.filter((s) => s.kind === 'VWC');
    const bySector: Record<string, number[]> = {};
    const bySectorTop: Record<string, number[]> = {};
    const bySectorDeep: Record<string, number[]> = {};

    vwc.forEach((s) => {
        const v = last(series, s.id);
        if (typeof v !== 'number' || !s.sector) return;
        if (!sectorIds.includes(s.sector)) return;
        (bySector[s.sector] ??= []).push(v);
        const depth = s.depthCm ?? 0;
        (depth <= 25 ? (bySectorTop[s.sector] ??= []) : (bySectorDeep[s.sector] ??= [])).push(v);
    });

    for (const sec of Object.keys(bySector)) {
        const arr = bySector[sec];
        const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
        const topArr = bySectorTop[sec] ?? [];
        const deepArr = bySectorDeep[sec] ?? [];
        const top = topArr.length ? topArr.reduce((a, b) => a + b, 0) / topArr.length : undefined;
        const deep = deepArr.length ? deepArr.reduce((a, b) => a + b, 0) / deepArr.length : undefined;
        vwcBySector![sec] = { top, deep, avg };
    }

    const lowBatteries =
        terrSensors.filter((s) => typeof s.battery === 'number' && (s.battery as number) < 25)
            .map((s) => s.label) ?? [];

    return { pH, ecInline, pPre, pPost, flowPulse, soilTemp, leafWetnessHigh, vwcBySector, lowBatteries };
}

// -------- regole che usano i target della coltura --------
function buildInsights(s: Snapshot, crop: Crop): Insight[] {
    const T = getTargets(crop);
    const out: Insight[] = [];

    // Filtri / ΔP
    if (typeof s.pPre === 'number' && typeof s.pPost === 'number') {
        const dP = s.pPre - s.pPost;
        if (dP > T.dPBackwash) {
            out.push({
                id: 'filter_backwash',
                severity: 'warning',
                title: `ΔP filtro ${dP.toFixed(2)} bar: esegui controlavaggio`,
                actions: ['Avvia controlavaggio', 'Verifica cartucce/dischi e torbidità'],
            });
        }
    }

    // pH inline (solo se profilato)
    if (typeof s.pH === 'number' && T.phLo != null && T.phHi != null) {
        if (s.pH < T.phLo) {
            out.push({
                id: 'ph_low',
                severity: 'warning',
                title: `pH basso (${s.pH.toFixed(2)}): riduci acido/controlla taratura`,
                actions: ['Ricalibra sonda pH', 'Riduci portata acido', 'Controlla alcalinità acqua'],
            });
        } else if (s.pH > T.phHi) {
            out.push({
                id: 'ph_high',
                severity: 'warning',
                title: `pH alto (${s.pH.toFixed(2)}): calibra acidificazione verso ${T.phLo?.toFixed(1)}–${T.phHi?.toFixed(1)}`,
                actions: ['Verifica dosatore', 'Controlla KH', 'Ricalibra sonda pH'],
            });
        }
    }

    // EC inline
    if (typeof s.ecInline === 'number' && T.ecInlineHi != null && s.ecInline > T.ecInlineHi) {
        out.push({
            id: 'ec_high',
            severity: 'warning',
            title: `EC in linea alta (${s.ecInline.toFixed(2)} mS/cm): rischio eccesso salino`,
            actions: ['Riduci concentrazione stock', 'Valuta un ciclo di lavaggio con sola acqua'],
        });
    }

    // Umidità suolo per settore
    if (s.vwcBySector) {
        Object.entries(s.vwcBySector).forEach(([sec, vals]) => {
            const avg = vals.avg;
            if (typeof avg !== 'number') return;
            if (avg < T.vwcOkLo) {
                const deficit = T.vwcOkLo - avg;
                const k = T.irrigationMinutesPerDeficitPt ?? 2.0;
                const minutes = Math.min(30, Math.max(6, Math.round(deficit * k)));
                out.push({
                    id: `vwc_low_${sec}`,
                    severity: 'critical',
                    title: `Settore ${sec}: umidità bassa (${avg.toFixed(1)}% v/v)`,
                    detail: `Irrigazione suggerita ~${minutes} min (≈${k} min per punto %).`,
                    scope: { sector: sec },
                    actions: ['Controlla uniformità gocciolatori', 'Verifica risalita a 20–35 cm'],
                });
            } else if (avg > T.vwcOkHi) {
                out.push({
                    id: `vwc_high_${sec}`,
                    severity: 'warning',
                    title: `Settore ${sec}: umidità alta (${avg.toFixed(1)}% v/v)`,
                    detail: 'Riduci durata/turno; monitora EC drenaggio.',
                    scope: { sector: sec },
                    actions: ['Sospendi un turno', 'Controlla asfissia/ruscellamenti'],
                });
            }
        });
    }

    // Anomalie portata
    if (typeof s.flowPulse === 'number' && typeof s.pPre === 'number' && typeof s.pPost === 'number') {
        const dP = s.pPre - s.pPost;
        if (s.flowPulse < 0.2 && dP > 0.4) {
            out.push({
                id: 'low_flow_possible_blockage',
                severity: 'critical',
                title: 'Flusso quasi nullo con ΔP alta: possibile occlusione linea',
                actions: ['Verifica valvole settore', 'Controlla filtro secondario', 'Ispeziona linea gocciolante'],
            });
        }
    }

    if (s.lowBatteries && s.lowBatteries.length) {
        out.push({
            id: 'low_battery',
            severity: 'info',
            title: `Batterie basse su: ${s.lowBatteries.join(', ')}`,
            actions: ['Programma sostituzione/ricarica'],
        });
    }

    return out;
}

function summarize(insights: Insight[]): string {
    const crit = insights.filter((i) => i.severity === 'critical').length;
    const warn = insights.filter((i) => i.severity === 'warning').length;
    return `Priorità: ${crit} urgenti, ${warn} attenzioni, ${insights.length - crit - warn} da monitorare.`;
}

// -------- API: consigli per TERRITORIO + COLTURA --------
export function getAdviceForTerritory(territoryId: string, sectorIds: string[], crop: Crop): Advice {
    const snap = buildSnapshotForTerritory(territoryId, sectorIds);
    const insights = buildInsights(snap, crop).sort((a, b) => {
        const w = (s: 'critical' | 'warning' | 'info') => (s === 'critical' ? 2 : s === 'warning' ? 1 : 0);
        return w(b.severity) - w(a.severity);
    });
    return { generatedAt: Date.now(), summary: summarize(insights), insights };
};