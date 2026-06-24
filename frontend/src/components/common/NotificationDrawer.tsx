import React from 'react';
import { X, Bell, Check, ExternalLink, ShieldCheck, Ship, FileText, AlertCircle } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Button } from './Button';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationsRead, setActiveScreen, setSelectedRfqId, setSelectedShipmentId } = useMarketplace();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-[#E5E7EB] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col">
          {/* Drawer Header */}
          <div className="p-6 border-b border-[#F1F5F9] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#EB5D0B]" />
              <h3 className="font-bold text-base text-[#111827]">Marketplace Activity Feed</h3>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={markNotificationsRead}
                className="text-xs font-semibold text-[#EB5D0B] hover:underline px-2 py-1 rounded cursor-pointer"
              >
                Mark all read
              </button>
              <button onClick={onClose} className="p-1.5 text-[#6B7280] hover:text-[#111827] rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3 divide-y divide-[#F1F5F9]">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-[#6B7280] text-sm">
                No recent notifications.
              </div>
            ) : (
              notifications.map((item) => (
                <div 
                  key={item.id} 
                  className={`pt-3 pb-2 transition-colors rounded-lg p-3 ${item.unread ? 'bg-[#F7F8FA]/80 border-l-2 border-[#EB5D0B]' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-[#111827] leading-snug">{item.title}</p>
                    <span className="text-[10px] text-[#6B7280] whitespace-nowrap">{item.time}</span>
                  </div>
                  <p className="text-xs text-[#6B7280] mt-1">{item.description}</p>

                  <div className="mt-2.5 flex items-center gap-2">
                    {item.type === 'quote' && (
                      <button 
                        onClick={() => { setActiveScreen('quote-compare'); onClose(); }}
                        className="text-[11px] font-bold text-[#EB5D0B] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        View Quotation Matrix <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                    {item.type === 'shipment' && (
                      <button 
                        onClick={() => { setActiveScreen('shipment-tracking'); onClose(); }}
                        className="text-[11px] font-bold text-[#EB5D0B] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Track Vessel Coordinates <Ship className="w-3 h-3" />
                      </button>
                    )}
                    {item.type === 'rfq' && (
                      <button 
                        onClick={() => { setActiveScreen('rfq-list'); onClose(); }}
                        className="text-[11px] font-bold text-[#EB5D0B] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Go to Marketplace Feed <FileText className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#F1F5F9] bg-[#FAFAFA] flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="text-[11px] text-[#6B7280]">
              Notifications update automatically as marketplace activity happens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
