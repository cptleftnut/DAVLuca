import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, children, id, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      id={id}
      className={cn(
        'bg-slate-900/90 border border-slate-800 rounded-xl shadow-lg backdrop-blur-sm text-slate-100 transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-5 py-4 border-b border-slate-800/80 flex flex-col gap-1', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('font-semibold text-lg tracking-tight text-slate-100 flex items-center gap-2', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-xs text-slate-400 font-normal leading-relaxed', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-5', className)} {...props}>
      {children}
    </div>
  );
}

export function Badge({
  className,
  variant = 'default',
  children,
  id,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'outline' | 'critical' | 'high' | 'medium' | 'low' | 'success' | 'indigo' | 'amber';
}) {
  const variantStyles = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    outline: 'border border-slate-700 text-slate-300 bg-transparent',
    critical: 'bg-red-500/15 text-red-400 border border-red-500/30',
    high: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
    medium: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    low: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    indigo: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
    amber: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  };

  return (
    <span
      id={id}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium uppercase tracking-wider',
        variantStyles[variant] || variantStyles.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function Button({
  className,
  variant = 'default',
  size = 'default',
  children,
  id,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'default' | 'lg' | 'icon';
}) {
  const variantClasses = {
    default: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm',
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-600/20 active:scale-[0.98]',
    secondary: 'bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-md shadow-cyan-600/20',
    outline: 'border border-slate-700 hover:bg-slate-800/80 text-slate-300',
    ghost: 'hover:bg-slate-800 text-slate-300',
    danger: 'bg-red-600/80 hover:bg-red-600 text-white border border-red-500/40',
  };

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs rounded-lg',
    default: 'h-9 px-4 text-sm rounded-lg',
    lg: 'h-11 px-6 text-base rounded-xl',
    icon: 'h-9 w-9 p-0 flex items-center justify-center rounded-lg',
  };

  return (
    <button
      id={id}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer gap-2',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
