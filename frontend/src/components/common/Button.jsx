import React from 'react';
import MagneticButton from './MagneticButton';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  icon: Icon,
  magnetic = true,
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium tracking-wide transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const variants = {
    primary:
      'bg-charcoal dark:bg-accent hover:bg-accent dark:hover:bg-accent-hover text-white rounded-full shadow-sm hover:shadow-md active:scale-[0.98]',
    accent:
      'bg-accent hover:bg-accent-hover text-white rounded-full shadow-sm hover:shadow-md active:scale-[0.98]',
    secondary:
      'bg-surface hover:bg-surfaceLight text-textPrimary border border-borderMuted hover:border-accent/40 rounded-full active:scale-[0.98]',
    ghost:
      'bg-transparent hover:bg-secondary text-textSecondary hover:text-textPrimary rounded-full',
    outline:
      'bg-transparent border border-textPrimary/20 hover:border-textPrimary text-textPrimary rounded-full active:scale-[0.98]',
  };

  const sizes = {
    sm: 'text-xs px-4 py-2 gap-1.5 font-medium',
    md: 'text-sm px-6 py-2.5 gap-2 font-medium',
    lg: 'text-base px-8 py-3.5 gap-2.5 font-medium',
  };

  const buttonContent = (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 stroke-[1.75] transition-transform duration-200 group-hover:translate-x-0.5" />}
      <span>{children}</span>
    </button>
  );

  if (magnetic && !disabled && (variant === 'primary' || variant === 'accent')) {
    return <MagneticButton>{buttonContent}</MagneticButton>;
  }

  return buttonContent;
}
