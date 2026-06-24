import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Ship, 
  BarChart3, 
  MessageSquare, 
  Users, 
  Store, 
  CreditCard, 
  Settings, 
  Palette, 
  Globe, 
  Compass, 
  CheckCircle2, 
  PlusCircle, 
  ShieldCheck 
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { ActiveScreen } from '../../types';

export const Sidebar: React.FC = () => {
  const { activeRole, activeScreen, setActiveScreen, currentUser, unreadMessageCount } = useMarketplace();

  const getNavItems = () => {
    if (activeRole === 'importer') {
      return [
        { id: 'importer-dash', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { id: 'rfq-list', label: 'RFQs & Marketplace', icon: <Compass className="w-5 h-5" /> },
        { id: 'quote-compare', label: 'Quote Comparison', icon: <FileText className="w-5 h-5" /> },
        { id: 'shipment-tracking', label: 'Live Tracking', icon: <Ship className="w-5 h-5" /> },
        { id: 'docs-center', label: 'Documents Center', icon: <FileText className="w-5 h-5" /> },
        { id: 'messages', label: 'Messaging', icon: <MessageSquare className="w-5 h-5" />, badge: unreadMessageCount },
        { id: 'analytics', label: 'Analytics & Savings', icon: <BarChart3 className="w-5 h-5" /> },
      ];
    } else if (activeRole === 'forwarder') {
      return [
        { id: 'forwarder-dash', label: 'Forwarder Desk', icon: <LayoutDashboard className="w-5 h-5" /> },
        { id: 'forwarder-rfqs', label: 'RFQ Opportunities', icon: <Globe className="w-5 h-5" /> },
        { id: 'forwarder-shipments', label: 'Active Shipments', icon: <Ship className="w-5 h-5" /> },
        { id: 'docs-center', label: 'Cargo Documents', icon: <FileText className="w-5 h-5" /> },
        { id: 'messages', label: 'Buyer Messages', icon: <MessageSquare className="w-5 h-5" />, badge: unreadMessageCount },
        { id: 'analytics', label: 'Win Rate & Revenue', icon: <BarChart3 className="w-5 h-5" /> },
      ];
    } else if (activeRole === 'admin') {
      return [
        { id: 'admin-dash', label: 'Command Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
        { id: 'admin-users', label: 'User & KYC Verification', icon: <Users className="w-5 h-5" /> },
        { id: 'admin-market', label: 'Marketplace Engine', icon: <Store className="w-5 h-5" /> },
        { id: 'shipment-tracking', label: 'Global Corridor Map', icon: <Globe className="w-5 h-5" /> },
        { id: 'analytics', label: 'Platform Financials', icon: <BarChart3 className="w-5 h-5" /> },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  if (activeRole === 'public') return null;

  return (
    <aside className="w-64 bg-white border-r border-[#E5E7EB] flex flex-col h-screen sticky top-0 flex-shrink-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 cursor-pointer" onClick={() => setActiveScreen('landing')}>
        <div className="w-8 h-8 bg-[#EB5D0B] rounded-lg flex items-center justify-center shadow-[0_2px_8px_rgba(235,93,11,0.25)]">
          <div className="w-4 h-4 bg-white rotate-45 rounded-xs"></div>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg tracking-tight text-[#111827] leading-none">TheDreamV</span>
          <span className="text-[10px] tracking-widest uppercase font-semibold text-[#EB5D0B] mt-1">TRADE BRIDGE>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        <div className="px-3 py-1 text-[10px] uppercase font-bold text-[#6B7280] tracking-wider mb-2">
          {activeRole === 'importer' ? 'Importer Portal' : activeRole === 'forwarder' ? 'Forwarder Desk' : 'Admin Command'}
        </div>

        {navItems.map((item) => {
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id as ActiveScreen)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[12px] text-sm font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-[#F7F8FA] text-[#EB5D0B] shadow-[inset_3px_0_0_#EB5D0B]'
                  : 'text-[#6B7280] hover:bg-[#F7F8FA] hover:text-[#111827]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-[#EB5D0B]' : 'text-[#6B7280]'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#EB5D0B] text-white text-[10px] font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-6 mt-6 border-t border-[#F1F5F9] space-y-1">
          <div className="px-3 py-1 text-[10px] uppercase font-bold text-[#6B7280] tracking-wider mb-2">
            System & Plans
          </div>
          <button
            onClick={() => setActiveScreen('subscriptions')}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-[12px] text-sm font-medium transition-all cursor-pointer ${
              activeScreen === 'subscriptions' ? 'bg-[#F7F8FA] text-[#EB5D0B]' : 'text-[#6B7280] hover:bg-[#F7F8FA] hover:text-[#111827]'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span>SaaS Plans & Escrow</span>
          </button>

          <button
            onClick={() => setActiveScreen('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-[12px] text-sm font-medium transition-all cursor-pointer ${
              activeScreen === 'settings' ? 'bg-[#F7F8FA] text-[#EB5D0B]' : 'text-[#6B7280] hover:bg-[#F7F8FA] hover:text-[#111827]'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Profile & Settings</span>
          </button>

          <button
            onClick={() => setActiveScreen('design-system')}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-[12px] text-sm font-medium transition-all cursor-pointer ${
              activeScreen === 'design-system' ? 'bg-[#EB5D0B]/10 text-[#EB5D0B]' : 'text-[#6B7280] hover:bg-[#F7F8FA] hover:text-[#111827]'
            }`}
          >
            <Palette className="w-5 h-5 text-[#EB5D0B]" />
            <span>Design System</span>
          </button>
        </div>
      </nav>

      {/* Active User Footer */}
      <div className="p-4 border-t border-[#F1F5F9] bg-[#FAFAFA]/50">
        <div className="flex items-center gap-3">
          <img 
            src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} 
            alt={currentUser.name}
            className="w-9 h-9 rounded-full object-cover border border-[#E5E7EB]" 
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-xs font-semibold text-[#111827] truncate">{currentUser.name}</p>
              {currentUser.verified && <ShieldCheck className="w-3.5 h-3.5 text-[#EB5D0B] flex-shrink-0" title="Verified Member" />}
            </div>
            <p className="text-[11px] text-[#6B7280] truncate">{currentUser.companyName}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
