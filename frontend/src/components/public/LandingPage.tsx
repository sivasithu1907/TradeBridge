import React, { useState } from 'react';
import { 
  Globe, 
  Ship, 
  Compass, 
  ShieldCheck, 
  TrendingDown, 
  ArrowRight, 
  CheckCircle2, 
  DollarSign, 
  Building2, 
  Users, 
  Lock, 
  Star,
  Search,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const LandingPage: React.FC<{ onOpenAuth: (role: 'importer' | 'forwarder') => void }> = ({ onOpenAuth }) => {
  const { setActiveScreen, rfqs } = useMarketplace();
  const [corridorQuery, setCorridorQuery] = useState('');

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827] select-none">
      {/* Top Navigation */}
      <nav className="h-20 border-b border-[#E5E7EB] bg-white px-6 lg:px-12 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#EB5D0B] rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(235,93,11,0.25)]">
            <div className="w-4.5 h-4.5 bg-white rotate-45 rounded-xs"></div>
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight text-[#111827]">TheDreamV</span>
            <span className="ml-2 text-xs font-mono uppercase bg-[#F7F8FA] px-2 py-0.5 rounded border border-[#E5E7EB] text-[#6B7280]">
              Freight OS
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#6B7280]">
          <a href="#how-it-works" className="hover:text-[#EB5D0B] transition-colors">Marketplace Model</a>
          <a href="#live-feed" className="hover:text-[#EB5D0B] transition-colors">Spot Corridors</a>
          <a href="#trust" className="hover:text-[#EB5D0B] transition-colors">Escrow Guarantee</a>
          <button onClick={() => onOpenAuth('importer')} className="hover:text-[#EB5D0B] transition-colors cursor-pointer">
            Sign In
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="md" onClick={() => onOpenAuth('forwarder')}>
            Forwarder Portal
          </Button>
          <Button variant="primary" size="md" onClick={() => onOpenAuth('importer')}>
            Importer Login
          </Button>
        </div>
      </nav>

      {/* Hero Section (Ultra Clean Light Theme) */}
      <section className="py-20 lg:py-28 px-6 lg:px-12 max-w-7xl mx-auto text-center relative">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E5E7EB] shadow-[0_2px_6px_rgba(0,0,0,0.03)] text-xs font-semibold text-[#111827] mb-8">
          <span className="w-2 h-2 rounded-full bg-[#EB5D0B] animate-pulse"></span>
          <span>Digital Neutral Freight Marketplace connecting Sri Lanka & Global Ports</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#111827] max-w-5xl mx-auto leading-[1.1]">
          The Neutral Marketplace for <span className="text-[#EB5D0B] underline decoration-2 decoration-[#EB5D0B]/30 underline-offset-8">Global Container Rates</span>.
        </h1>

        <p className="mt-6 text-base sm:text-xl text-[#6B7280] max-w-3xl mx-auto font-normal leading-relaxed">
          Request spot ocean & air freight quotations in seconds. Top verified freight forwarders compete to win your shipment. Backed by institutional digital escrow.
        </p>

        {/* Interactive Search Corridor Bar Preview */}
        <div className="mt-12 max-w-4xl mx-auto bg-white border border-[#E5E7EB] p-3 sm:p-4 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 flex items-center gap-3 bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-4 py-3 w-full">
            <Ship className="w-5 h-5 text-[#EB5D0B] flex-shrink-0" />
            <input 
              type="text"
              placeholder="Origin Port (e.g., Colombo LKCMB)"
              defaultValue="Colombo Port (LKCMB)"
              className="w-full bg-transparent text-sm font-medium text-[#111827] focus:outline-none"
            />
          </div>
          <div className="flex-1 flex items-center gap-3 bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-4 py-3 w-full">
            <Globe className="w-5 h-5 text-[#6B7280] flex-shrink-0" />
            <input 
              type="text"
              placeholder="Destination (e.g., Rotterdam NLRTM)"
              defaultValue="Rotterdam Port (NLRTM)"
              className="w-full bg-transparent text-sm font-medium text-[#111827] focus:outline-none"
            />
          </div>
          <Button 
            size="lg" 
            variant="primary" 
            className="w-full sm:w-auto px-8 py-3.5 whitespace-nowrap"
            onClick={() => onOpenAuth('importer')}
          >
            Compare Rates <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Enterprise Logos Benchmark */}
        <div className="mt-16 pt-10 border-t border-[#E5E7EB]/80 flex flex-wrap justify-center items-center gap-8 sm:gap-16 opacity-60 grayscale text-xs font-mono tracking-widest text-[#6B7280]">
          <span>FLEXPORT INSPIRED</span>
          <span>FREIGHTOS BENCHMARK</span>
          <span>STRIPE LIQUIDITY</span>
          <span>RAMP GOVERNANCE</span>
          <span>MERCURY SPEED</span>
        </div>
      </section>

      {/* Value Proposition Grid (Booking.com + Airbnb Model) */}
      <section id="how-it-works" className="py-20 px-6 lg:px-12 bg-white border-t border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="brand">Neutral Architecture</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3">Why Global Importers & Forwarders Choose TheDreamV</h2>
            <p className="text-[#6B7280] mt-3">We eliminate hidden markups, manual email haggling, and counterparty payment risk.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#FAFAFA] border border-[#E5E7EB] p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#EB5D0B] mb-6 shadow-xs">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Booking.com for Freight</h3>
                <p className="text-sm text-[#6B7280] mt-3 leading-relaxed">
                  Importers broadcast one standardized RFQ. Verified tier-1 forwarders submit all-in binding quotes with transparent port charges breakdown.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#E5E7EB] flex items-center justify-between text-xs font-semibold text-[#EB5D0B]">
                <span>Avg. 4.2 Rates per RFQ</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-[#FAFAFA] border border-[#E5E7EB] p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#EB5D0B] mb-6 shadow-xs">
                  <DollarSign className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Skyscanner Rate Comparison</h3>
                <p className="text-sm text-[#6B7280] mt-3 leading-relaxed">
                  Compare carrier transit times, free demurrage days, vessel routings, and forwarder reliability scores side-by-side on our standardized matrix.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#E5E7EB] flex items-center justify-between text-xs font-semibold text-[#EB5D0B]">
                <span>Save 15-22% on Spot Freight</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-[#FAFAFA] border border-[#E5E7EB] p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center text-emerald-600 mb-6 shadow-xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Institutional Digital Escrow</h3>
                <p className="text-sm text-[#6B7280] mt-3 leading-relaxed">
                  Freight funds are locked in escrow upon booking confirmation and released to carriers only when container gate-in and BL issuance are digitally verified.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#E5E7EB] flex items-center justify-between text-xs font-semibold text-emerald-600">
                <span>Zero Default Guarantee</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Marketplace Corridors Preview Feed */}
      <section id="live-feed" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <Badge variant="neutral">Active Spot Orders</Badge>
            <h2 className="text-3xl font-bold mt-2">Live B2B Corridor Opportunities</h2>
            <p className="text-sm text-[#6B7280] mt-1">Real spot requests currently open for forwarder bidding on the platform.</p>
          </div>
          <Button variant="secondary" size="md" className="mt-4 md:mt-0" onClick={() => onOpenAuth('forwarder')}>
            View All 42 Live RFQs
          </Button>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F7F8FA] border-b border-[#E5E7EB] text-[11px] uppercase font-bold text-[#6B7280]">
                  <th className="py-4 px-6">Reference & Route</th>
                  <th className="py-4 px-6">Cargo & Equipment</th>
                  <th className="py-4 px-6">Target Ready Date</th>
                  <th className="py-4 px-6">Marketplace Competition</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-sm">
                {rfqs.slice(0, 3).map((rfq) => (
                  <tr key={rfq.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB] flex items-center justify-center font-bold text-xs text-[#EB5D0B]">
                          LK
                        </div>
                        <div>
                          <p className="font-semibold text-[#111827]">{rfq.rfqNumber}</p>
                          <p className="text-xs text-[#6B7280]">{rfq.originCode} → {rfq.destCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium">{rfq.containerType}</p>
                      <p className="text-xs text-[#6B7280] truncate max-w-xs">{rfq.commodity}</p>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-[#374151]">
                      {rfq.cargoReadyDate}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="font-semibold">{rfq.responsesCount} Forwarders Bidding</span>
                      </div>
                      {rfq.bestOfferUsd && (
                        <p className="text-xs text-[#6B7280]">Best Rate: ${rfq.bestOfferUsd.toLocaleString()}</p>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button size="sm" variant="primary" onClick={() => onOpenAuth('forwarder')}>
                        Submit Quote
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Get Started CTA */}
      <section className="py-24 px-6 bg-white border-t border-[#E5E7EB] text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Ready to experience the future of <span className="text-[#EB5D0B]">Global Logistics</span>?
          </h2>
          <p className="mt-4 text-base text-[#6B7280]">
            Create your free company account to get started:
          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div
              onClick={() => onOpenAuth('importer')}
              className="p-8 bg-[#FAFAFA] border border-[#E5E7EB] hover:border-[#EB5D0B] rounded-2xl cursor-pointer transition-all hover:shadow-[0_8px_30px_rgba(235,93,11,0.08)] flex flex-col items-center"
            >
              <Building2 className="w-10 h-10 text-[#EB5D0B] mb-4" />
              <h3 className="text-lg font-bold">Register as Importer</h3>
              <p className="text-xs text-[#6B7280] mt-2 text-center">
                Request quotations, compare carrier matrices, and track vessel ETAs. Free to join.
              </p>
              <span className="mt-6 text-xs font-bold text-[#EB5D0B] flex items-center gap-1">
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div
              onClick={() => onOpenAuth('forwarder')}
              className="p-8 bg-[#FAFAFA] border border-[#E5E7EB] hover:border-[#EB5D0B] rounded-2xl cursor-pointer transition-all hover:shadow-[0_8px_30px_rgba(235,93,11,0.08)] flex flex-col items-center"
            >
              <Ship className="w-10 h-10 text-[#EB5D0B] mb-4" />
              <h3 className="text-lg font-bold">Register as Forwarder</h3>
              <p className="text-xs text-[#6B7280] mt-2 text-center">
                Search spot RFQs, submit binding rates, and manage milestones. Subject to verification.
              </p>
              <span className="mt-6 text-xs font-bold text-[#EB5D0B] flex items-center gap-1">
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="border-t border-[#E5E7EB] py-12 px-6 lg:px-12 bg-[#FAFAFA] text-xs text-[#6B7280]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-semibold text-[#111827]">
            <div className="w-5 h-5 bg-[#EB5D0B] rounded flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-white rotate-45"></div>
            </div>
            <span>TheDreamV Freight Marketplace Platform © 2026</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Escrow Guarantee</span>
            <span>Colombo HQ</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
