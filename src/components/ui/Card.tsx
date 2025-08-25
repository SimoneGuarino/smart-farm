import { ReactNode } from 'react'

type Variant = 'primary' | 'dark'

const variantClasses: Record<string, string> = {
    primary: 'bg-white dark:bg-neutral-900 text-black/80 dark:text-gray-300 border border-slate-200 dark:border-slate-900',
    dark: 'bg-neutral-800/90 text-white',
};

export default function Card({ variant="primary", children, className = '' }: { variant?: Variant, children: ReactNode, className?: string }) {
    return <div className={`${className} ${variantClasses[variant || 'primary']} rounded-2xl shadow-sm`}>{children}</div>
}