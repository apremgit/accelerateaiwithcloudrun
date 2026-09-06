'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Copy, Award, CheckCircle } from 'lucide-react';
import { CaseStudy } from '@/data/caseStudies';

interface BlueprintModalProps {
  study: CaseStudy;
  allStudies: CaseStudy[];
  onClose: () => void;
  onNavigate: (study: CaseStudy) => void;
}

const getTrackColor = (track: string) => {
  switch (track) {
    case 'identity-secrets': return '#10b981';
    case 'reasoning-engine': return '#3b82f6';
    case 'vector-rag': return '#8b5cf6';
    case 'spatial-workspace': return '#f59e0b';
    default: return '#7d7d7d';
  }
};

export function BlueprintModal({ study, allStudies, onClose, onNavigate }: BlueprintModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const currentIndex = allStudies.findIndex(s => s.id === study.id);
  const total = allStudies.length;

  const handlePrev = () => {
    if (currentIndex > 0) {
      onNavigate(allStudies[currentIndex - 1]);
    } else {
      onNavigate(allStudies[total - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < total - 1) {
      onNavigate(allStudies[currentIndex + 1]);
    } else {
      onNavigate(allStudies[0]);
    }
  };

  const handleCopy = () => {
    if (study.codeSnippet) {
      navigator.clipboard.writeText(study.codeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Pad numbers like 07
  const displayIndex = (currentIndex + 1).toString().padStart(2, '0');
  const displayTotal = total.toString().padStart(2, '0');

  const trackColor = getTrackColor(study.track);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end" data-lenis-prevent="true">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer z-10"
      />

      {/* Content Panel */}
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        data-lenis-prevent="true"
        className="relative w-full md:w-[65vw] h-full bg-[#0f0f0f] border-l border-white/10 overflow-y-auto overscroll-contain flex flex-col shadow-2xl z-20"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full border border-white/15 bg-white/5 text-white flex items-center justify-center hover:bg-white/15 transition-colors z-30 cursor-pointer"
          data-cursor="CLOSE"
        >
          <X size={20} />
        </button>

          <div className="p-8 md:p-12 lg:p-16 flex-1 flex flex-col gap-10">
            
            {/* Header */}
            <div className="flex flex-col gap-4">
              <div className="font-mono text-[#7d7d7d] opacity-50 text-6xl leading-none">
                {displayIndex}
              </div>
              <h2 className="text-white font-semibold text-[clamp(1.5rem,3vw,2rem)] leading-tight">
                {study.title}
              </h2>
              {study.subtitle && (
                <p className="text-[#999] text-base">
                  {study.subtitle}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span 
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: `${trackColor}20`, color: trackColor }}
                >
                  {study.track}
                </span>
                {study.certifications?.map((cert) => (
                  <span key={cert} className="px-2 py-1 rounded-full border border-white/20 text-white/70 text-[10px] uppercase tracking-wider">
                    {cert}
                  </span>
                ))}
              </div>
            </div>

            {/* Challenge section */}
            <div className="flex flex-col gap-3">
              <h3 className="text-[#7d7d7d] text-[11px] uppercase tracking-wider font-semibold">
                CHALLENGE
              </h3>
              <p className="text-white text-base leading-relaxed">
                {study.challenge}
              </p>
            </div>

            {/* Solution Architecture */}
            <div className="flex flex-col gap-3">
              <h3 className="text-[#7d7d7d] text-[11px] uppercase tracking-wider font-semibold">
                SOLUTION ARCHITECTURE
              </h3>
              <p className="text-white text-base leading-relaxed">
                {study.solutionArchitecture}
              </p>
            </div>

            {/* ASCII Flow Diagram */}
            {study.asciiFlow && (
              <div className="flex flex-col gap-3">
                <h3 className="text-[#7d7d7d] text-[11px] uppercase tracking-wider font-semibold">
                  ARCHITECTURE FLOW
                </h3>
                <div className="bg-[#0a0a0a] rounded-lg border border-white/5 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#111]">
                    <div className="w-2 h-2 rounded-full bg-red-500/80" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500/80" />
                    <div className="w-2 h-2 rounded-full bg-green-500/80" />
                    <span className="text-[#7d7d7d] text-xs ml-2 font-mono">system_flow.txt</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="font-mono text-[13px] text-[#10b981] whitespace-pre">
                      {study.asciiFlow}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* GCP Services */}
            {study.gcpServices && study.gcpServices.length > 0 && (
              <div className="flex flex-col gap-3">
                <h3 className="text-[#7d7d7d] text-[11px] uppercase tracking-wider font-semibold">
                  GCP SERVICES
                </h3>
                <div className="flex flex-wrap gap-2">
                  {study.gcpServices.map((service) => (
                    <span 
                      key={service} 
                      className="px-3 py-1.5 rounded bg-white/5 border border-white/10 text-white/90 text-sm"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Metrics */}
            {study.metrics && study.metrics.length > 0 && (
              <div className="flex flex-col gap-3">
                <h3 className="text-[#7d7d7d] text-[11px] uppercase tracking-wider font-semibold">
                  BENCHMARKS
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {study.metrics.map((metric, i) => (
                    <li key={i} className="flex items-center gap-2.5 p-4 rounded-lg bg-white/5 border border-white/5">
                      <CheckCircle className="w-4 h-4 text-[#10b981] shrink-0" />
                      <span className="text-white text-sm font-medium">{metric}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Code Snippet */}
            {study.codeSnippet && (
              <div className="flex flex-col gap-3 relative">
                <h3 className="text-[#7d7d7d] text-[11px] uppercase tracking-wider font-semibold">
                  {study.codeSnippetTitle || 'CODE SNIPPET'}
                </h3>
                <div className="bg-[#0a0a0a] rounded-lg overflow-hidden relative">
                  <button 
                    onClick={handleCopy}
                    className="absolute top-3 right-3 p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors"
                    title="Copy code"
                  >
                    {copied ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                  <pre className="p-4 overflow-x-auto font-mono text-[13px] text-[#e2e8f0]">
                    <code>{study.codeSnippet}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* Exam Takeaway */}
            {study.examTakeaway && (
              <div className="mt-4 border-l-2 border-[#D4AF37] bg-[#D4AF37]/5 p-5 rounded-r-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Award size={16} className="text-[#D4AF37]" />
                  <h3 className="text-[#D4AF37] text-[11px] uppercase tracking-wider font-semibold">
                    SOLUTIONS ARCHITECT TAKEAWAY
                  </h3>
                </div>
                <p className="text-[#999] text-sm leading-relaxed">
                  {study.examTakeaway}
                </p>
              </div>
            )}
            
            {/* Spacer for bottom nav */}
            <div className="h-20" />
          </div>

          {/* Bottom Navigation */}
          <div className="sticky bottom-0 left-0 w-full bg-[#0f0f0f] border-t border-white/10 p-4 px-8 flex items-center justify-between mt-auto">
            <div className="flex items-center gap-4">
              <button 
                onClick={handlePrev}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="font-mono text-sm text-white/50">
                <span className="text-white">{displayIndex}</span> / {displayTotal}
              </div>
              <button 
                onClick={handleNext}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
  );
}
