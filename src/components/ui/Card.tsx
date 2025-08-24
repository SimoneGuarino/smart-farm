import { ReactNode } from 'react'

type Variant = 'primary' | 'dark'

const variantClasses: Record<string, string> = {
    primary: 'bg-white text-black/80 border border-slate-200',
    dark: 'bg-neutral-800/90 text-white',
};

export default function Card({ variant="primary", children, className = '' }: { variant?: Variant, children: ReactNode, className?: string }) {
    return <div className={`${className} ${variantClasses[variant || 'primary']} rounded-2xl shadow-sm`}>{children}</div>
}