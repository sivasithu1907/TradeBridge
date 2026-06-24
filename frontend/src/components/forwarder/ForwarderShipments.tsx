import React, { useState } from 'react';
import { Ship, Clock, CheckCircle2, AlertCircle, FileText, UploadCloud, Eye } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const ForwarderShipments: React.FC = () => {
  const { shipments, updateShipmentMilestone } = useMarketplace();
  const [selectedShipment, setSelectedShipment] = useState<string | null>(null);

  const active = shipments.find(s => s.id === selectedShipment) || shipments[0];

  const handleNextMilestone = (shp: any) => {
    const sequence = [
      'Booking Confirmed',
      'Container Gated In',
      'Loaded on Vessel',
      'In Transit (Ocean)',
      'Arrived at Discharge Port',
      'Customs Cleared',
      'Out for Delivery',
      'Delivered'
    ];
    const currIdx = sequence.indexOf(shp.currentMilestone);
    if (currIdx < sequence.length - 1) {
      updateShipmentMilestone(shp.id, sequence[currIdx + 1]);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none animate-in fade-in duration-200">
      <div className="pb-4 border-b border-[#E5E7EB] flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">
            Active Forwarder Bookings & Operations
          </h2>
          <p className="text-xs text-[#6B7280] mt-1">
            Dispatch digital EDI milestone updates, attach Bills of Lading, and verify container releases
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Bookings Table Feed */}
        <div className="md:col-span-5 bg-white border border-[#E5E7EB] rounded-2xl shadow-xs overflow-hidden divide-y divide-[#F1F5F9]">
          <div className="p-4 bg-[#F7F8FA] font-bold text-xs text-[#111827]">
            Assigned Bookings ({shipments.length})
          </div>
          {shipments.map(shp => {
            const isSel = active?.id === shp.id;
            return (
              <div 
                key={shp.id}
                onClick={() => setSelectedShipment(shp.id)}
                className={`p-4 transition-all cursor-pointer ${isSel ? 'bg-[#F7F8FA] border-l-4 border-l-[#EB5D0B]' : 'hover:bg-[#FAFAFA]'}`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-xs text-[#111827]">{shp.bookingNumber}</span>
                  <Badge variant={shp.status === 'In Transit' ? 'info' : shp.status === 'Delivered' ? 'success' : 'warning'}>
                    {shp.status}
                  </Badge>
                </div>
                <p className="text-xs font-extrabold text-[#111827] mt-1">
                  {shp.origin.city} → {shp.destination.city}
                </p>
                <p className="text-[11px] text-[#6B7280] mt-1">
                  Milestone: <span className="font-semibold text-[#374151]">{shp.currentMilestone}</span>
                </p>
              </div>
            );
          })}
        </div>

        {/* Operations Control Detail */}
        {active && (
          <div className="md:col-span-7 bg-white border border-[#E5E7EB] rounded-2xl shadow-xs p-6 space-y-6">
            <div className="flex justify-between items-start border-b border-[#F1F5F9] pb-4">
              <div>
                <span className="text-[11px] font-bold text-[#EB5D0B] uppercase tracking-wider">Operational Dispatch</span>
                <h3 className="text-xl font-extrabold text-[#111827] mt-1">{active.bookingNumber}</h3>
                <p className="text-xs text-[#6B7280]">Vessel: {active.vesselName} (Voyage {active.voyageNumber})</p>
              </div>
              <Button variant="primary" onClick={() => handleNextMilestone(active)}>
                Trigger Next Milestone
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-[#F7F8FA] p-4 rounded-xl border border-[#E5E7EB] text-xs">
              <div><span className="text-[#6B7280]">Carrier SCAC:</span> <span className="font-mono font-bold">{active.carrierScac}</span></div>
              <div><span className="text-[#6B7280]">Container #:</span> <span className="font-mono font-bold">{active.containerNumber}</span></div>
              <div><span className="text-[#6B7280]">ETA Destination:</span> <span className="font-bold">{active.eta}</span></div>
              <div><span className="text-[#6B7280]">Demurrage Risk:</span> <span className="font-bold text-emerald-600">Low</span></div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-xs text-[#111827] uppercase">Required Document Uploads</h4>
              <div className="flex items-center justify-between p-3 border border-[#E5E7EB] rounded-xl text-xs">
                <span className="font-semibold text-[#374151]">House Bill of Lading (HBL)</span>
                <Button size="sm" variant="secondary" icon={<UploadCloud className="w-3.5 h-3.5" />}>Upload PDF</Button>
              </div>
              <div className="flex items-center justify-between p-3 border border-[#E5E7EB] rounded-xl text-xs">
                <span className="font-semibold text-[#374151]">Customs Manifest Entry</span>
                <Button size="sm" variant="secondary" icon={<UploadCloud className="w-3.5 h-3.5" />}>Upload EDI</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
