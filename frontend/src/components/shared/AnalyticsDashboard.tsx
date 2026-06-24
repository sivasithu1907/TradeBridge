import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Ship, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight,
  PieChart,
  Calendar,
  Download
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { StatCard } from '../common/StatCard';
import { Button } from '../common/Button';

export const AnalyticsDashboard: React.FC = () => {
  const { kpis, shipments, activeRole } = useMarketplace();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 select-none animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">
            Executive Trade & Logistics Intelligence
          </h2>
          <p className="text-xs text-[#6B7280] mt-1">
            Real-time telemetry on freight spend velocity, carbon footprint, and carrier SLA compliance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" icon={<Calendar className="w-3.5 h-3.5" />}>
            Q2 2026
          </Button>
          <Button size="sm" variant="primary" icon={<Download className="w-3.5 h-3.5" />}>
            Export Executive Report
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total GMV / Freight Spend" 
          value="$1,420,500" 
          change="+18.4% YoY" 
          changeType="positive"
          icon={<DollarSign className="w-5 h-5 text-[#EB5D0B]" />}
        />
        <StatCard 
          title="On-Time Carrier Delivery" 
          value="98.2%" 
          change="+2.1% SLA Target" 
          changeType="positive"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600]" />}
        />
        <StatCard 
          title="Average Spot Quote Time" 
          value="14 mins" 
          change="-45% vs Legacy Broker" 
          changeType="positive"
          icon={<Clock className="w-5 h-5 text-amber-600]" />}
        />
        <StatCard 
          title="Scope 3 Carbon Offset" 
          value="142.8 mt" 
          change="Green Lane Verified" 
          changeType="neutral"
          icon={<Ship className="w-5 h-5 text-sky-600]" />}
        />
      </div>

      {/* Chart Mock Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Spend Velocity */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[#111827]">Monthly Freight Spend Allocation</h3>
              <p className="text-xs text-[#6B7280]">Ocean FCL vs Air Express GMV distribution (USD)</p>
            </div>
            <span className="text-xs font-mono font-bold text-[#EB5D0B] bg-[#F7F8FA] px-3 py-1 rounded-full">
              Live Feed
            </span>
          </div>

          <div className="h-64 flex items-end justify-between gap-4 pt-8 px-4 border-b border-[#F1F5F9] pb-4">
            {[
              { m: 'Jan', o: 65, a: 35 },
              { m: 'Feb', o: 70, a: 45 },
              { m: 'Mar', o: 55, a: 50 },
              { m: 'Apr', o: 85, a: 60 },
              { m: 'May', o: 95, a: 55 },
              { m: 'Jun', o: 80, a: 70 },
            ].map(col => (
              <div key={col.m} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex gap-1.5 h-48 items-end">
                  <div 
                    style={{ height: `${col.o}%` }} 
                    className="flex-1 bg-[#111827] rounded-t-lg transition-all hover:opacity-80 relative group"
                  >
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#111827] text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      ${col.o * 10}k
                    </span>
                  </div>
                  <div 
                    style={{ height: `${col.a}%` }} 
                    className="flex-1 bg-[#EB5D0B] rounded-t-lg transition-all hover:opacity-80 relative group"
                  >
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#EB5D0B] text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      ${col.a * 10}k
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold text-[#6B7280]">{col.m}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#111827]" />
              <span className="text-[#374151]">Ocean Container FCL</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#EB5D0B]" />
              <span className="text-[#374151]">Air Freight Express</span>
            </div>
          </div>
        </div>

        {/* Carrier Market Share */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-[#111827]">Carrier Volume Matrix</h3>
            <p className="text-xs text-[#6B7280]">Top performing alliance partners</p>

            <div className="space-y-4 mt-6">
              {[
                { name: 'Maersk Line Global', pct: 42, color: 'bg-[#111827]' },
                { name: 'CMA CGM Express', pct: 28, color: 'bg-[#EB5D0B]' },
                { name: 'MSC Mediterranean', pct: 18, color: 'bg-gray-400' },
                { name: 'Hapag-Lloyd Fleet', pct: 12, color: 'bg-gray-200' },
              ].map(c => (
                <div key={c.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#111827]">{c.name}</span>
                    <span className="font-mono text-[#6B7280]">{c.pct}%</span>
                  </div>
                  <div className="w-full bg-[#F7F8FA] h-2 rounded-full overflow-hidden">
                    <div className={`h-full ${c.color} rounded-full`} style={{ width: `${c.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 p-4 bg-[#F7F8FA] rounded-xl border border-[#E5E7EB]">
            <p className="text-[11px] font-bold text-[#111827] uppercase tracking-wider">AI Insight</p>
            <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
              Consolidating Rotterdam spot RFQs with CMA CGM could yield an additional 4.2% tariff reduction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
