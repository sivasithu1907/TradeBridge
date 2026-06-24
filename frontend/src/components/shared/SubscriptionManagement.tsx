import React, { useState } from 'react';
import { CreditCard, Check, Zap, Shield, HelpCircle, ArrowUpRight, Award, Sparkles } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const SubscriptionManagement: React.FC = () => {
  const { currentPlan, upgradePlan, currentUser } = useMarketplace();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [upgradingTo, setUpgradingTo] = useState<string | null>(null);

  const plans = [
    {
      id: 'Starter',
      name: 'Starter Enterprise',
      desc: 'Essential digital freight procurement for growing boutique importers',
      priceMonthly: '$199',
      priceAnnual: '$159',
      features: [
        'Up to 15 RFQs per month',
        'Standard Quote Matrix Comparison',
        '2 Carrier Settlement Accounts',
        'Basic Shipment Milestone Tracking',
        'Standard Email Support'
      ]
    },
    {
      id: 'Professional',
      name: 'Global Professional',
      desc: 'High-velocity automation for enterprise supply chain teams',
      priceMonthly: '$499',
      priceAnnual: '$399',
      popular: true,
      features: [
        'Unlimited Global RFQs',
        'AI Tariff & Demurrage Optimizer',
        'Unlimited Carrier Connections',
        'Live Satellite Vessel Telemetry',
        'API & ERP Webhook Integration',
        'Dedicated Success Account Manager'
      ]
    },
    {
      id: 'Enterprise',
      name: 'Custom Alliance',
      desc: 'Institutional infrastructure for multinational conglomerates',
      priceMonthly: '$1,299',
      priceAnnual: '$999',
      features: [
        'Custom EDI & SAP Integration',
        'White-Label Importer Portal',
        'Custom Escrow Banking Rails',
        'Dedicated Tenant Cloud Run VM',
        'SOC-2 Compliance Reports',
        '24/7 Priority Concierge SLA'
      ]
    }
  ];

  const handleSelectPlan = (planId: any) => {
    setUpgradingTo(planId);
    setTimeout(() => {
      upgradePlan(planId);
      setUpgradingTo(null);
    }, 800);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 select-none animate-in fade-in duration-200">
      <div className="text-center max-w-3xl mx-auto space-y-3 pb-6 border-b border-[#E5E7EB]">
        <Badge variant="warning">SaaS Billing & Subscription Tiers</Badge>
        <h2 className="text-3xl font-bold tracking-tight text-[#111827]">
          Institutional Freight Procurement Tiers
        </h2>
        <p className="text-sm text-[#6B7280]">
          Current Active Plan: <span className="font-bold text-[#111827]">{currentPlan}</span> (Billed {billingCycle})
        </p>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <span className={`text-xs font-semibold ${billingCycle === 'monthly' ? 'text-[#111827]' : 'text-[#6B7280]'}`}>
            Monthly Billing
          </span>
          <button 
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className="w-12 h-6 bg-[#111827] rounded-full p-1 relative transition-colors cursor-pointer"
          >
            <div className={`w-4 h-4 bg-[#EB5D0B] rounded-full transition-transform ${billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-semibold ${billingCycle === 'annual' ? 'text-[#111827]' : 'text-[#6B7280]'}`}>
              Annual Billing
            </span>
            <span className="bg-[#EB5D0B]/10 text-[#EB5D0B] text-[10px] font-bold px-2 py-0.5 rounded-full">
              Save 20%
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map(plan => {
          const isCurrent = currentPlan === plan.id;
          const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;

          return (
            <div 
              key={plan.id}
              className={`bg-white rounded-2xl p-8 border transition-all flex flex-col justify-between relative ${
                plan.popular 
                  ? 'border-2 border-[#111827] shadow-xl' 
                  : 'border-[#E5E7EB] shadow-xs hover:border-gray-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#111827] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#EB5D0B]" />
                  Recommended
                </div>
              )}

              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#111827]">{plan.name}</h3>
                    <p className="text-xs text-[#6B7280] mt-1 min-h-[32px]">{plan.desc}</p>
                  </div>
                </div>

                <div className="flex items-baseline gap-1 my-6 pb-6 border-b border-[#F1F5F9]">
                  <span className="text-4xl font-extrabold text-[#111827] tracking-tight">{price}</span>
                  <span className="text-xs font-semibold text-[#6B7280]">/ month / tenant</span>
                </div>

                <ul className="space-y-3.5 text-xs text-[#374151]">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#EB5D0B] flex-shrink-0 mt-0.5" />
                      <span className="font-medium leading-relaxed">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8 mt-8 border-t border-[#F1F5F9]">
                <Button 
                  fullWidth 
                  variant={isCurrent ? 'secondary' : plan.popular ? 'primary' : 'secondary'}
                  disabled={isCurrent || upgradingTo === plan.id}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {upgradingTo === plan.id 
                    ? 'Provisioning VM...' 
                    : isCurrent 
                      ? 'Active Tier' 
                      : 'Switch Subscription'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invoice & Payment Method Preview */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-[#111827]" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#111827]">Corporate Escrow Billing Rail</h4>
            <p className="text-xs text-[#6B7280]">Visa Corporate ending in •••• 4092 (Expires 11/28)</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button size="sm" variant="secondary">Update Payment Rail</Button>
          <Button size="sm" variant="secondary" icon={<ArrowUpRight className="w-3.5 h-3.5" />}>Billing Statements</Button>
        </div>
      </div>
    </div>
  );
};
