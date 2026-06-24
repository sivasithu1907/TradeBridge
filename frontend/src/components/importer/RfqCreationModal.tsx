import React, { useState } from 'react';
import { X, Ship, Calendar, UploadCloud, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Incoterm, FreightType, ContainerType } from '../../types';
import { Button } from '../common/Button';

interface RfqModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RfqCreationModal: React.FC<RfqModalProps> = ({ isOpen, onClose }) => {
  const { createRfq, currentUser } = useMarketplace();

  const [origin, setOrigin] = useState('Colombo Port, Sri Lanka');
  const [originCode, setOriginCode] = useState('LKCMB');
  const [destination, setDestination] = useState('Port of Hamburg, Germany');
  const [destCode, setDestCode] = useState('DEHAM');
  const [incoterms, setIncoterms] = useState<Incoterm>('FOB');
  const [freightType, setFreightType] = useState<FreightType>('Ocean FCL');
  const [containerType, setContainerType] = useState<ContainerType>('40ft High Cube');
  const [commodity, setCommodity] = useState('Ceylon Organic Readymade Garments');
  const [weightKg, setWeightKg] = useState(19200);
  const [volumeCbm, setVolumeCbm] = useState(65);
  const [cargoReadyDate, setCargoReadyDate] = useState('2026-07-20');
  const [expiryDate, setExpiryDate] = useState('2026-06-30');
  const [remarks, setRemarks] = useState('Clean food-grade containers requested. Carrier must confirm direct vessel availability.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRfq({
      importerId: currentUser.id,
      importerName: currentUser.companyName || 'Ceylon Global Exports',
      importerVerified: currentUser.verified,
      origin,
      originCode,
      destination,
      destCode,
      incoterms,
      freightType,
      containerType,
      commodity,
      weightKg: Number(weightKg),
      volumeCbm: Number(volumeCbm),
      cargoReadyDate,
      expiryDate,
      remarks
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto select-none">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white border border-[#E5E7EB] rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.15)] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#F1F5F9] flex items-center justify-between bg-[#FAFAFA] flex-shrink-0">
          <div>
            <h3 className="font-bold text-lg text-[#111827]">Broadcast New Freight RFQ</h3>
            <p className="text-xs text-[#6B7280]">Standardized quotation broadcast to all verified freight forwarders</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Corridor */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#EB5D0B] mb-3">1. Origin & Destination Corridor</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">Origin Port / Location</label>
                <input 
                  type="text"
                  required
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#EB5D0B] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">Origin UN/LOCODE</label>
                <input 
                  type="text"
                  required
                  value={originCode}
                  onChange={(e) => setOriginCode(e.target.value.toUpperCase())}
                  className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs font-mono text-[#111827] focus:outline-none focus:border-[#EB5D0B] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">Destination Port / Location</label>
                <input 
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#EB5D0B] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">Destination UN/LOCODE</label>
                <input 
                  type="text"
                  required
                  value={destCode}
                  onChange={(e) => setDestCode(e.target.value.toUpperCase())}
                  className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs font-mono text-[#111827] focus:outline-none focus:border-[#EB5D0B] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Incoterms & Freight Type */}
          <div className="pt-2 border-t border-[#F1F5F9]">
            <p className="text-xs font-bold uppercase tracking-wider text-[#EB5D0B] mb-3">2. Terms & Equipment</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">Incoterms</label>
                <select
                  value={incoterms}
                  onChange={(e) => setIncoterms(e.target.value as Incoterm)}
                  className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs font-semibold text-[#111827] focus:outline-none focus:border-[#EB5D0B]"
                >
                  <option value="FOB">FOB - Free on Board</option>
                  <option value="EXW">EXW - Ex Works</option>
                  <option value="CIF">CIF - Cost, Insurance & Freight</option>
                  <option value="DDP">DDP - Delivered Duty Paid</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">Freight Mode</label>
                <select
                  value={freightType}
                  onChange={(e) => setFreightType(e.target.value as FreightType)}
                  className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#EB5D0B]"
                >
                  <option value="Ocean FCL">Ocean FCL (Full Container)</option>
                  <option value="Ocean LCL">Ocean LCL (Consolidation)</option>
                  <option value="Air Freight">Air Freight Cargo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">Container / Load Type</label>
                <select
                  value={containerType}
                  onChange={(e) => setContainerType(e.target.value as ContainerType)}
                  className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#EB5D0B]"
                >
                  <option value="40ft High Cube">40ft High Cube</option>
                  <option value="40ft Standard">40ft Standard</option>
                  <option value="20ft Standard">20ft Standard</option>
                  <option value="Reefer 40ft">Reefer 40ft (Temp Controlled)</option>
                  <option value="LCL (CBM)">LCL Volume (CBM)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cargo Specs */}
          <div className="pt-2 border-t border-[#F1F5F9]">
            <p className="text-xs font-bold uppercase tracking-wider text-[#EB5D0B] mb-3">3. Commodity & Weight</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-[#111827] mb-1">Commodity Description</label>
                <input 
                  type="text"
                  required
                  value={commodity}
                  onChange={(e) => setCommodity(e.target.value)}
                  className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#EB5D0B]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">Gross Weight (Kg)</label>
                <input 
                  type="number"
                  required
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs font-mono text-[#111827] focus:outline-none focus:border-[#EB5D0B]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">Volume (CBM)</label>
                <input 
                  type="number"
                  required
                  value={volumeCbm}
                  onChange={(e) => setVolumeCbm(Number(e.target.value))}
                  className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs font-mono text-[#111827] focus:outline-none focus:border-[#EB5D0B]"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="pt-2 border-t border-[#F1F5F9]">
            <p className="text-xs font-bold uppercase tracking-wider text-[#EB5D0B] mb-3">4. Schedule & Remarks</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">Cargo Ready Date</label>
                <input 
                  type="date"
                  required
                  value={cargoReadyDate}
                  onChange={(e) => setCargoReadyDate(e.target.value)}
                  className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs font-mono text-[#111827] focus:outline-none focus:border-[#EB5D0B]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">Quotation Expiry Date</label>
                <input 
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs font-mono text-[#111827] focus:outline-none focus:border-[#EB5D0B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">Special Handling Remarks</label>
              <textarea 
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl p-3 text-xs text-[#111827] focus:outline-none focus:border-[#EB5D0B]"
              />
            </div>
          </div>

          {/* Documents */}
          <div className="pt-2 border-t border-[#F1F5F9]">
            <label className="block text-xs font-semibold text-[#111827] mb-2">Attached Documents (Invoice / Packing List)</label>
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center justify-between p-3 rounded-xl bg-[#F7F8FA] border border-dashed border-[#E5E7EB] text-xs text-[#6B7280]">
                <span className="flex items-center gap-2 font-mono">
                  <FileText className="w-4 h-4 text-[#EB5D0B]" />
                  Commercial_Invoice_Draft_v2.pdf
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">Uploaded</span>
              </div>
              <Button type="button" variant="secondary" size="sm" icon={<UploadCloud className="w-3.5 h-3.5" />}>
                Attach More
              </Button>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="lg">
              Publish RFQ to Marketplace
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
