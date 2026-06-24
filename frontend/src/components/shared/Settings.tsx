import React, { useState } from 'react';
import { User, Shield, Key, Bell, Globe, Building, Save, CheckCircle2 } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Button } from '../common/Button';

export const Settings: React.FC = () => {
  const { currentUser } = useMarketplace();
  const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'security' | 'notifications'>('profile');
  const [saved, setSaved] = useState(false);

  // Form states
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [company, setCompany] = useState(currentUser.company);
  const [apiKey, setApiKey] = useState('dv_live_89010294821a99f48201b1');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none animate-in fade-in duration-200">
      <div className="pb-4 border-b border-[#E5E7EB] flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">
            Account & Tenant Settings
          </h2>
          <p className="text-xs text-[#6B7280] mt-1">
            Manage organization profile, webhook API tokens, and institutional compliance roles
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            Changes Successfully Committed
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Nav Tabs */}
        <div className="md:col-span-3 space-y-1">
          {[
            { id: 'profile', label: 'Personal Profile', icon: User },
            { id: 'company', label: 'Organization & KYC', icon: Building },
            { id: 'security', label: 'Security & API Keys', icon: Key },
            { id: 'notifications', label: 'Webhook & Alerts', icon: Bell },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-white border border-[#E5E7EB] text-[#EB5D0B] shadow-xs font-bold' 
                    : 'text-[#6B7280] hover:bg-[#F7F8FA] hover:text-[#111827]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#EB5D0B]' : 'text-[#6B7280]'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Panel */}
        <div className="md:col-span-9 bg-white border border-[#E5E7EB] rounded-2xl shadow-xs p-8">
          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className="space-y-6">
              <h3 className="font-bold text-base text-[#111827] pb-4 border-b border-[#F1F5F9]">Personal Profile</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5">Full Name</label>
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#EB5D0B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5">Work Email Address</label>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#EB5D0B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1.5">Role Designation</label>
                <input 
                  type="text"
                  disabled
                  value={currentUser.role.toUpperCase()}
                  className="w-full bg-gray-100 border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs text-[#6B7280] font-mono font-bold"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" variant="primary" icon={<Save className="w-4 h-4" />}>Save Changes</Button>
              </div>
            </form>
          )}

          {activeTab === 'company' && (
            <form onSubmit={handleSave} className="space-y-6">
              <h3 className="font-bold text-base text-[#111827] pb-4 border-b border-[#F1F5F9]">Corporate Entity Verification</h3>

              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1.5">Legal Company Name</label>
                <input 
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs text-[#111827]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5">Jurisdiction Country</label>
                  <input type="text" defaultValue="United States (US)" className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs text-[#111827]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5">Tax EIN / IOR Number</label>
                  <input type="text" defaultValue="US-99402910-IOR" className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs text-[#111827] font-mono" />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" variant="primary" icon={<Save className="w-4 h-4" />}>Update Entity</Button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="font-bold text-base text-[#111827] pb-4 border-b border-[#F1F5F9]">API Integration Tokens</h3>
              <p className="text-xs text-[#6B7280]">Use these secret keys to authenticate ERP systems (SAP, Oracle, NetSuite) against TheDreamV API.</p>

              <div className="p-4 bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#111827]">Production API Key</span>
                  <Button size="sm" variant="secondary" onClick={() => alert('Key Copied to Clipboard!')}>Copy</Button>
                </div>
                <input 
                  type="text" 
                  readOnly 
                  value={apiKey} 
                  className="w-full font-mono text-xs bg-white border border-[#E5E7EB] rounded-lg p-2 text-[#374151]"
                />
              </div>

              <div className="pt-2">
                <Button variant="primary" onClick={() => setApiKey(`dv_live_${Math.random().toString(36).substring(2, 18)}`)}>
                  Roll API Token
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="font-bold text-base text-[#111827] pb-4 border-b border-[#F1F5F9]">Alert Preferences</h3>
              <div className="space-y-4">
                {[
                  'Email on new Spot Quote Matrix submission',
                  'SMS on Vessel Port Departure / Demurrage Warning',
                  'Webhook dispatch on Digital Bill of Lading verification',
                  'Daily GMV Spend Digest'
                ].map((item, i) => (
                  <label key={i} className="flex items-center gap-3 text-xs text-[#374151] font-semibold cursor-pointer">
                    <input type="checkbox" defaultChecked={i < 3} className="rounded text-[#EB5D0B] focus:ring-[#EB5D0B]" />
                    {item}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
