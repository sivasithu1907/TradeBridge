import React, { useState } from 'react';
import { Search, Filter, Ship, Clock, DollarSign, ArrowRight, ShieldCheck, CheckCircle2, Plus } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { QuoteSubmissionModal } from './QuoteSubmissionModal';

export const ForwarderRfqFeed: React.FC = () => {
  const { rfqs, currentUser, selectedRfqId, setSelectedRfqId } = useMarketplace();
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState<string>('All');
  const [quotingRfq, setQuotingRfq] = useState<any | null>(null);

  const filteredRfqs = rfqs.filter(r => {
    const matchesSearch = r.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.origin.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.destination.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.cargoDetails.commodity.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMode = modeFilter === 'All' || r.mode === modeFilter;
    return matchesSearch && matchesMode;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">
            Live Importer Spot RFQ Marketplace
          </h2>
          <p className="text-xs text-[#6B7280] mt-1">
            Submit verified freight proposals against verified Fortune-500 & Mid-Market cargo requests
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#F7F8FA] border border-[#E5E7EB] px-3 py-1.5 rounded-xl text-xs font-semibold text-[#111827]">
          <ShieldCheck className="w-4 h-4 text-[#EB5D0B]" />
          <span>FMC Escrow Monitored</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider pr-2">Mode:</span>
          {['All', 'Ocean FCL', 'Ocean LCL', 'Air Freight'].map(m => (
            <button
              key={m}
              onClick={() => setModeFilter(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                modeFilter === m 
                  ? 'bg-[#F7F8FA] text-[#EB5D0B] border border-[#EB5D0B]/30' 
                  : 'text-[#6B7280] hover:bg-[#F7F8FA] hover:text-[#111827]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search port, commodity or ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl pl-9 pr-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#EB5D0B]"
          />
        </div>
      </div>

      {/* RFQ List Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredRfqs.map(rfq => {
          const hasQuoted = rfq.quotes.some(q => q.forwarderId === currentUser.id);
          return (
            <div key={rfq.id} className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs hover:border-gray-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-extrabold text-[#111827] bg-[#F7F8FA] px-2.5 py-1 rounded-lg border border-[#E5E7EB]">
                    {rfq.referenceNumber}
                  </span>
                  <Badge variant={rfq.status === 'Open' ? 'success' : 'neutral'}>
                    {rfq.status === 'Open' ? '● Active Tender' : 'Closed'}
                  </Badge>
                  <span className="text-xs font-semibold text-[#6B7280]">Target Date: {rfq.targetShipDate}</span>
                </div>

                <div className="flex items-center gap-4 text-base font-extrabold text-[#111827]">
                  <div className="flex items-center gap-2">
                    <Ship className="w-4 h-4 text-[#EB5D0B]" />
                    <span>{rfq.origin.city} ({rfq.origin.code})</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <span>{rfq.destination.city} ({rfq.destination.code})</span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#374151] bg-[#F7F8FA] p-3 rounded-xl border border-[#E5E7EB]">
                  <div><span className="text-[#6B7280]">Mode:</span> <span className="font-bold">{rfq.mode}</span></div>
                  <div><span className="text-[#6B7280]">Commodity:</span> <span className="font-bold">{rfq.cargoDetails.commodity}</span></div>
                  <div><span className="text-[#6B7280]">Containers:</span> <span className="font-bold">{rfq.cargoDetails.quantity}x {rfq.cargoDetails.containerType}</span></div>
                  <div><span className="text-[#6B7280]">Weight:</span> <span className="font-bold">{rfq.cargoDetails.weightKg} kg</span></div>
                  <div><span className="text-[#6B7280]">Incoterms:</span> <span className="font-bold">{rfq.incoterms}</span></div>
                </div>
              </div>

              <div className="flex flex-col items-end justify-center gap-3 border-t md:border-t-0 md:border-l border-[#E5E7EB] pt-4 md:pt-0 md:pl-6 min-w-[180px]">
                <div className="text-right">
                  <span className="text-[11px] font-bold text-[#6B7280] block">Current Lowest Bid</span>
                  <span className="text-lg font-extrabold font-mono text-[#111827]">
                    {rfq.quotes.length > 0 ? `$${Math.min(...rfq.quotes.map(q => q.totalAmount))}` : 'No bids yet'}
                  </span>
                </div>

                {hasQuoted ? (
                  <Button fullWidth variant="secondary" disabled icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}>
                    Quote Submitted
                  </Button>
                ) : (
                  <Button fullWidth variant="primary" onClick={() => setQuotingRfq(rfq)}>
                    Submit Spot Quote
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quoting Modal */}
      {quotingRfq && (
        <QuoteSubmissionModal rfq={quotingRfq} onClose={() => setQuotingRfq(null)} />
      )}
    </div>
  );
};
