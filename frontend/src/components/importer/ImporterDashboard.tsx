import React from 'react';
import { 
  FileText, 
  Ship, 
  DollarSign, 
  Clock, 
  ArrowRight, 
  Plus, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  TrendingDown
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { StatCard } from '../common/StatCard';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const ImporterDashboard: React.FC<{ onOpenCreateRfq: () => void }> = ({ onOpenCreateRfq }) => {
  const { rfqs, quotations, shipments, setActiveScreen, setSelectedRfqId, setSelectedShipmentId } = useMarketplace();

  const activeRfqsCount = rfqs.filter(r => r.status === 'Active' || r.status === 'Quoted').length;
  const quotesCount = quotations.filter(q => q.status === 'Submitted').length;
  const activeShipmentsCount = shipments.filter(s => s.currentStatus !== 'Delivered').length;
  const deliveredCount = shipments.filter(s => s.currentStatus === 'Delivered').length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 select-none animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="brand">Ceylon Global Exports HQ</Badge>
            <span className="text-xs text-[#6B7280]">Verified B2B Enterprise Account</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#111827] mt-2">
            Global Trade Overview
          </h2>
          <p className="text-xs md:text-sm text-[#6B7280] mt-1">
            Real-time quotation bids on your spot freight corridors and interactive vessel tracking.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Button variant="secondary" onClick={() => setActiveScreen('rfq-list')}>
            Marketplace Feed
          </Button>
          <Button variant="primary" onClick={onOpenCreateRfq} icon={<Plus className="w-4 h-4" />}>
            New RFQ
          </Button>
        </div>
      </div>

      {/* KPI Widgets Grid (12-column grid, Clean Light Styling) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Spot RFQs"
          value={activeRfqsCount < 10 ? `0${activeRfqsCount}` : activeRfqsCount}
          subtitle="Awaiting carrier rates"
          trend={{ value: '+2 New Broadcasts', isPositive: true }}
          icon={<FileText className="w-5 h-5 text-[#EB5D0B]" />}
        />
        <StatCard
          title="Quotations Received"
          value={quotesCount < 10 ? `0${quotesCount}` : quotesCount}
          subtitle="All-in spot offers ready"
          trend={{ value: 'Avg. $2,850 Rate', isPositive: true }}
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
          valueColor="text-[#EB5D0B]"
        />
        <StatCard
          title="Active Shipments"
          value={activeShipmentsCount < 10 ? `0${activeShipmentsCount}` : activeShipmentsCount}
          subtitle="Containers in transit"
          trend={{ value: '100% On-Schedule', isPositive: true }}
          icon={<Ship className="w-5 h-5 text-blue-600" />}
        />
        <StatCard
          title="Monthly Savings"
          value="$14,820"
          subtitle="v. Traditional Forwarder benchmark"
          trend={{ value: '18.4% Below Spot Avg', isPositive: true }}
          icon={<TrendingDown className="w-5 h-5 text-emerald-600" />}
          valueColor="text-emerald-700"
        />
      </div>

      {/* Main Grid: Active RFQs & Recent Shipments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active RFQs Marketplace Table */}
        <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9]">
              <div>
                <h3 className="font-bold text-base text-[#111827]">Active Quotation Requests</h3>
                <p className="text-xs text-[#6B7280]">Forwarders actively submitting competitive rates</p>
              </div>
              <button 
                onClick={() => setActiveScreen('rfq-list')}
                className="text-xs font-bold text-[#EB5D0B] hover:underline flex items-center gap-1 cursor-pointer"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-[#F7F8FA] text-[11px] uppercase font-bold text-[#6B7280] border-b border-[#F1F5F9]">
                    <th className="py-2.5 px-4">RFQ / Ready</th>
                    <th className="py-2.5 px-4">Corridor</th>
                    <th className="py-2.5 px-4">Bids</th>
                    <th className="py-2.5 px-4">Best Offer</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {rfqs.slice(0, 3).map((rfq) => (
                    <tr key={rfq.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="py-3 px-4 font-mono text-xs">
                        <p className="font-semibold text-[#111827]">{rfq.rfqNumber}</p>
                        <p className="text-[10px] text-[#6B7280]">{rfq.cargoReadyDate}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-xs text-[#111827]">{rfq.originCode} → {rfq.destCode}</p>
                        <p className="text-[10px] text-[#6B7280]">{rfq.containerType}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-orange-50 text-[#EB5D0B] font-bold text-xs">
                          {rfq.responsesCount} Quotes
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs font-bold text-emerald-700">
                        {rfq.bestOfferUsd ? `$${rfq.bestOfferUsd.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button 
                          size="sm" 
                          variant="primary"
                          onClick={() => { setSelectedRfqId(rfq.id); setActiveScreen('quote-compare'); }}
                        >
                          Compare
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#F1F5F9] bg-[#F7F8FA] rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#6B7280]">
              <AlertCircle className="w-4 h-4 text-[#EB5D0B]" />
              <span>Need rates for urgent air shipment to Frankfurt?</span>
            </div>
            <button onClick={onOpenCreateRfq} className="text-xs font-bold text-[#EB5D0B] hover:underline cursor-pointer">
              Broadcast Air RFQ
            </button>
          </div>
        </div>

        {/* Live Shipments Map & Tracking Card */}
        <div className="lg:col-span-5 bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9]">
              <div>
                <h3 className="font-bold text-base text-[#111827]">Live Container Status</h3>
                <p className="text-xs text-[#6B7280]">Real-time milestone progression</p>
              </div>
              <Badge variant="info">In Transit</Badge>
            </div>

            {shipments.slice(0, 2).map((shipment) => (
              <div key={shipment.id} className="mt-4 p-4 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[#6B7280]">{shipment.bookingNumber}</span>
                    <p className="text-sm font-bold text-[#111827] leading-tight">{shipment.origin.split(' ')[0]} → {shipment.destination.split(' ')[0]}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">Carrier: <span className="font-semibold text-[#111827]">{shipment.forwarderName}</span></p>
                  </div>
                  <span className="text-xs font-bold text-[#EB5D0B]">{shipment.progressPct}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#E5E7EB] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#EB5D0B] h-full transition-all duration-500" style={{ width: `${shipment.progressPct}%` }}></div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#6B7280] pt-1">
                  <span>Vessel: {shipment.vesselName}</span>
                  <span className="font-semibold text-[#111827]">ETA: {shipment.eta.split(' ')[0]}</span>
                </div>

                <button
                  onClick={() => { setSelectedShipmentId(shipment.id); setActiveScreen('shipment-tracking'); }}
                  className="w-full pt-2 border-t border-[#E5E7EB] text-xs font-bold text-[#EB5D0B] hover:underline flex items-center justify-center gap-1 cursor-pointer"
                >
                  Interactive Corridor Map <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <button 
              onClick={() => setActiveScreen('shipment-tracking')}
              className="text-xs font-semibold text-[#6B7280] hover:text-[#111827] cursor-pointer"
            >
              View all delivered & active cargo history ({shipments.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
