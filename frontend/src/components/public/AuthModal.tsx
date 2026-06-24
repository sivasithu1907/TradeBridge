import React, { useState } from 'react';
import { X, ShieldCheck, Building2, Ship, Mail, Lock, User as UserIcon, Globe2, AlertCircle, Loader2 } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Button } from '../common/Button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole: 'importer' | 'forwarder';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialRole }) => {
  const { login, register } = useMarketplace();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'importer' | 'forwarder'>(initialRole);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('Sri Lanka');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetFeedback = () => { setError(null); setSuccessMessage(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();
    setIsSubmitting(true);
    try {
      if (tab === 'login') {
        await login(email, password);
        onClose();
      } else {
        const result = await register({ companyType: role, companyName, country, fullName, email, password });
        // Forwarders need admin approval before they can quote -- tell them
        // plainly instead of silently logging them in, since the backend
        // genuinely gates their account at this point (see requireVerifiedForwarder).
        setSuccessMessage(result.message);
        setTab('login');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto select-none">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white border border-[#E5E7EB] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#F1F5F9] flex items-center justify-between bg-[#FAFAFA] flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#EB5D0B] rounded-lg flex items-center justify-center">
              <div className="w-3.5 h-3.5 bg-white rotate-45"></div>
            </div>
            <span className="font-bold text-base tracking-tight text-[#111827]">TheDreamV Portal</span>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#E5E7EB] flex-shrink-0">
          <button
            onClick={() => { setTab('login'); resetFeedback(); }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center cursor-pointer transition-all ${
              tab === 'login' ? 'border-b-2 border-[#EB5D0B] text-[#EB5D0B] bg-white' : 'text-[#6B7280] bg-[#F7F8FA]'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('register'); resetFeedback(); }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center cursor-pointer transition-all ${
              tab === 'register' ? 'border-b-2 border-[#EB5D0B] text-[#EB5D0B] bg-white' : 'text-[#6B7280] bg-[#F7F8FA]'
            }`}
          >
            B2B Company Registration
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Role Selector */}
          <div className="p-6 pb-2">
            <p className="text-[11px] font-bold uppercase text-[#6B7280] mb-2 tracking-wider">Account Type</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('importer')}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  role === 'importer' ? 'border-[#EB5D0B] bg-orange-50/40 text-[#EB5D0B]' : 'border-[#E5E7EB] hover:border-gray-300 text-gray-700'
                }`}
              >
                <Building2 className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold">Cargo Importer</p>
                  <p className="text-[10px] text-gray-500">Request quotes & track</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setRole('forwarder')}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  role === 'forwarder' ? 'border-[#EB5D0B] bg-orange-50/40 text-[#EB5D0B]' : 'border-[#E5E7EB] hover:border-gray-300 text-gray-700'
                }`}
              >
                <Ship className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold">Freight Forwarder</p>
                  <p className="text-[10px] text-gray-500">Compete & win spot rates</p>
                </div>
              </button>
            </div>
            {tab === 'register' && role === 'forwarder' && (
              <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
                Forwarder accounts require admin verification before you can submit quotes. You'll be able to browse the RFQ marketplace immediately after registering.
              </p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
            {tab === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">Company Legal Name</label>
                  <input
                    type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                    placeholder={role === 'importer' ? 'e.g. Ceylon Global Apparel Exports Ltd' : 'e.g. OceanX Global Forwarding Pvt Ltd'}
                    className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#EB5D0B] focus:bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1">Your Full Name</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#EB5D0B] focus:bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1">Country</label>
                    <div className="relative">
                      <Globe2 className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text" required value={country} onChange={(e) => setCountry(e.target.value)}
                        className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#EB5D0B] focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">Corporate Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#EB5D0B] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password" required minLength={tab === 'register' ? 8 : undefined}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#EB5D0B] focus:bg-white font-mono"
                />
              </div>
              {tab === 'register' && (
                <p className="text-[10px] text-gray-500 mt-1">At least 8 characters.</p>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 text-[11px] text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {successMessage && (
              <div className="flex items-start gap-2 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{successMessage} You can sign in now.</span>
              </div>
            )}

            <div className="pt-2">
              <Button type="submit" variant="primary" size="lg" fullWidth disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> {tab === 'login' ? 'Signing in...' : 'Creating account...'}
                  </span>
                ) : tab === 'login' ? (
                  `Sign in to ${role === 'importer' ? 'Importer Portal' : 'Forwarder Desk'}`
                ) : (
                  'Register Company'
                )}
              </Button>
            </div>

            <p className="text-[11px] text-[#6B7280] text-center pt-2 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Institutional Grade B2B Digital Security</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
