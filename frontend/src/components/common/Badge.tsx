import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'brand' | 'success' | 'warning' | 'info' | 'neutral' | 'danger';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  className = ''
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs'
  };

  const variantStyles = {
    brand: 'bg-[#EB5D0B]/10 text-[#EB5D0B] border border-[#EB5D0B]/20 font-semibold',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200 font-medium',
    info: 'bg-blue-50 text-blue-700 border border-blue-200 font-medium',
    neutral: 'bg-[#F7F8FA] text-[#6B7280] border border-[#E5E7EB] font-medium',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200 font-medium'
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full uppercase tracking-wider ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {icon}
      <span>{children}</span>
    </span>
  );
};
