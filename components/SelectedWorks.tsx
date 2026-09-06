'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Copy, 
  Check, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';
import { FLAGSHIP_SERVICES, FlagshipServiceData } from '@/data/flagshipServices';
import { motion, AnimatePresence } from 'motion/react';

interface SelectedWorksProps {
  onSelectService?: (caseStudyId: string) => void;
}

export function SelectedWorks({ onSelectService }: SelectedWorksProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeService, setActiveService] = useState<FlagshipServiceData | null>(null);
  const [copied, setCopied] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeService) {
        setActiveService(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeService]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const firstCard = scrollRef.current.firstElementChild as HTMLElement;
      const cardWidth = firstCard ? firstCard.offsetWidth + 20 : 380;
      const scrollPosition = scrollRef.current.scrollLeft;
      const newIndex = Math.round(scrollPosition / cardWidth);
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < FLAGSHIP_SERVICES.length) {
        setCurrentIndex(newIndex);
      }
    }
  };

  const scrollTo = (index: number) => {
    if (scrollRef.current) {
      const firstCard = scrollRef.current.firstElementChild as HTMLElement;
      const cardWidth = firstCard ? firstCard.offsetWidth + 20 : 380;
      scrollRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
    }
  };

  const handleCardClick = (service: FlagshipServiceData) => {
    // Open vertical expansion modal with smooth motion transition
    setActiveService(service);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="w-full bg-[#0a0a0a] py-20 text-white overflow-hidden font-sans border-t border-white/[0.06]">
      {/* Section Header */}
      <div className="container mx-auto px-4 sm:px-6 mb-8 flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
            <span className="text-[11px] tracking-[0.08em] uppercase font-mono text-[#7d7d7d]">
              Flagship Core Architecture &bull; Click to Expand
            </span>
          </div>
          <span className="font-mono text-sm text-gray-400">
            01 — 0{FLAGSHIP_SERVICES.length} Flagship Architecture & Challenge Extensions
          </span>
        </div>
        
        {/* Navigation Arrows & Counter */}
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm text-gray-400 mr-2">
            0{currentIndex + 1} / 0{FLAGSHIP_SERVICES.length}
          </span>
          <button 
            onClick={() => scrollTo(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center transition-colors hover:bg-white hover:text-black disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white cursor-pointer"
            aria-label="Previous service"
            data-cursor="PREV"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => scrollTo(Math.min(FLAGSHIP_SERVICES.length - 1, currentIndex + 1))}
            disabled={currentIndex === FLAGSHIP_SERVICES.length - 1}
            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center transition-colors hover:bg-white hover:text-black disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white cursor-pointer"
            aria-label="Next service"
            data-cursor="NEXT"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Horizontal Snap Slider Track */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory gap-5 px-4 sm:px-6 pb-6 no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {FLAGSHIP_SERVICES.map((service) => (
          <motion.div
            key={service.id}
            onClick={() => handleCardClick(service)}
            data-cursor="EXPAND"
            className="flex-shrink-0 w-[310px] sm:w-[350px] md:w-[380px] h-[460px] sm:h-[480px] rounded-2xl snap-start cursor-pointer relative overflow-hidden group transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl border border-white/10"
            style={{ background: service.gradient }}
          >
            {/* Giant Watermark Rank Number */}
            <div className="absolute top-3 left-4 text-7xl font-bold text-white/10 leading-none select-none pointer-events-none font-mono">
              {service.rank}
            </div>

            {/* Click to expand pill prompt */}
            <div className="absolute top-4 right-4 z-20">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white/80 text-[11px] font-mono group-hover:border-[#D4AF37] group-hover:text-white transition-colors">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                <span>Expand</span>
              </span>
            </div>
            
            {/* Card Content Overlay */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
              {/* Top GCP Badge */}
              <div className="inline-flex items-center w-fit px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-mono font-medium uppercase tracking-wider text-white">
                {service.gcpBadge}
              </div>

              {/* Center / Bottom Info */}
              <div className="mt-auto flex flex-col gap-3">
                <div className="space-y-1.5">
                  <span className="text-[10.5px] uppercase tracking-[0.08em] font-mono text-[#D4AF37]">
                    {service.category}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight font-heading">
                    {service.title}
                  </h3>
                  <p className="text-gray-300 line-clamp-2 text-xs sm:text-sm font-sans leading-relaxed">
                    {service.subtitle}
                  </p>
                </div>

                {/* Metric Strip */}
                <div className="font-mono text-xs text-[#10b981] flex items-center gap-2">
                  <span className="opacity-70 text-gray-300">{service.metrics.label}:</span> 
                  <span className="font-bold bg-[#10b981]/15 px-2 py-0.5 rounded border border-[#10b981]/30">
                    {service.metrics.value}
                  </span>
                </div>

                {/* Architecture Tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {service.tags.slice(0, 3).map((tag) => (
                    <span 
                      key={tag} 
                      className="px-2.5 py-0.5 rounded-full border border-white/15 bg-white/5 text-[10px] font-mono uppercase tracking-wider text-white/90"
                    >
                      {tag}
                    </span>
                  ))}
                  {service.tags.length > 3 && (
                    <span className="text-[10px] font-mono text-gray-400">
                      +{service.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Smooth Vertical Expansion Motion Modal */}
      <AnimatePresence>
        {activeService && (
          <div 
            className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 md:p-10"
            data-lenis-prevent="true"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setActiveService(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer z-10"
            />

            {/* Vertically Expanded Content Panel */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              data-lenis-prevent="true"
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto overscroll-contain rounded-2xl border border-white/20 text-white shadow-2xl flex flex-col z-20 selection:bg-[#D4AF37]/30 selection:text-white"
              style={{ 
                background: activeService.gradient,
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {/* Sticky Modal Top Bar */}
              <div className="sticky top-0 left-0 right-0 px-6 sm:px-8 py-4 bg-black/60 backdrop-blur-xl border-b border-white/15 flex items-center justify-between z-30">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xl font-bold text-[#D4AF37]">
                    {activeService.rank}
                  </span>
                  <div className="h-4 w-px bg-white/20" />
                  <span className="font-mono text-xs uppercase tracking-wider text-white/80">
                    {activeService.category}
                  </span>
                  <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-mono border border-white/15">
                    {activeService.gcpBadge}
                  </span>
                </div>

                <button
                  onClick={() => setActiveService(null)}
                  className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                  data-cursor="CLOSE"
                  title="Close Details (Esc)"
                >
                  <X size={16} />
                  <span>Close</span>
                </button>
              </div>

              {/* Modal Body Content */}
              <div className="p-6 sm:p-10 md:p-12 space-y-10 flex-1">
                {/* Title & Subtitle Block */}
                <div className="space-y-3">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-white leading-tight">
                    {activeService.title}
                  </h2>
                  <p className="text-lg sm:text-xl text-[#D4AF37] font-sans font-light">
                    {activeService.subtitle}
                  </p>
                  <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-sans pt-1">
                    {activeService.hackathonRole}
                  </p>
                </div>

                {/* Section 1: Challenge */}
                <div className="p-6 rounded-xl bg-black/40 border border-white/10 space-y-2">
                  <h4 className="text-xs uppercase tracking-wider font-mono text-[#D4AF37] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                    <span>The Engineering Challenge</span>
                  </h4>
                  <p className="text-sm sm:text-base text-gray-200 leading-relaxed font-sans">
                    {activeService.challenge}
                  </p>
                </div>

                {/* Section 2: Solution Architecture */}
                <div className="space-y-3">
                  <h4 className="text-xs uppercase tracking-wider font-mono text-white/70">
                    Solution Architecture & Implementation
                  </h4>
                  <p className="text-sm sm:text-base text-gray-200 leading-relaxed font-sans bg-black/30 p-6 rounded-xl border border-white/10">
                    {activeService.architecture}
                  </p>
                </div>

                {/* Section 3: Key Features & Isolation Capabilities */}
                <div className="space-y-4">
                  <h4 className="text-xs uppercase tracking-wider font-mono text-white/70">
                    Core Architectural Capabilities
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeService.keyFeatures.map((feature, i) => (
                      <div 
                        key={i}
                        className="p-4 rounded-xl bg-black/35 border border-white/10 flex items-start gap-3"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm text-gray-200 leading-relaxed font-sans">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 4: Live Benchmarks */}
                <div className="space-y-4">
                  <h4 className="text-xs uppercase tracking-wider font-mono text-white/70">
                    Production Benchmarks &amp; Verified Metrics
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {activeService.benchmarks.map((metric, i) => (
                      <div 
                        key={i}
                        className="p-4 rounded-xl bg-black/40 border border-white/10 text-center space-y-1"
                      >
                        <span className="text-[10px] uppercase font-mono text-gray-400 block">Metric {i + 1}</span>
                        <p className="text-xs sm:text-sm font-semibold text-white font-mono">{metric}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 5: Production Code Snippet */}
                {activeService.codeSnippet && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs uppercase tracking-wider font-mono text-white/70">
                        {activeService.codeSnippetTitle || 'Architecture Implementation Snippet'}
                      </h4>
                      <button
                        onClick={() => handleCopyCode(activeService.codeSnippet)}
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-gray-300 hover:text-white px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                        title="Copy code to clipboard"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#10b981]" />
                            <span className="text-[#10b981]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Snippet</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0a0a0a] border border-white/15 overflow-x-auto">
                      <pre className="font-mono text-xs sm:text-sm text-[#00ff9d] leading-relaxed whitespace-pre">
                        {activeService.codeSnippet}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Bar */}
              <div className="sticky bottom-0 left-0 right-0 px-6 sm:px-8 py-4 bg-black/70 backdrop-blur-xl border-t border-white/15 flex items-center justify-between z-30">
                <span className="text-xs font-mono text-gray-400">
                  {activeService.rank} of 04 &bull; Flagship Service Pillar
                </span>
                <button
                  onClick={() => setActiveService(null)}
                  className="px-5 py-2 rounded-full bg-[#D4AF37] hover:bg-[#c49f27] text-black text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  data-cursor="CLOSE"
                >
                  Done Reading &bull; Return to Slider
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </section>
  );
}

