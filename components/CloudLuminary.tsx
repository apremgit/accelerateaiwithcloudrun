'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Layers, BookOpen, ChevronRight, X } from 'lucide-react';

interface CloudLuminaryProps {
  onActivate: () => void;
  activeTab?: string;
}

export function CloudLuminary({ onActivate, activeTab }: CloudLuminaryProps) {
  const [hovered, setHovered] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [pulseScale, setPulseScale] = useState(1);

  // Gentle ambient heartbeat pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseScale((prev) => (prev === 1 ? 1.08 : 1));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Hide the floating widget when already inside the case-studies view
  if (activeTab === 'case-studies') {
    return null;
  }

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed bottom-5 right-5 z-40 bg-[#2C3539] text-[#F9F8F6] px-3 py-1.5 rounded-full text-xs font-sans shadow-md hover:bg-[#6B8E9B] transition-all flex items-center gap-1.5 cursor-pointer opacity-80 hover:opacity-100"
        title="Show Cloud Luminary"
      >
        <span className="w-2 h-2 rounded-full bg-[#8DA399] animate-ping" />
        <span className="font-serif italic text-xs">Luminary (28 Studies)</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans select-none flex flex-col items-end">
      {/* Floating expanded teaser card when hovered */}
      {hovered && (
        <div
          className="mb-3 p-4 rounded-xl bg-[#FFFFFF] border border-[#D1D8DB] shadow-lg max-w-[280px] animate-in fade-in slide-in-from-bottom-2 duration-200"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#D1D8DB]/50">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#6B8E9B] animate-pulse" />
              <span className="text-[11px] font-sans uppercase tracking-wider text-[#6B8E9B] font-semibold">
                Cloud Luminary
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMinimized(true);
              }}
              className="text-[#6B8E9B] hover:text-[#2C3539] text-xs p-0.5 rounded cursor-pointer"
              title="Minimize"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="font-serif text-[#2C3539] text-sm leading-snug mb-2">
            The Architecture Pollinator
          </p>

          <p className="text-[11px] text-[#6B8E9B] leading-relaxed mb-3">
            Explore 28 production-grade case studies covering Cloud Run scale-to-zero, Agentic AI, and PCA/ACE patterns.
          </p>

          <button
            onClick={onActivate}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#2C3539] text-[#F9F8F6] text-xs font-medium hover:bg-[#6B8E9B] transition-colors cursor-pointer group"
          >
            <span>Explore 28 Case Studies</span>
            <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      )}

      {/* The Ambient Luminary Orb */}
      <div
        className="relative group cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onActivate}
        role="button"
        tabIndex={0}
        aria-label="Open 28 Enterprise Google Cloud Case Studies"
      >
        {/* Outer orbital halo ring */}
        <div
          className="absolute -inset-2.5 rounded-full border border-[#8DA399]/40 transition-all duration-700 animate-spin"
          style={{
            animationDuration: '18s',
            transform: `scale(${hovered ? 1.25 : pulseScale})`,
          }}
        />

        {/* Counter-rotating secondary ring */}
        <div
          className="absolute -inset-1 rounded-full border border-dashed border-[#6B8E9B]/50 transition-all duration-700 animate-spin"
          style={{
            animationDuration: '24s',
            animationDirection: 'reverse',
          }}
        />

        {/* Core Glowing Orb */}
        <div
          className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6B8E9B] via-[#4A6977] to-[#2C3539] shadow-md flex items-center justify-center text-white relative transition-transform duration-300 group-hover:scale-110"
        >
          {/* Subtle center sparkle */}
          <Sparkles className="w-5 h-5 text-[#FFFFB3] animate-pulse" />

          {/* Badge counter indicator */}
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#8DA399] text-[#FFFFFF] text-[10px] font-bold font-sans flex items-center justify-center shadow-xs border border-white">
            28
          </span>
        </div>
      </div>
    </div>
  );
}
