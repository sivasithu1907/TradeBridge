import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  Plus, 
  Compass, 
  ShieldCheck, 
  UserCheck, 
  Briefcase, 
  LogOut, 
  HelpCircle, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { UserRole } from '../../types';
import { Button } from './Button';

interface HeaderProps {
  onOpenCreateRfq?: () => void;
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCreateRfq, onOpenNotifications }) => {
  const { 
    activeRole, 
    currentUser,
    logout, 
    searchQuery, 
    setSearchQuery, 
    notifications, 
    setActiveScreen, 
  } = useMarketplace();

  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const unreadCount = notifications.filter(n => n.unread).length;

  const getPageTitle = () => {
    if (activeRole === 'importer') return { title: 'Importer Workspace', desc: 'Manage quotations, active RFQs, and real-time container tracking' };
    if (activeRole === 'forwarder') return { title: 'Freight Forwarder Desk', desc: 'Compete for spot RFQs, submit binding rates, and update vessel ETAs' };
    if (activeRole === 'admin') return { title: 'Marketplace Command', desc: 'Neutral governance over B2B trade corridor liquidity and KYC verifications' };
    return { title: 'TheDreamV Marketplace', desc: 'Connecting Global Trade' };
  };

  const { title, desc } = getPageTitle();

  const handleLogout = async () => {
    setShowAccountMenu(false);
    await logout();
  };

  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB] px-6 md:px-8 flex items-center justify-between sticky top-0 z-20 select-none">
      {/* Title & Context */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base md:text-lg font-semibold text-[#111827]">{title}</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-[#F7F8FA] border border-[#E5E7EB] rounded uppercase text-[#6B7280]">
              Sri Lanka Hub
            </span>
          </div>
          <p className="text-xs text-[#6B7280] hidden sm:block">{desc}</p>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Search Bar */}
        <div className="relative hidden lg:block w-64">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search RFQ, booking, port..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#111827] placeholder-[#6B7280] focus:outline-none focus:border-[#EB5D0B] focus:bg-white transition-all"
          />
        </div>

        {/* Create RFQ Button (Importer ONLY) */}
        {activeRole === 'importer' && (
          <Button size="sm" variant="primary" onClick={onOpenCreateRfq} icon={<Plus className="w-3.5 h-3.5" />}>
            Request Quote
          </Button>
        )}

        {/* Find Opportunities (Forwarder) */}
        {activeRole === 'forwarder' && (
          <Button size="sm" variant="primary" onClick={() => setActiveScreen('forwarder-rfqs')} icon={<Compass className="w-3.5 h-3.5" />}>
            Spot Feed
          </Button>
        )}

        <div className="w-px h-6 bg-[#F1F5F9] hidden sm:block"></div>

        {/* Account Menu -- real signed-in identity, not a persona switcher.
            Replaces the prototype's "Switch Sandbox Persona" dropdown,
            which let anyone become importer/forwarder/admin with one click
            and no password. There is no client-side role switching anymore;
            the only way to change identity is to sign out and sign back in
            as a different real account. */}
        <div className="relative">
          <button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] hover:border-gray-300 text-xs font-medium text-[#111827] cursor-pointer transition-all"
          >
            <span className={`w-2 h-2 rounded-full ${currentUser.verified ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            <span className="font-semibold max-w-[140px] truncate">{currentUser.companyName || currentUser.name}</span>
          </button>

          {showAccountMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-white border border-[#E5E7EB] rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.08)] py-1.5 z-50">
              <div className="px-3.5 py-2 border-b border-[#F1F5F9]">
                <p className="text-xs font-semibold text-[#111827] truncate">{currentUser.name}</p>
                <p className="text-[11px] text-[#6B7280] truncate">{currentUser.email}</p>
                <p className="text-[10px] mt-1 capitalize inline-flex items-center gap-1 text-[#6B7280]">
                  {currentUser.verified ? (
                    <><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified {currentUser.role}</>
                  ) : (
                    <><ShieldCheck className="w-3 h-3 text-amber-600" /> Pending verification</>
                  )}
                </p>
              </div>
              <button
                onClick={() => { setActiveScreen('settings'); setShowAccountMenu(false); }}
                className="w-full text-left px-3.5 py-2 text-xs text-[#374151] hover:bg-[#F7F8FA] flex items-center gap-2"
              >
                <Briefcase className="w-3.5 h-3.5" /> Account Settings
              </button>
              <div className="border-t border-[#F1F5F9] my-1"></div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Notifications Icon Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#F7F8FA] rounded-xl transition-colors cursor-pointer"
          title="Marketplace Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EB5D0B] rounded-full ring-2 ring-white"></span>
          )}
        </button>
      </div>
    </header>
  );
};
