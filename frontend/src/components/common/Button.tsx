import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  // Strict Orange Usage Rules: Primary button = White bg, 1px Orange border, Orange text. Hover: Orange fill with white text.
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 cursor-pointer focus:outline-none select-none';
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-2.5 text-base gap-2.5'
  };

  const variantStyles = {
    primary: disabled 
      ? 'bg-white border border-gray-200 text-gray-400 cursor-not-allowed shadow-none'
      : 'bg-white border border-[#EB5D0B] text-[#EB5D0B] hover:bg-[#EB5D0B] hover:text-white shadow-[0_2px_4px_rgba(235,93,11,0.06)] active:scale-[0.99]',
    secondary: disabled
      ? 'bg-transparent border border-gray-100 text-gray-300 cursor-not-allowed'
      : 'bg-transparent border border-[#E5E7EB] text-[#374151] hover:bg-[#F7F8FA] hover:border-gray-300 active:scale-[0.99]',
    danger: disabled
      ? 'bg-white border border-gray-200 text-gray-300 cursor-not-allowed'
      : 'bg-white border border-red-500 text-red-600 hover:bg-red-50 active:scale-[0.99]',
    ghost: disabled
      ? 'text-gray-300 cursor-not-allowed'
      : 'text-gray-600 hover:bg-gray-100 active:scale-[0.99]'
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
