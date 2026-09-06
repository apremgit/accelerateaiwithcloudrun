'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { CASE_STUDIES, CaseStudy, TrackType } from '@/data/caseStudies';
import FloatingPreview from './FloatingPreview';

interface ArchivesTableProps {
  onSelectBlueprint: (study: CaseStudy) => void;
}

const trackColors: Record<string, string> = {
  'identity-secrets': '#10b981',
  'reasoning-engine': '#3b82f6',
  'vector-rag': '#8b5cf6',
  'spatial-workspace': '#f59e0b',
};

const trackNames: Record<string, string> = {
  'identity-secrets': 'Identity & Sovereignty',
  'reasoning-engine': 'Reasoning Engine',
  'vector-rag': 'Vector RAG & BigQuery',
  'spatial-workspace': 'Spatial & Integrations',
};

const allCerts = ['PCA', 'ACE', 'CSAE', 'Enterprise AI', 'Data Engineer', 'Hybrid Architect'];

export function ArchivesTable({ onSelectBlueprint }: ArchivesTableProps) {
  const [activeTrack, setActiveTrack] = useState<string | null>(null);
  const [activeCert, setActiveCert] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [hoveredStudy, setHoveredStudy] = useState<CaseStudy | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const filteredStudies = useMemo(() => {
    return CASE_STUDIES.filter(study => {
      const matchTrack = activeTrack ? study.track === activeTrack : true;
      const matchCert = activeCert ? study.certifications?.includes(activeCert as any) : true;
      const matchSearch = searchQuery 
        ? study.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          study.id.toString().includes(searchQuery)
        : true;
      return matchTrack && matchCert && matchSearch;
    });
  }, [activeTrack, activeCert, searchQuery]);

  const trackCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CASE_STUDIES.forEach(study => {
      if (study.track) {
        counts[study.track] = (counts[study.track] || 0) + 1;
      }
    });
    return counts;
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#0a0a0a] py-[120px] px-6 lg:px-12 relative">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <h2 className="text-[11px] tracking-[0.08em] uppercase text-[#7d7d7d]">ARCHIVES</h2>
          <div className="text-[10px] tracking-wider uppercase text-[#7d7d7d] border border-white/10 rounded-full px-2 py-0.5">
            {CASE_STUDIES.length} BLUEPRINTS
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTrack(null)}
              className={`text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-full border transition-colors ${
                activeTrack === null 
                  ? 'border-white text-white' 
                  : 'border-white/15 text-[#7d7d7d] hover:text-white hover:border-white/50'
              }`}
            >
              All ({CASE_STUDIES.length})
            </button>
            {Object.entries(trackNames).map(([key, name]) => (
              <button
                key={key}
                onClick={() => setActiveTrack(key)}
                className={`text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-full border transition-colors ${
                  activeTrack === key 
                    ? 'border-white text-white' 
                    : 'border-white/15 text-[#7d7d7d] hover:text-white hover:border-white/50'
                }`}
              >
                {name} ({trackCounts[key] || 0})
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d7d7d]" />
            <input
              type="text"
              placeholder="Search blueprints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-b border-white/15 text-white text-sm py-2 pl-7 placeholder:text-[#7d7d7d] focus:outline-none focus:border-white transition-colors"
            />
          </div>
        </div>

        {/* Cert Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-12">
          <button
            onClick={() => setActiveCert(null)}
            className={`text-[10px] uppercase px-2 py-1 rounded transition-colors ${
              activeCert === null ? 'bg-white/10 text-white' : 'text-[#7d7d7d] hover:text-white hover:bg-white/5'
            }`}
          >
            All Certs
          </button>
          {allCerts.map(cert => (
            <button
              key={cert}
              onClick={() => setActiveCert(cert)}
              className={`text-[10px] uppercase px-2 py-1 rounded transition-colors ${
                activeCert === cert ? 'bg-white/10 text-white' : 'text-[#7d7d7d] hover:text-white hover:bg-white/5'
              }`}
            >
              {cert}
            </button>
          ))}
        </div>

        {/* Table / List */}
        <div className="archive-list group flex flex-col relative w-full">
          {filteredStudies.map((study, idx) => {
            const trackColor = study.track ? trackColors[study.track] || '#7d7d7d' : '#7d7d7d';
            const trackName = study.track ? trackNames[study.track] || study.track : 'Unknown';

            return (
              <div
                key={study.id}
                role="button"
                tabIndex={0}
                data-cursor="VIEW"
                onClick={() => onSelectBlueprint(study)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectBlueprint(study);
                  }
                }}
                onMouseEnter={() => setHoveredStudy(study)}
                onMouseLeave={() => setHoveredStudy(null)}
                style={{
                  animationDelay: `${idx * 30}ms`,
                  opacity: isVisible ? '' : 0,
                  transform: isVisible ? 'none' : 'translateY(20px)'
                }}
                className={`archive-row h-16 border-t border-white/10 flex items-center cursor-pointer transition-all duration-300 ${isVisible ? 'animate-in fade-in slide-in-from-bottom-5' : ''} px-2 -mx-2 hover:bg-white/[0.04]`}
              >
                {/* Number */}
                <div className="w-[60px] font-mono text-sm text-[#7d7d7d] shrink-0 transition-colors group-hover/row:text-white">
                  {String(study.number).padStart(2, '0')}
                </div>
                
                {/* Title */}
                <div className="flex-1 text-[#f4f4f4] text-sm md:text-base font-medium truncate pr-4 transition-colors">
                  {study.title}
                </div>
                
                {/* Track */}
                <div className="hidden md:flex shrink-0 w-[200px] items-center">
                  <div 
                    className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium"
                    style={{ 
                      backgroundColor: `${trackColor}33`,
                      color: trackColor 
                    }}
                  >
                    {trackName}
                  </div>
                </div>

                {/* Certs */}
                <div className="hidden lg:flex shrink-0 w-[250px] items-center gap-1.5 flex-wrap justify-end">
                  {study.certifications?.slice(0, 3).map((cert: string) => (
                    <span 
                      key={cert}
                      className="text-[9px] uppercase tracking-widest text-[#7d7d7d] border border-white/10 rounded px-1.5 py-0.5"
                    >
                      {cert}
                    </span>
                  ))}
                  {study.certifications && study.certifications.length > 3 && (
                    <span className="text-[9px] text-[#7d7d7d]">+{study.certifications.length - 3}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <FloatingPreview study={hoveredStudy} visible={!!hoveredStudy} />
      <style dangerouslySetInnerHTML={{__html: `
        .archive-list:hover .archive-row { opacity: 0.35; transition: opacity 0.3s ease; }
        .archive-list:hover .archive-row:hover { opacity: 1; }
      `}} />
    </section>
  );
}
