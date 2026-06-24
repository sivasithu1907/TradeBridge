import React from 'react';
import { Palette, Layers, CheckCircle2, AlertCircle, ArrowUpRight, Zap, Shield, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const DesignSystemScreen: React.FC = () => {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-12 select-none animate-in fade-in duration-200">
      <div className="pb-6 border-b border-[#E5E7EB]">
        <Badge variant="neutral">Financial-Grade SaaS UI Tokens</Badge>
        <h2 className="text-3xl font-bold tracking-tight text-[#111827] mt-2">
          TheDreamV Institutional Design System
        </h2>
        <p className="text-xs text-[#6B7280] mt-1 max-w-3xl">
          Strictly enforced light aesthetic. Designed with high contrast off-whites (#FAFAFA), crisp 1px borders (#E5E7EB), and surgical orange accents (#EB5D0B) reserved solely for interactive feedback.
        </p>
      </div>

      {/* Color Tokens */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-[#111827] flex items-center gap-2">
          <Palette className="w-5 h-5 text-[#EB5D0B]" />
          Color Palette Tokens
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] space-y-2">
            <div className="w-full h-12 rounded-lg bg-[#FAFAFA] border border-[#E5E7EB]" />
            <p className="font-bold text-[#111827]">Canvas bg</p>
            <p className="text-[#6B7280]">#FAFAFA</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] space-y-2 shadow-xs">
            <div className="w-full h-12 rounded-lg bg-white border border-[#E5E7EB]" />
            <p className="font-bold text-[#111827]">Card surface</p>
            <p className="text-[#6B7280]">#FFFFFF</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] space-y-2">
            <div className="w-full h-12 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB]" />
            <p className="font-bold text-[#111827]">Subtle fill</p>
            <p className="text-[#6B7280]">#F7F8FA</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] space-y-2">
            <div className="w-full h-12 rounded-lg bg-[#E5E7EB]" />
            <p className="font-bold text-[#111827]">Border 1px</p>
            <p className="text-[#6B7280]">#E5E7EB</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] space-y-2">
            <div className="w-full h-12 rounded-lg bg-[#111827]" />
            <p className="font-bold text-[#111827]">Primary text</p>
            <p className="text-[#6B7280]">#111827</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-[#EB5D0B] space-y-2 shadow-xs">
            <div className="w-full h-12 rounded-lg bg-[#EB5D0B]" />
            <p className="font-bold text-[#EB5D0B]">Accent orange</p>
            <p className="text-[#6B7280]">#EB5D0B</p>
          </div>
        </div>
      </section>

      {/* Button Variants */}
      <section className="space-y-4 pt-6 border-t border-[#E5E7EB]">
        <h3 className="text-lg font-bold text-[#111827] flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#EB5D0B]" />
          Button Component Architecture
        </h3>
        <p className="text-xs text-[#6B7280]">Notice how primary buttons use a white background with a crisp 1px orange border, filling with solid orange only on hover.</p>
        
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-wrap items-center gap-4">
          <Button variant="primary">Primary Action</Button>
          <Button variant="secondary">Secondary Action</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="danger">Danger Action</Button>
          <Button variant="primary" icon={<Sparkles className="w-4 h-4" />}>With Icon</Button>
          <Button variant="primary" disabled>Disabled State</Button>
        </div>
      </section>

      {/* Badge Variants */}
      <section className="space-y-4 pt-6 border-t border-[#E5E7EB]">
        <h3 className="text-lg font-bold text-[#111827] flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#EB5D0B]" />
          Status Badge Hierarchy
        </h3>
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-wrap items-center gap-4">
          <Badge variant="success">● Verified Escrow</Badge>
          <Badge variant="warning">○ Quoting Open</Badge>
          <Badge variant="error">● Demurrage Hold</Badge>
          <Badge variant="info">● Satellite Tracking</Badge>
          <Badge variant="neutral">SOC-2 Audited</Badge>
        </div>
      </section>
    </div>
  );
};
