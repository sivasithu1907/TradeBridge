import React, { useEffect, useState } from 'react';
import { Search, Loader2, FileText } from 'lucide-react';
import { rfqApi } from '../../api/rfqs';
import { RFQ } from '../../types';
import { Badge } from '../common/Badge';

export const MarketplaceManagement: React.FC = () => {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    rfqApi
      .list()
      .then(setRfqs)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load RFQs'))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredRfqs = rfqs.filter(
    (r) =>
      r.rfqNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.commodity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusBadgeVariant = (status: RFQ['status']) => {
    if (status === 'Active') return 'success';
    if (status === 'Quoted') return 'info';
    if (status === 'Awarded') return 'brand';
    return 'neutral'; // Expired
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none animate-in fade-in duration-200">
      <div className="pb-4 border-b border-[#E5E7EB] flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">
            Marketplace RFQ Ledger
          </h2>
          <p className="text-xs text-[#6B7280] mt-1">
            Every request for quotation across the platform, regardless of importer
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search RFQ, route, or commodity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl pl-9 pr-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#EB5D0B]"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 bg-[#F7F8FA] border-b border-[#E5E7EB] font-bold text-xs text-[#111827] flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-[#EB5D0B]" /> {rfqs.length} Total RFQs on Platform
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-[#6B7280] animate-spin" />
          </div>
        ) : filteredRfqs.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#6B7280]">
            {rfqs.length === 0 ? 'No RFQs have been created yet.' : 'No RFQs match your search.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#F7F8FA] text-[#6B7280] text-[11px] uppercase font-bold border-b border-[#F1F5F9]">
                  <th className="py-3.5 px-6">RFQ Number</th>
                  <th className="py-3.5 px-6">Lane</th>
                  <th className="py-3.5 px-6">Freight Type</th>
                  <th className="py-3.5 px-6">Quotes Received</th>
                  <th className="py-3.5 px-6">Best Offer</th>
                  <th className="py-3.5 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredRfqs.map((rfq) => (
                  <tr key={rfq.id} className="hover:bg-[#FAFAFA]">
                    <td className="py-4 px-6 font-mono font-bold text-xs text-[#111827]">{rfq.rfqNumber}</td>
                    <td className="py-4 px-6 font-extrabold text-xs text-[#111827]">
                      {rfq.originCode} &rarr; {rfq.destCode}
                    </td>
                    <td className="py-4 px-6 text-xs text-[#374151]">{rfq.freightType}</td>
                    <td className="py-4 px-6 font-mono text-xs font-bold text-[#EB5D0B]">{rfq.responsesCount}</td>
                    <td className="py-4 px-6 font-mono text-xs font-bold text-[#111827]">
                      {rfq.bestOfferUsd ? `$${rfq.bestOfferUsd.toLocaleString()}` : '\u2014'}
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={statusBadgeVariant(rfq.status)}>{rfq.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
