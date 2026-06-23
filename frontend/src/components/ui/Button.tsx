import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  pressed?: boolean;
  noOverlay?: boolean;
}

const variantStyles: Record<string, string> = {
  primary: 'bg-[#CC791A] inset-shadow-sm inset-shadow-white/75 shadow-sm inset-y-20 inset-shadow-sm inset-shadow-white/50',
  secondary: 'bg-white text-text-dark outline outline-1 outline-offset-2 outline-white hover:text-brand-primary  shadow-sm',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  ghost: 'bg-transparent text-stone-600 hover:bg-stone-100',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-full',
  md: 'px-4 py-2 text-sm rounded-full',
  lg: 'px-6 py-10 pb-7 text-base rounded-full',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  pressed,
  noOverlay,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`group relative inline-flex items-center justify-center font-medium transition-all duration-100 disabled:opacity-40 overflow-hidden disabled:cursor-not-allowed disabled:active:translate-y-0 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
      {!noOverlay && (
        <div className={`bg-brand-primary top-0 backdrop-blur-lg inline-block absolute rounded-full w-full p-3 blur-[1px] transition-all shadow-[inset_0_4px_6px_2px_rgba(255,255,255,0.50)] duration-150 ease-out ${pressed ? 'h-15.75 shadow-[inset_0_4px_6px_2px_rgba(255,255,255,0.50)] ' : 'h-15 shadow-[inset_0_4px_6px_2px_rgba(255,255,255,0.50)] group-active:h-15.75'}`} />
      )}
    </button>
  );
}
