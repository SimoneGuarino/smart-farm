export type Severity = 'critical' | 'warning' | 'info';

export type Crop = 'blueberry' | 'raspberry' | 'blackberry' | 'chili' | 'field' | 'corn';

export interface Insight {
    id: string;
    severity: Severity;
    title: string;
    detail?: string;
    actions?: string[];
    scope?: { sector?: string; row?: number };
}

export interface Advice {
    generatedAt: number;
    summary: string;
    insights: Insight[];
}

export interface Snapshot {
    pH?: number;
    ecInline?: number;
    pPre?: number;
    pPost?: number;
    flowPulse?: number;
    vwcBySector?: Record<string, { top?: number; deep?: number; avg?: number }>;
    leafWetnessHigh?: boolean;
    soilTemp?: number;
    lowBatteries?: string[];
}