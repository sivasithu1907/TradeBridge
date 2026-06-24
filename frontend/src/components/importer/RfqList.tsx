import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Eye,
  Calendar,
  Building2
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { RFQ } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const RfqList: React.FC<{ onOpenCreateRfq: () => void }> = ({ onOpenCreateRfq }) => {
  const { rfqs, setSelectedRfqId, setActiveScreen, searchQuery, setSearchQuery, activeRole } = useMarketplace();
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const filteredRfqs = rfqs.filter(rfq => {
    const matchesSearch = 
      rfq.rfqNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfq.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfq.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfq.commodity.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'All' || rfq.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">
            {activeRole === 'importer' ? 'My RFQ Marketplace Feed' : 'Marketplace RFQ Opportunities'}
          </h2>
          <p className="text-xs text-[#6B7280] mt-1">
            {activeRole === 'importer' 
              ? 'Manage spot freight quotations broadcasted to competing forwarders'
              : 'Spot freight quotation requests currently open for carrier bidding'}
          </p>
        </div>

        {activeRole === 'importer' && (
          <Button variant="primary" onClick={onOpenCreateRfq} icon={<Plus className="w-4 h-4" />}>
            Create New RFQ
          </Button>
        )}
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {['All', 'Active', 'Quoted', 'Awarded', 'Expired'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-[#F7F8FA] text-[#EB5D0B] border border-[#EB5D0B]/30'
                  : 'text-[#6B7280] hover:bg-[#F7F8FA] hover:text-[#111827]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Local Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search RFQ #, corridor, tea..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#111827] focus:outline-none focus:border-[#EB5D0B] focus:bg-white"
          />
        </div>
      </div>

      {/* Table Feed */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#F7F8FA] text-[#6B7280] text-[11px] uppercase font-bold border-b border-[#F1F5F9]">
                <th className="py-3.5 px-6">RFQ Reference</th>
                <th className="py-3.5 px-6">Origin → Destination</th>
                <th className="py-3.5 px-6">Cargo & Incoterms</th>
                <th className="py-3.5 px-6">Ready & Expiry</th>
                <th className="py-3.5 px-6">Responses</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredRfqs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-[#6B7280] text-sm">
                    No matching RFQs found.
                  </td>
                </tr>
              ) : (
                filteredRfqs.map((rfq) => (
                  <tr key={rfq.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="py-4 px-6 font-mono">
                      <span className="font-bold text-[#111827] block">{rfq.rfqNumber}</span>
                      <span className="text-[10px] text-[#6B7280]">Created {rfq.createdAt}</span>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#111827]">{rfq.originCode}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#EB5D0B]" />
                        <span className="font-semibold text-[#111827]">{rfq.destCode}</span>
                      </div>
                      <p className="text-xs text-[#6B7280] truncate max-w-xs mt-0.5">{rfq.origin.split(',')[0]} → {rfq.destination.split(',')[0]}</p>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-gray-100 font-bold text-gray-700">{rfq.incoterms}</span>
                        <span className="font-medium text-xs">{rfq.containerType}</span>
                      </div>
                      <p className="text-xs text-[#6B7280] truncate max-w-xs mt-0.5">{rfq.commodity}</p>
                    </td>

                    <td className="py-4 px-6 font-mono text-xs">
                      <div className="flex items-center gap-1 text-gray-700">
                        <Calendar className="w-3 h-3 text-[#EB5D0B]" />
                        <span>{rfq.cargoReadyDate}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">Exp: {rfq.expiryDate}</p>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[#EB5D0B]">
                        <span className="w-2 h-2 rounded-full bg-[#EB5D0B]"></span>
                        <span>{rfq.responsesCount} Bids</span>
                      </div>
                      {rfq.bestOfferUsd && (
                        <p className="text-[11px] font-mono font-bold text-emerald-700 mt-0.5">Best: ${rfq.bestOfferUsd.toLocaleString()}</p>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <Badge variant={
                        rfq.status === 'Active' ? 'warning' :
                        rfq.status === 'Quoted' ? 'info' :
                        rfq.status === 'Awarded' ? 'success' : 'neutral'
                      }>
                        {rfq.status}
                      </Badge>
                    </td>

                    <td className="py-4 px-6 text-right">
                      {activeRole === 'importer' ? (
                        <Button 
                          size="sm" 
                          variant="primary"
                          onClick={() => { setSelectedRfqId(rfq.id); setActiveScreen('quote-compare'); }}
                        >
                          Compare Quotes
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="primary"
                          onClick={() => { setSelectedRfqId(rfq.id); setActiveScreen('forwarder-dash'); }}
                        >
                          Submit Bid
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
