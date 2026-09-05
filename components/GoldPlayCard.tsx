'use client';

import React from 'react';
import { Sparkles, Server, Database, Compass, ArrowUpRight, ShieldCheck, Zap } from 'lucide-react';
import { CaseStudy } from '@/data/caseStudies';

export interface FlagshipServiceData {
  id: string;
  rank: string;
  title: string;
  subtitle: string;
  category: string;
  iconType: 'cloud-run' | 'gemini' | 'firestore' | 'maps';
  gcpBadge: string;
  certifications: string[];
  metrics: { label: string; value: string };
  hackathonRole: string;
  caseStudyId: string; // Links into matching blueprint in caseStudies
}

interface GoldPlayCardProps {
  service: FlagshipServiceData;
  onSelect: (caseStudyId: string) => void;
}

export function GoldPlayCard({ service, onSelect }: GoldPlayCardProps) {
  const getIcon = () => {
    switch (service.iconType) {
      case 'cloud-run':
        return <Server className="w-6 h-6 text-[#FFE259]" />;
      case 'gemini':
        return <Sparkles className="w-6 h-6 text-[#FFE259]" />;
      case 'firestore':
        return <Database className="w-6 h-6 text-[#FFE259]" />;
      case 'maps':
        return <Compass className="w-6 h-6 text-[#FFE259]" />;
    }
  };

  return (
    <div
      onClick={() => onSelect(service.caseStudyId)}
      data-cursor="VIEW CARD"
      className="relative flex-shrink-0 w-[320px] sm:w-[350px] rounded-2xl p-[2px] bg-gradient-to-br from-[#FFE259] via-[#D4AF37] to-[#8C6D1F] shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer group select-none"
    >
      {/* Inner Card Body with obsidian-emerald gradient */}
      <div className="h-full w-full rounded-[14px] bg-gradient-to-b from-[#083D2A] via-[#052117] to-[#02140D] p-6 flex flex-col justify-between relative overflow-hidden text-[#F7F7F7]">
        {/* Subtle Background Radial Gold Glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-[#FFE259]/15 blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

        {/* Top Header: Rank & Certification Stamps */}
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#D4AF37]/30">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-[#FFE259]/20 border border-[#FFE259]/50 text-[#FFE259] text-[10px] font-sans font-bold tracking-widest uppercase">
                {service.rank} • CORE 4
              </span>
              <span className="text-[10px] font-sans text-[#A2B8AF] uppercase tracking-wider">
                {service.category}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {service.certifications.map((cert) => (
                <span
                  key={cert}
                  className="px-1.5 py-0.5 rounded bg-[#022016] border border-[#D4AF37]/40 text-[#FFE259] text-[9px] font-mono font-bold"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>

          {/* Service Icon & Title */}
          <div className="flex items-start gap-3.5 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0B2E21] to-[#021A11] border border-[#FFE259]/60 flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
              {getIcon()}
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white leading-tight group-hover:text-[#FFE259] transition-colors">
                {service.title}
              </h3>
              <p className="text-xs text-[#A2B8AF] font-sans mt-0.5 leading-snug">
                {service.subtitle}
              </p>
            </div>
          </div>

          {/* Hackathon Role Description */}
          <p className="text-[11.5px] text-[#D8E2DC] leading-relaxed font-sans mt-3 line-clamp-3">
            {service.hackathonRole}
          </p>
        </div>

        {/* Bottom Metrics & CTA */}
        <div className="mt-5 pt-3 border-t border-[#D4AF37]/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-sans uppercase tracking-widest text-[#A2B8AF]">
                {service.metrics.label}
              </p>
              <p className="text-sm font-bold text-[#FFE259] font-mono mt-0.5">
                {service.metrics.value}
              </p>
            </div>

            <div className="flex items-center gap-1 text-xs font-sans font-bold text-[#FFE259] group-hover:translate-x-1 transition-transform">
              <span className="text-[11px] uppercase tracking-wider">Inspect Flow</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Shimmer Border Edge Reflection */}
        <div className="absolute inset-0 rounded-[14px] pointer-events-none border border-white/10" />
      </div>
    </div>
  );
}
