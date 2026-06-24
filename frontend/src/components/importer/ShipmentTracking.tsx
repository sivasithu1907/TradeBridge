import React, { useState } from 'react';
import { 
  Ship, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Navigation, 
  FileText, 
  ShieldCheck, 
  ExternalLink,
  Anchor,
  Compass,
  AlertCircle
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const ShipmentTracking: React.FC = () => {
  const { shipments, selectedShipmentId, setSelectedShipmentId, setActiveScreen } = useMarketplace();

  const activeShipment = shipments.find(s => s.id === selectedShipmentId) || shipments[0];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 select-none animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#F7F8FA] border rounded text-[#111827]">
              {activeShipment.bookingNumber}
            </span>
            <Badge variant="info">{activeShipment.currentStatus}</Badge>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111827] mt-2">
            Live Container Route & Telemetry
          </h2>
          <p className="text-xs text-[#6B7280] mt-1">
            Standard Chartered Escrow Secured • RFQ Ref: {activeShipment.rfqNumber}
          </p>
        </div>

        {/* Shipment selector if multiple */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {shipments.map(shp => (
            <button
              key={shp.id}
              onClick={() => setSelectedShipmentId(shp.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                shp.id === activeShipment.id 
                  ? 'bg-[#111827] text-white font-bold' 
                  : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-gray-300'
              }`}
            >
              {shp.bookingNumber} ({shp.progressPct}%)
            </button>
          ))}
        </div>
      </div>

      {/* Main Container: Map Canvas & Milestone Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Interactive Simulated Map Canvas (8 Cols) */}
        <div className="lg:col-span-8 bg-white border border-[#E5E7EB] rounded-2xl shadow-xs overflow-hidden flex flex-col min-h-[480px]">
          <div className="p-4 border-b border-[#F1F5F9] bg-[#FAFAFA] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#111827]">
              <Compass className="w-4 h-4 text-[#EB5D0B]" />
              <span>Vessel Positioning Corridor: Indian Ocean → Europe</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              ● Live Satellite Sync
            </span>
          </div>

          {/* Clean Graphic Map Canvas */}
          <div className="flex-1 bg-[#F7F8FA] relative overflow-hidden flex items-center justify-center p-8 select-none">
            {/* Grid lines background */}
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#E5E7EB_1px,transparent_1px),linear-gradient(to_bottom,#E5E7EB_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

            {/* SVG Trajectory Route */}
            <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 800 400">
              {/* Dashed Route Path */}
              <path
                d="M 120 280 Q 280 340 420 220 T 680 100"
                fill="none"
                stroke="#EB5D0B"
                strokeWidth="2.5"
                strokeDasharray="6,6"
                className="opacity-40"
              />

              {/* Progress Solid Path */}
              <path
                d="M 120 280 Q 280 340 420 220"
                fill="none"
                stroke="#EB5D0B"
                strokeWidth="3.5"
              />

              {/* Origin Colombo Point */}
              <circle cx="120" cy="280" r="8" fill="#111827" stroke="#FFFFFF" strokeWidth="2" />
              <text x="90" y="310" className="text-[11px] font-bold fill-[#111827] uppercase tracking-wider font-mono">Colombo (LKCMB)</text>

              {/* Waypoint Suez */}
              <circle cx="420" cy="220" r="5" fill="#EB5D0B" />
              <text x="380" y="245" className="text-[10px] font-semibold fill-[#6B7280] font-mono">Suez Canal</text>

              {/* Current Vessel Icon Position */}
              <g transform="translate(380, 230)">
                <circle cx="0" cy="0" r="16" fill="#EB5D0B" fillOpacity="0.15" className="animate-ping" />
                <circle cx="0" cy="0" r="10" fill="#EB5D0B" stroke="#FFFFFF" strokeWidth="2" />
              </g>

              {/* Dest Rotterdam */}
              <circle cx="680" cy="100" r="8" fill="#6B7280" stroke="#FFFFFF" strokeWidth="2" />
              <text x="630" y="85" className="text-[11px] font-bold fill-[#111827] uppercase tracking-wider font-mono">Rotterdam (NLRTM)</text>
            </svg>

            {/* Overlay Telemetry HUD Card */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-xs border border-[#E5E7EB] rounded-xl p-4 shadow-sm space-y-1 max-w-xs text-xs font-mono">
              <div className="flex items-center justify-between text-[#EB5D0B] font-bold">
                <span>{activeShipment.vesselName}</span>
                <span>{activeShipment.progressPct}%</span>
              </div>
              <p className="text-[#6B7280]">Container: <span className="text-[#111827] font-bold">{activeShipment.containerNumber}</span></p>
              <p className="text-[#6B7280]">Current Speed: <span className="text-[#111827]">18.4 Knots</span></p>
              <p className="text-[#6B7280]">Heading: <span className="text-[#111827]">312° NW (Arabian Sea)</span></p>
            </div>
          </div>

          {/* Quick Vessel Footer */}
          <div className="p-4 bg-white border-t border-[#F1F5F9] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-[#6B7280] block text-[10px]">VOYAGE NUMBER</span>
              <span className="font-bold text-[#111827]">{activeShipment.voyageNumber}</span>
            </div>
            <div>
              <span className="text-[#6B7280] block text-[10px]">ESTIMATED ARRIVAL</span>
              <span className="font-bold text-[#EB5D0B]">{activeShipment.eta}</span>
            </div>
            <div>
              <span className="text-[#6B7280] block text-[10px]">CARRIER FORWARDER</span>
              <span className="font-bold text-[#111827] truncate block">{activeShipment.forwarderName}</span>
            </div>
            <div>
              <span className="text-[#6B7280] block text-[10px]">FREIGHT VALUE</span>
              <span className="font-bold text-emerald-700">${activeShipment.freightAmountUsd.toLocaleString()} USD</span>
            </div>
          </div>
        </div>

        {/* Milestone Timeline Panel (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs flex flex-col justify-between max-h-[620px]">
          <div>
            <h3 className="font-bold text-base text-[#111827] pb-3 border-b border-[#F1F5F9]">
              Shipment Milestones
            </h3>

            <div className="mt-6 space-y-6 overflow-y-auto pr-2 max-h-[420px]">
              {activeShipment.milestones.map((ms, idx) => {
                const isLast = idx === activeShipment.milestones.length - 1;

                return (
                  <div key={ms.id} className="relative flex gap-4">
                    {!isLast && (
                      <div className={`absolute left-2.5 top-6 bottom-0 w-0.5 -ml-px ${ms.completed ? 'bg-[#EB5D0B]' : 'bg-[#E5E7EB]'}`} />
                    )}

                    <div className="relative flex items-center justify-center flex-shrink-0 mt-0.5">
                      {ms.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-[#EB5D0B] fill-orange-50 bg-white" />
                      ) : ms.isCurrent ? (
                        <div className="w-5 h-5 rounded-full border-2 border-[#EB5D0B] bg-white flex items-center justify-center animate-pulse">
                          <div className="w-2 h-2 rounded-full bg-[#EB5D0B]" />
                        </div>
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 bg-white" />
                      )}
                    </div>

                    <div className="flex-1 pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-semibold ${ms.completed || ms.isCurrent ? 'text-[#111827]' : 'text-gray-400'}`}>
                          {ms.title}
                        </p>
                        <span className="text-[10px] font-mono text-[#6B7280] whitespace-nowrap">{ms.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-[#6B7280] mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" /> {ms.location}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#F1F5F9] space-y-3">
            <Button variant="secondary" size="md" fullWidth onClick={() => setActiveScreen('docs-center')}>
              View Commercial Invoice & BL
            </Button>
            <Button variant="primary" size="md" fullWidth onClick={() => setActiveScreen('messages')}>
              Contact Forwarder Agent
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
