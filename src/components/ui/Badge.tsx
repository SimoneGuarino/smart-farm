export default function Badge({ children, tone = 'default' }: { children: React.ReactNode, tone?: 'default' | 'ok' | 'warn' | 'error' }) {
    const cls = {
        default: 'bg-slate-100 text-slate-700',
        ok: 'bg-emerald-100 text-emerald-700',
        warn: 'bg-amber-100 text-amber-800',
        error: 'bg-rose-100 text-rose-700'
    }[tone]
    return <span className={`px-2 py-0.5 rounded-full text-xs ${cls}`}>{children}</span>
}