import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  valueColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  valueColor = 'text-[#111827]'
}) => {
  return (
    <div className="bg-white border border-[#E5E7EB] p-5 rounded-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-200 hover:border-gray-300 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] uppercase tracking-wider text-[#6B7280] font-semibold">{title}</p>
        {icon && <div className="text-[#6B7280]">{icon}</div>}
      </div>
      
      <div className="flex items-baseline justify-between mt-1">
        <span className={`text-2xl sm:text-3xl font-bold tracking-tight ${valueColor}`}>
          {value}
        </span>
        
        {trend && (
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
            trend.isPositive 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
              : 'bg-rose-50 text-rose-700 border-rose-100'
          }`}>
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-[#6B7280] mt-2 flex items-center gap-1">
          {subtitle}
        </p>
      )}
    </div>
  );
};
