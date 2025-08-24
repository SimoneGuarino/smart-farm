import React, { memo } from 'react';
import { motion, Variants } from 'framer-motion';

type IconButtonProps = {
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'text' | 'general';
    size?: 'small' | 'medium' | 'large';
    ref?: React.Ref<HTMLButtonElement>;
    icon: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
    ariaLabel?: string;
    className?: string;
    loading?: boolean;
    type?: 'button' | 'submit' | 'reset';
    dataTooltipId?: string;
    dataTooltipContent?: string;
    style?: React.CSSProperties;
};

const variantClasses: Record<string, string> = {
    general: 'bg-gray-200/40 dark:!bg-neutral-800 hover:!bg-gray-300 dark:hover:!bg-neutral-700',
    primary: 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-red-500/50 dark:hover:bg-red-600/70',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
    danger: 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600',
    success: 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600',
    text: 'bg-transparent text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700',
};

const sizeClasses: Record<string, string> = {
    small: '!p-1 text-sm',
    medium: '!p-2 text-base',
    large: '!p-4 text-lg',
};

/** Variants per framer-motion */
const buttonVariants: Variants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    hover: { scale: 1.1, transition: { type: 'spring', stiffness: 400, damping: 20 } },
    tap: { scale: 0.95, transition: { type: 'spring', stiffness: 500, damping: 30 } },
    exit: { scale: 0.8, opacity: 0, transition: { duration: 0.2 } },
};

const IconButton: React.FC<IconButtonProps> = memo(({
    icon,
    ref,
    onClick,
    variant = 'general',
    size = 'medium',
    disabled = false,
    ariaLabel,
    className = '',
    loading = false,
    type = 'button',
    dataTooltipId,
    dataTooltipContent = '',
    style,
}) => (
    <motion.button
        type={type}
        ref={ref}
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        data-tooltip-id={dataTooltipId}
        data-tooltip-content={dataTooltipContent}
        className={`fd-icon-button ${className} ${variantClasses[variant]} ${sizeClasses[size]} 
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} rounded-full transition-colors duration-150 focus:outline-none
        items-center justify-center flex`}
        variants={buttonVariants}
        initial="initial"
        animate="animate"
        whileHover={!disabled ? 'hover' : undefined}
        whileTap={!disabled ? 'tap' : undefined}
        exit="exit"
        style={style}
    >
        {loading ? <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-700 dark:border-gray-500 dark:border-t-white rounded-full animate-spin" />
            : icon}
    </motion.button>
));

export default IconButton;