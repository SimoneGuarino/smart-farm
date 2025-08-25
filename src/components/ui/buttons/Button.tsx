import { motion, Variants } from 'framer-motion';
import React, { memo } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'text';
    size?: 'small' | 'medium' | 'large';
    loading?: boolean;
    icon?: React.ReactNode;
    className?: string;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const variantClasses: Record<string, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-green-500/50 dark:hover:bg-green-600/70',
    secondary: 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600',
    danger: 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600',
    success: 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600',
    text: 'bg-transparent text-current hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
};

const sizeClasses: Record<string, string> = {
    small: '!px-3 !py-1 text-sm',
    medium: '!px-6 !py-2 text-sm',
    large: '!px-6 !py-3 text-lg',
};

const buttonVariants: Variants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: {
        scale: 1,
        opacity: 1,
        transition: { type: 'spring', stiffness: 300, damping: 25 },
    },
    hover: {
        scale: 1.05,
        transition: { type: 'spring', stiffness: 400, damping: 20 },
    },
    tap: {
        scale: 0.95,
        transition: { type: 'spring', stiffness: 500, damping: 30 },
    },
    exit: { scale: 0.8, opacity: 0, transition: { duration: 0.2 } },
};

/**
 * Props per il componente FDButton
 * @param children - Contenuto del bottone
 * @param variant - Varianti del bottone (primary, secondary, danger, success)
 * @param size - Dimensioni del bottone (small, medium, large)
 * @param loading - Indica se il bottone è in stato di caricamento
 * @param icon - Icona da visualizzare nel bottone
 * @param disabled - Indica se il bottone è disabilitato
 * @param className - Classi CSS aggiuntive per il bottone
 * @returns JSX Element - Il bottone con le proprietà specificate
 */
export const Button: React.FC<ButtonProps> = memo(({
    children,
    variant = 'primary',
    size = 'medium',
    loading = false,
    icon,
    disabled,
    className = '',
    onClick,
}) => {
    return (
        <motion.button
            className={`inline-flex items-center justify-center rounded-md transition-colors duration-150 focus:outline-none cursor-pointer
                ${variantClasses[variant]} ${sizeClasses[size]} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            disabled={disabled || loading}
            variants={buttonVariants}
            onClick={onClick}
            initial="initial"
            animate="animate"
            whileHover={!disabled ? 'hover' : undefined}
            whileTap={!disabled ? 'tap' : undefined}
            exit="exit"
        >
            {loading && (
                <span className="mr-2 animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full" />
            )}
            {icon && <span className="mr-2">{icon}</span>}
            {children}
        </motion.button>
    );
});

export default Button;