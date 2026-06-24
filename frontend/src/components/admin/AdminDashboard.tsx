import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  TrendingUp,
  Building,
  AlertTriangle,
  Loader2,
  Package,
  FileText,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { adminApi, AdminStats } from '../../api/admin';
import { StatCard } from '../common/StatCard';
import { Button } from '../common/Button';

export const AdminDashboard: React.FC = () => {
  const { setActiveScreen } = useMarketplace();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .getStats()
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load stats'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-[#6B7280] animate-spin" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-sm text-red-700">
          Couldn't load marketplace stats: {error}
        </div>
      </div>
    );
  }

  const importerCount = Number(stats.companiesByType.find((c) => c.company_type === 'importer')?.count ?? 0);
  const forwarderCount = Number(stats.companiesByType.find((c) => c.company_type === 'forwarder')?.count ?? 0);
  const activeRfqCount = Number(stats.rfqsByStatus.find((r) => r.status === 'active')?.count ?? 0);
  const totalRfqCount = stats.rfqsByStatus.reduce((sum, r) => sum + Number(r.count), 0);
  const confirmedBookings = stats.bookingsByStatus.find((b) => b.status === 'confirmed');
  const totalBookingValue = stats.bookingsByStatus.reduce((sum, b) => sum + Number(b.total_value), 0);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 select-none animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">
            Platform Overview
          </h2>
          <p className="text-xs text-[#6B7280] mt-1">
            Marketplace activity across all importer and forwarder companies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => setActiveScreen('admin-users')}>
            Manage Companies ({importerCount + forwarderCount})
          </Button>
          <Button size="sm" variant="primary" onClick={() => setActiveScreen('admin-marketplace')}>
            RFQ Ledger
          </Button>
        </div>
      </div>

      {/* Stats -- all sourced from /api/admin/stats, no fabricated figures */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Booking Value"
          value={`$${totalBookingValue.toLocaleString()}`}
          subtitle={`${confirmedBookings ? confirmedBookings.count : 0} confirmed bookings`}
          icon={<TrendingUp className="w-5 h-5 text-[#EB5D0B]" />}
        />
        <StatCard
          title="Registered Companies"
          value={importerCount + forwarderCount}
          subtitle={`${importerCount} importers, ${forwarderCount} forwarders`}
          icon={<Building className="w-5 h-5 text-[#111827]" />}
        />
        <StatCard
          title="Forwarder Verification"
          value={stats.pendingForwarderCount}
          subtitle="Pending admin approval"
          icon={<ShieldAlert className="w-5 h-5 text-amber-600" />}
        />
        <StatCard
          title="RFQ Activity"
          value={`${activeRfqCount} Active`}
          subtitle={`${totalRfqCount} total RFQs on platform`}
          icon={<FileText className="w-5 h-5 text-emerald-600" />}
        />
      </div>

      {/* Pending verification alert */}
      {stats.pendingForwarderCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-xl text-amber-800">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-900">
                {stats.pendingForwarderCount} forwarder {stats.pendingForwarderCount === 1 ? 'company' : 'companies'} awaiting verification
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                These companies can browse the RFQ marketplace but cannot submit quotes until approved.
              </p>
            </div>
          </div>
          <Button size="sm" variant="primary" onClick={() => setActiveScreen('admin-users')}>
            Review Companies
          </Button>
        </div>
      )}

      {/* Breakdown tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs space-y-3">
          <h3 className="font-bold text-base text-[#111827] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#EB5D0B]" /> RFQs by Status
          </h3>
          {stats.rfqsByStatus.length === 0 ? (
            <p className="text-xs text-[#6B7280]">No RFQs on the platform yet.</p>
          ) : (
            stats.rfqsByStatus.map((r) => (
              <div key={r.status} className="p-3 bg-[#F7F8FA] rounded-xl border border-[#E5E7EB] flex justify-between items-center">
                <span className="text-xs font-semibold text-[#374151] capitalize">{r.status}</span>
                <span className="text-sm font-bold text-[#111827]">{r.count}</span>
              </div>
            ))
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs space-y-3">
          <h3 className="font-bold text-base text-[#111827] flex items-center gap-2">
            <Package className="w-4 h-4 text-[#EB5D0B]" /> Bookings by Status
          </h3>
          {stats.bookingsByStatus.length === 0 ? (
            <p className="text-xs text-[#6B7280]">No bookings on the platform yet.</p>
          ) : (
            stats.bookingsByStatus.map((b) => (
              <div key={b.status} className="p-3 bg-[#F7F8FA] rounded-xl border border-[#E5E7EB] flex justify-between items-center">
                <span className="text-xs font-semibold text-[#374151] capitalize">{b.status}</span>
                <span className="text-sm font-bold text-[#111827]">
                  {b.count} - ${Number(b.total_value).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
