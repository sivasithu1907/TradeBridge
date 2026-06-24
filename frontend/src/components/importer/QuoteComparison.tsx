import React, { useState } from 'react';
import { 
  Star, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ArrowLeft, 
  Award, 
  ChevronDown, 
  ChevronUp,
  AlertTriangle,
  Info,
  DollarSign
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const QuoteComparison: React.FC = () => {
  const { quotations, rfqs, selectedRfqId, acceptQuote, setActiveScreen, activeRole } = useMarketplace();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Find the selected RFQ or default to the first one
  const currentRfq = rfqs.find(r => r.id === selectedRfqId) || rfqs[0];
  const rfqQuotes = quotations.filter(q => q.rfqId === currentRfq.id || q.rfqNumber === currentRfq.rfqNumber);

  // Sort by lowest price first
  const sortedQuotes = [...rfqQuotes].sort((a, b) => a.priceUsd - b.priceUsd);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 select-none animate-in fade-in duration-200">
      {/* Back & RFQ Summary Header */}
      <div>
        <button
          onClick={() => setActiveScreen('rfq-list')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B7280] hover:text-[#EB5D0B] mb-4 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to RFQ Feed
        </button>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm px-2 py-0.5 bg-[#F7F8FA] border rounded text-[#111827]">
                {currentRfq.rfqNumber}
              </span>
              <Badge variant="warning">{currentRfq.status}</Badge>
            </div>
            <h2 className="text-xl md:text-2xl font-bold mt-2 text-[#111827]">
              {currentRfq.origin} → {currentRfq.destination}
            </h2>
            <p className="text-xs text-[#6B7280] mt-1">
              {currentRfq.containerType} • {currentRfq.commodity} ({currentRfq.weightKg.toLocaleString()} kg) • Ready: {currentRfq.cargoReadyDate}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#F7F8FA] p-4 rounded-xl border border-[#E5E7EB]">
            <div>
              <p className="text-[10px] uppercase font-bold text-[#6B7280]">Market Lowest</p>
              <p className="text-xl font-bold font-mono text-emerald-700">
                {sortedQuotes.length > 0 ? `$${sortedQuotes[0].priceUsd.toLocaleString()}` : '—'}
              </p>
            </div>
            <div className="w-px h-8 bg-[#E5E7EB]"></div>
            <div>
              <p className="text-[10px] uppercase font-bold text-[#6B7280]">Total Offers</p>
              <p className="text-xl font-bold font-mono text-[#EB5D0B]">{sortedQuotes.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Matrix Table (Flexport + Skyscanner inspired) */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#F1F5F9] bg-[#FAFAFA] flex items-center justify-between">
          <h3 className="font-bold text-base text-[#111827]">Carrier Quotation Comparison Matrix</h3>
          <span className="text-xs text-[#6B7280]">Sorted by Best All-In Rate</span>
        </div>

        {sortedQuotes.length === 0 ? (
          <div className="text-center py-20 text-[#6B7280] text-sm">
            No quotations received for this RFQ yet. Forwarders are calculating rates.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#F7F8FA] text-[#6B7280] text-[11px] uppercase font-bold border-b border-[#F1F5F9]">
                  <th className="py-4 px-6">Freight Forwarder</th>
                  <th className="py-4 px-6">Company Rating</th>
                  <th className="py-4 px-6">All-In Price (USD)</th>
                  <th className="py-4 px-6">Transit Time</th>
                  <th className="py-4 px-6">Service & Routing</th>
                  <th className="py-4 px-6">Response Time</th>
                  <th className="py-4 px-6">Score</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {sortedQuotes.map((quote, idx) => {
                  const isLowest = idx === 0;
                  const isExpanded = expandedId === quote.id;

                  return (
                    <React.Fragment key={quote.id}>
                      <tr className={`hover:bg-[#FAFAFA] transition-colors ${quote.status === 'Accepted' ? 'bg-emerald-50/40' : ''}`}>
                        {/* Forwarder */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB] flex items-center justify-center font-bold text-xs text-[#111827]">
                              {quote.forwarderName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[#111827]">{quote.forwarderName}</span>
                                {quote.verifiedBadge && (
                                  <ShieldCheck className="w-4 h-4 text-[#EB5D0B]" title="Verified KYC Badge" />
                                )}
                              </div>
                              <button 
                                onClick={() => setExpandedId(isExpanded ? null : quote.id)}
                                className="text-[11px] text-[#EB5D0B] hover:underline flex items-center gap-0.5 mt-0.5 cursor-pointer"
                              >
                                {isExpanded ? 'Hide Charges' : 'View Breakdown'} {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Rating */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1 font-bold text-xs text-[#111827]">
                            <Star className="w-3.5 h-3.5 text-[#EB5D0B] fill-[#EB5D0B]" />
                            <span>{quote.forwarderRating.toFixed(1)}</span>
                            <span className="text-gray-400 font-normal">/ 5.0</span>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-4 px-6 font-mono">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-[#111827]">
                              ${quote.priceUsd.toLocaleString()}
                            </span>
                            {isLowest && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                                Best Rate
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400">Valid til {quote.validityDate}</p>
                        </td>

                        {/* Transit */}
                        <td className="py-4 px-6 font-mono text-xs">
                          <span className="font-bold text-[#111827] text-sm">{quote.transitTimeDays} Days</span>
                          <p className="text-[10px] text-gray-500">Port-to-Port</p>
                        </td>

                        {/* Service Type */}
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F7F8FA] border border-[#E5E7EB] text-[#374151]">
                            {quote.serviceType}
                          </span>
                        </td>

                        {/* Response Time */}
                        <td className="py-4 px-6 font-mono text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#EB5D0B]" />
                            <span>{quote.responseTimeHrs}h</span>
                          </div>
                        </td>

                        {/* Performance Score */}
                        <td className="py-4 px-6 font-mono">
                          <span className={`font-bold text-xs px-2 py-0.5 rounded ${quote.performanceScore >= 95 ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                            {quote.performanceScore}%
                          </span>
                        </td>

                        {/* Action Award Button */}
                        <td className="py-4 px-6 text-right">
                          {quote.status === 'Accepted' ? (
                            <Badge variant="success" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>Awarded</Badge>
                          ) : quote.status === 'Rejected' ? (
                            <span className="text-xs text-gray-400 font-medium">Not Selected</span>
                          ) : activeRole === 'importer' ? (
                            <Button 
                              size="sm" 
                              variant="primary"
                              onClick={() => acceptQuote(quote.id)}
                            >
                              Award Shipment
                            </Button>
                          ) : (
                            <span className="text-xs text-gray-500 font-medium">Submitted</span>
                          )}
                        </td>
                      </tr>

                      {/* Expanded Charges Breakdown Accordion */}
                      {isExpanded && (
                        <tr className="bg-[#F7F8FA] border-b border-[#E5E7EB]">
                          <td colSpan={8} className="p-6">
                            <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 max-w-3xl mx-auto shadow-2xs space-y-4">
                              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                                <h4 className="font-bold text-xs uppercase tracking-wider text-[#EB5D0B]">
                                  Official Port & Freight Charges Breakdown
                                </h4>
                                <span className="font-mono text-xs text-gray-500">Quote #{quote.quoteNumber}</span>
                              </div>

                              <div className="space-y-2 divide-y divide-[#F1F5F9]">
                                {quote.chargesBreakdown.map((ch, cIdx) => (
                                  <div key={cIdx} className="pt-2 flex justify-between text-xs font-mono">
                                    <span className="text-gray-700">{ch.name}</span>
                                    <span className="font-bold text-[#111827]">${ch.amountUsd.toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>

                              <div className="pt-3 border-t border-gray-200 flex justify-between items-center text-sm font-bold font-mono text-[#111827]">
                                <span>Total All-In Freight Rate</span>
                                <span className="text-[#EB5D0B] text-base">${quote.priceUsd.toLocaleString()} USD</span>
                              </div>

                              {quote.remarks && (
                                <div className="p-3 bg-[#F7F8FA] rounded-lg text-xs text-gray-600 flex items-start gap-2 mt-3">
                                  <Info className="w-4 h-4 text-[#EB5D0B] flex-shrink-0 mt-0.5" />
                                  <span>Carrier Note: {quote.remarks}</span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Escrow Guarantee Footer */}
      <div className="p-6 bg-white border border-[#E5E7EB] rounded-2xl flex items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-sm text-[#111827]">Binding Quotation Guarantee</h4>
            <p className="text-xs text-[#6B7280]">Once awarded, the freight forwarder cannot alter rate or transit charges.</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setActiveScreen('messages')}>
          Message Carriers
        </Button>
      </div>
    </div>
  );
};
