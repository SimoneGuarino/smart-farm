import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { Sample } from '@/types/sensors'


export default function TimeSeries({ data, unit }: { data: Sample[], unit?: string }) {
    const fmt = (v: number) => unit ? `${v.toFixed(2)} ${unit}` : v.toFixed(2)
    return (
        <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.map(d => ({ x: new Date(d.t).toLocaleTimeString(), y: d.v }))}>
                    <XAxis dataKey="x" hide />
                    <YAxis tickFormatter={(v) => fmt(v as number)} width={40} />
                    <Tooltip formatter={(v) => fmt(v as number)} />
                    <Line type="monotone" dataKey="y" dot={false} strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}