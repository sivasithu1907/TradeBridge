import React from 'react';
import { 
  DollarSign, 
  Send, 
  Award, 
  Clock, 
  TrendingUp, 
  Ship, 
  CheckCircle2, 
  ArrowUpRight, 
  Filter,
  Search
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { StatCard } from '../common/StatCard';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const ForwarderDashboard: React.FC = () => {
  const { rfqs, shipments, setActiveScreen, setSelectedRfqId } = useMarketplace();

  const openRfqs = rfqs.filter(r => r.status === 'Open');
  const activeBookings = shipments.filter(s => s.status !== 'Delivered');

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 select-none animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="success">● Verified Tier 1 Alliance Forwarder</Badge>
            <span className="text-xs font-mono text-[#6B7280]">FMC License #904291</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#111827] mt-2 tracking-tight">
            Apex Global Forwarding Command Center
          </h2>
          <p className="text-xs md:text-sm text-[#6B7280] mt-1">
            Browse institutional spot RFQs, submit binding rate matrices, and manage active vessel milestones
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="secondary" onClick={() => setActiveScreen('forwarder-shipments')}>
            Active Bookings ({activeBookings.length})
          </Button>
          <Button variant="primary" onClick={() => setActiveScreen('forwarder-feed')} icon={<Send className="w-4 h-4" />}>
            Browse Spot RFQs ({openRfqs.length})
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Won Quoted Volume" 
          value="$894,200" 
          change="+24% vs Q1" 
          changeType="positive"
          icon={<DollarSign className="w-5 h-5 text-[#EB5D0B]" />}
        />
        <StatCard 
          title="Active Open Opportunities" 
          value={`${openRfqs.length} RFQs`} 
          change="Rotterdam & Shanghai" 
          changeType="neutral"
          icon={<Ship className="w-5 h-5 text-[#111827]" />}
        />
        <StatCard 
          title="Win Rate Ratio" 
          value="42.8%" 
          change="Top 5% Marketplace" 
          changeType="positive"
          icon={<Award className="w-5 h-5 text-amber-600" />}
        />
        <StatCard 
          title="Average Quote Turnaround" 
          value="18 mins" 
          change="-4 mins SLA Target" 
          changeType="positive"
          icon={<Clock className="w-5 h-5 text-emerald-600" />}
        />
      </div>

      {/* Open RFQ Opportunities Feed */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-[#111827]">Urgent Importer Spot RFQs</h3>
            <p className="text-xs text-[#6B7280]">High-intent cargo requests requiring spot tariff pricing</p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setActiveScreen('forwarder-feed')} icon={<ArrowUpRight className="w-3.5 h-3.5" />}>
            View Full Feed
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {openRfqs.slice(0, 3).map(rfq => (
            <div key={rfq.id} className="p-5 rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] hover:border-[#EB5D0B]/50 transition-all space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <span className="font-mono text-xs font-bold text-[#111827]">{rfq.referenceNumber}</span>
                  <Badge variant="warning">Expires {rfq.expiresAt}</Badge>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm font-extrabold text-[#111827]">
                  <span>{rfq.origin.code}</span>
                  <span className="text-[#EB5D0B]">→</span>
                  <span>{rfq.destination.code}</span>
                </div>
                <p className="text-xs text-[#6B7280] mt-1">{rfq.origin.city} to {rfq.destination.city}</p>
                <div className="mt-3 text-xs bg-white p-2.5 rounded-xl border border-[#E5E7EB] text-[#374151]">
                  <p><span className="font-semibold">Commodity:</span> {rfq.cargoDetails.commodity}</p>
                  <p><span className="font-semibold">Equipment:</span> {rfq.cargoDetails.containerType} ({rfq.cargoDetails.quantity}x)</p>
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  fullWidth 
                  variant="primary"
                  onClick={() => {
                    setSelectedRfqId(rfq.id);
                    setActiveScreen('forwarder-feed');
                  }}
                >
                  Submit Rate Proposal
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
