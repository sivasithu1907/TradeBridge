import React, { useState } from 'react';
import { DollarSign, Send, Shield, CheckCircle2, Clock } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Button } from '../common/Button';

interface QuoteSubmissionModalProps {
  rfq: any;
  onClose: () => void;
}

export const QuoteSubmissionModal: React.FC<QuoteSubmissionModalProps> = ({ rfq, onClose }) => {
  const { submitQuote, currentUser } = useMarketplace();
  const [oceanFreight, setOceanFreight] = useState('3800');
  const [baf, setBaf] = useState('420');
  const [thcOrigin, setThcOrigin] = useState('250');
  const [thcDest, setThcDest] = useState('310');
  const [transitTimeDays, setTransitTimeDays] = useState('24');
  const [freeTimeDemurrageDays, setFreeTimeDemurrageDays] = useState(14);
  const [vesselName, setVesselName] = useState('EVER GIVEN V. 902E');
  const [validUntil, setValidUntil] = useState('2026-06-30');

  const total = Number(oceanFreight) + Number(baf) + Number(thcOrigin) + Number(thcDest);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitQuote({
      rfqId: rfq.id,
      forwarderId: currentUser.id,
      forwarderName: currentUser.company,
      forwarderRating: 4.9,
      totalAmount: total,
      currency: 'USD',
      transitTimeDays: Number(transitTimeDays),
      freeTimeDemurrageDays: Number(freeTimeDemurrageDays),
      vesselSchedule: vesselName,
      breakdown: {
        oceanFreight: Number(oceanFreight),
        baf: Number(baf),
        thcOrigin: Number(thcOrigin),
        thcDest: Number(thcDest)
      },
      validUntil
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-xs animate-in fade-in" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl p-6 md:p-8 z-10 animate-in zoom-in-95 space-y-6">
        <div className="flex justify-between items-start border-b border-[#E5E7EB] pb-4">
          <div>
            <span className="font-mono text-xs font-bold text-[#EB5D0B] uppercase">Binding Spot Tariff Submission</span>
            <h3 className="text-xl font-bold text-[#111827] mt-1">Quote Matrix — {rfq.referenceNumber}</h3>
            <p className="text-xs text-[#6B7280]">{rfq.origin.city} → {rfq.destination.city} ({rfq.cargoDetails.commodity})</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">Base Ocean Freight ($)</label>
              <input 
                type="number" required
                value={oceanFreight} onChange={(e) => setOceanFreight(e.target.value)}
                className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#111827] font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">Bunker Adjustment BAF ($)</label>
              <input 
                type="number" required
                value={baf} onChange={(e) => setBaf(e.target.value)}
                className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#111827] font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">THC Origin Port ($)</label>
              <input 
                type="number" required
                value={thcOrigin} onChange={(e) => setThcOrigin(e.target.value)}
                className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#111827] font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">THC Destination Port ($)</label>
              <input 
                type="number" required
                value={thcDest} onChange={(e) => setThcDest(e.target.value)}
                className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#111827] font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">Transit Time (Days)</label>
              <input 
                type="number" required
                value={transitTimeDays} onChange={(e) => setTransitTimeDays(e.target.value)}
                className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#111827]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">Free Demurrage (Days)</label>
              <input 
                type="number" required
                value={freeTimeDemurrageDays} onChange={(e) => setFreeTimeDemurrageDays(Number(e.target.value))}
                className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#111827]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">Rate Expiry Date</label>
              <input 
                type="date" required
                value={validUntil} onChange={(e) => setValidUntil(e.target.value)}
                className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#111827]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">Vessel Schedule / Carrier Service</label>
            <input 
              type="text" required
              value={vesselName} onChange={(e) => setVesselName(e.target.value)}
              placeholder="e.g. EVER GIVEN V. 902E (Ocean Alliance Express)"
              className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#111827]"
            />
          </div>

          <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] flex items-center justify-between mt-4">
            <span className="text-xs font-bold text-[#111827]">Total Quoted Tariff (All-in)</span>
            <span className="text-2xl font-black font-mono text-[#EB5D0B]">${total.toLocaleString()} USD</span>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" icon={<Send className="w-3.5 h-3.5" />}>Submit Binding Quote</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
