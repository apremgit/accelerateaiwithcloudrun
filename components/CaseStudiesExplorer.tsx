'use client';

import React, { useState, useMemo } from 'react';
import { CASE_STUDIES, CaseStudy, CertificationType, TrackType } from '@/data/caseStudies';
import { 
  ArrowLeft, 
  Search, 
  Sparkles, 
  Copy, 
  Check, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  Database, 
  Globe, 
  ChevronRight, 
  ChevronLeft,
  X,
  Award,
  GitBranch
} from 'lucide-react';

interface CaseStudiesExplorerProps {
  onBack: () => void;
}

type TrackFilter = 'all' | TrackType;
type CertFilter = 'all' | CertificationType;

export function CaseStudiesExplorer({ onBack }: CaseStudiesExplorerProps) {
  const [selectedTrack, setSelectedTrack] = useState<TrackFilter>('all');
  const [selectedCert, setSelectedCert] = useState<CertFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCaseStudy, setActiveCaseStudy] = useState<CaseStudy | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Filter logic
  const filteredStudies = useMemo(() => {
    return CASE_STUDIES.filter((study) => {
      const matchesTrack = selectedTrack === 'all' || study.track === selectedTrack;
      const matchesCert = selectedCert === 'all' || study.certifications.includes(selectedCert as any);
      
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        study.title.toLowerCase().includes(q) ||
        study.subtitle.toLowerCase().includes(q) ||
        study.challenge.toLowerCase().includes(q) ||
        study.solutionArchitecture.toLowerCase().includes(q) ||
        study.gcpServices.some(s => s.toLowerCase().includes(q)) ||
        study.codeSnippet.toLowerCase().includes(q);

      return matchesTrack && matchesCert && matchesSearch;
    });
  }, [selectedTrack, selectedCert, searchQuery]);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleNextStudy = () => {
    if (!activeCaseStudy) return;
    const currentIndex = CASE_STUDIES.findIndex(s => s.id === activeCaseStudy.id);
    const nextIndex = (currentIndex + 1) % CASE_STUDIES.length;
    setActiveCaseStudy(CASE_STUDIES[nextIndex]);
  };

  const handlePrevStudy = () => {
    if (!activeCaseStudy) return;
    const currentIndex = CASE_STUDIES.findIndex(s => s.id === activeCaseStudy.id);
    const prevIndex = (currentIndex - 1 + CASE_STUDIES.length) % CASE_STUDIES.length;
    setActiveCaseStudy(CASE_STUDIES[prevIndex]);
  };

  const trackTabs = [
    { id: 'all', label: 'All Blueprints (28)', count: 28, icon: Layers },
    { id: 'identity-secrets', label: 'Identity & Sovereignty (7)', count: 7, icon: ShieldCheck },
    { id: 'reasoning-engine', label: 'Reasoning Engine & Flow (7)', count: 7, icon: Sparkles },
    { id: 'vector-rag', label: 'Vector RAG & BigQuery (7)', count: 7, icon: Database },
    { id: 'spatial-workspace', label: 'Spatial & Integrations (7)', count: 7, icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#2C3539] font-sans pb-24">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 pt-12 pb-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-[#6B8E9B] hover:text-[#2C3539] transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
            <span>Return to Memory Hub</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#D1D8DB] text-[11px] font-sans tracking-wide text-[#6B8E9B] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#8DA399] animate-pulse" />
            <span className="font-semibold text-[#2C3539]">PAI Cognitive Architecture</span>
            <span>&bull;</span>
            <span>28 Blueprints</span>
          </div>
        </div>

        {/* Title Area */}
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#8DA399]/15 text-[#2C3539] text-[10px] font-sans uppercase font-bold tracking-widest">
            <span>PAI Engine &bull; System Specifications</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#2C3539] tracking-tight">
            PAI Architecture Engine.
          </h1>
          <p className="text-base sm:text-lg text-[#6B8E9B] font-serif italic leading-relaxed">
            28 production blueprints power our zero-loss cognitive layer — from Firebase tenant boundaries and Gemini multi-turn reasoning to BigQuery Vector RAG and Google Maps spatial grounding.
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="mt-10 space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#6B8E9B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across 28 blueprints (e.g. BigQuery Vector, MCP, Secret Manager, Cloud Tasks)..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#D1D8DB] text-xs focus:outline-hidden focus:border-[#6B8E9B] placeholder-[#6B8E9B]/60 shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6B8E9B] hover:text-[#2C3539]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Certification Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <span className="text-[11px] uppercase tracking-wider text-[#6B8E9B] mr-1 hidden sm:inline">
                Cert:
              </span>
              {(['all', 'PCA', 'ACE', 'CSAE', 'Enterprise AI', 'Data Engineer', 'Hybrid Architect'] as CertFilter[]).map((cert) => (
                <button
                  key={cert}
                  onClick={() => setSelectedCert(cert)}
                  className={`px-2.5 py-1 rounded-full text-[11px] tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                    selectedCert === cert
                      ? 'bg-[#2C3539] text-[#FFFFFF] font-medium'
                      : 'bg-[#FFFFFF] text-[#6B8E9B] border border-[#D1D8DB] hover:text-[#2C3539]'
                  }`}
                >
                  {cert === 'all' ? 'All Credentials' : cert}
                </button>
              ))}
            </div>
          </div>

          {/* Track Category Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#D1D8DB]/60">
            {trackTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedTrack === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTrack(tab.id as TrackFilter)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-sans transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#2C3539] text-[#FFFFFF] font-medium shadow-2xs'
                      : 'bg-[#FFFFFF] text-[#6B8E9B] border border-[#D1D8DB] hover:text-[#2C3539]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Case Study Cards Grid */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 mt-6">
        <div className="text-xs text-[#6B8E9B] mb-4 flex items-center justify-between font-sans">
          <span>Showing {filteredStudies.length} of 28 architectural blueprints</span>
          {searchQuery && <span>Filtered by &ldquo;{searchQuery}&rdquo;</span>}
        </div>

        {filteredStudies.length === 0 ? (
          <div className="py-16 text-center bg-[#FFFFFF] rounded-2xl border border-[#D1D8DB] p-8">
            <p className="font-serif text-[#2C3539] text-lg mb-2">No matching blueprints found</p>
            <p className="text-xs text-[#6B8E9B] mb-4">Try adjusting your search terms or reset track filters.</p>
            <button
              onClick={() => {
                setSelectedTrack('all');
                setSelectedCert('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-[#2C3539] text-white text-xs rounded-lg hover:bg-[#6B8E9B] transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredStudies.map((study) => (
              <div
                key={study.id}
                onClick={() => setActiveCaseStudy(study)}
                className="bg-[#FFFFFF] border border-[#D1D8DB] hover:border-[#6B8E9B] rounded-2xl p-6 transition-all duration-200 shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Top Metadata */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-mono text-[#6B8E9B] font-semibold tracking-wider">
                      BLUEPRINT #{String(study.number).padStart(2, '0')} &bull; {study.trackName.toUpperCase()}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {study.certifications.map((cert) => (
                        <span
                          key={cert}
                          className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-[#8DA399]/15 text-[#2C3539]"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="font-serif text-lg sm:text-xl text-[#2C3539] group-hover:text-[#6B8E9B] transition-colors mb-2 font-normal leading-snug">
                    {study.title}
                  </h3>
                  <p className="text-xs text-[#6B8E9B] font-sans leading-relaxed mb-4 line-clamp-2">
                    {study.subtitle}
                  </p>

                  {/* Key Challenge Preview */}
                  <div className="p-3 rounded-xl bg-[#F9F8F6] border border-[#D1D8DB]/60 mb-4 text-xs text-[#2C3539] leading-relaxed">
                    <span className="font-semibold text-[#6B8E9B] block text-[10px] uppercase tracking-wider mb-1">
                      System Challenge:
                    </span>
                    <p className="line-clamp-2">{study.challenge}</p>
                  </div>
                </div>

                <div>
                  {/* Service Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {study.gcpServices.slice(0, 3).map((srv) => (
                      <span
                        key={srv}
                        className="px-2 py-0.5 rounded-full bg-[#FFFFFF] border border-[#D1D8DB] text-[10px] text-[#6B8E9B]"
                      >
                        {srv}
                      </span>
                    ))}
                    {study.gcpServices.length > 3 && (
                      <span className="px-1.5 py-0.5 text-[10px] text-[#6B8E9B]">
                        +{study.gcpServices.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Metrics and Action Footer */}
                  <div className="pt-3 border-t border-[#D1D8DB]/40 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-sans text-[#8DA399] font-medium">
                      {study.metrics[0]}
                    </span>
                    <span className="flex items-center gap-1 text-[#2C3539] font-medium group-hover:text-[#6B8E9B] transition-colors">
                      <span>View Architecture</span>
                      <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Blueprint Modal / Drawer */}
      {activeCaseStudy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#2C3539]/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-[#FFFFFF] border border-[#D1D8DB] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#D1D8DB]/60 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-[#6B8E9B] bg-[#F9F8F6] px-2.5 py-1 rounded-md border border-[#D1D8DB]">
                  BLUEPRINT #{String(activeCaseStudy.number).padStart(2, '0')} OF 28
                </span>
                <span className="text-xs font-sans text-[#6B8E9B] uppercase tracking-wider font-semibold">
                  {activeCaseStudy.trackName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevStudy}
                  className="p-1.5 rounded-lg border border-[#D1D8DB] hover:bg-[#F9F8F6] text-[#6B8E9B] hover:text-[#2C3539] transition-colors cursor-pointer"
                  title="Previous Case Study"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextStudy}
                  className="p-1.5 rounded-lg border border-[#D1D8DB] hover:bg-[#F9F8F6] text-[#6B8E9B] hover:text-[#2C3539] transition-colors cursor-pointer"
                  title="Next Case Study"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveCaseStudy(null)}
                  className="p-1.5 rounded-lg border border-[#D1D8DB] hover:bg-[#F9F8F6] text-[#6B8E9B] hover:text-[#2C3539] transition-colors cursor-pointer ml-2"
                  title="Close Modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="space-y-6">
              {/* Title & Subtitle */}
              <div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {activeCaseStudy.certifications.map((cert) => (
                    <span
                      key={cert}
                      className="px-2.5 py-1 rounded text-xs font-bold tracking-wider bg-[#8DA399]/20 text-[#2C3539]"
                    >
                      {cert} Exam Pattern
                    </span>
                  ))}
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#2C3539] font-normal leading-tight">
                  {activeCaseStudy.title}
                </h2>
                <p className="text-sm text-[#6B8E9B] font-serif italic mt-1">
                  {activeCaseStudy.subtitle}
                </p>
              </div>

              {/* Metrics Benchmarks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activeCaseStudy.metrics.map((metric, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-[#F9F8F6] border border-[#D1D8DB] text-center"
                  >
                    <span className="text-xs text-[#2C3539] font-semibold block">{metric}</span>
                    <span className="text-[10px] text-[#6B8E9B] uppercase tracking-wider">Benchmark</span>
                  </div>
                ))}
              </div>

              {/* Challenge & Solution Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#E8E2D9]">
                  <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#A37B45] block mb-2">
                    System Challenge
                  </span>
                  <p className="text-xs text-[#2C3539] leading-relaxed">
                    {activeCaseStudy.challenge}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#F6F9F8] border border-[#D3E0DC]">
                  <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#4D7769] block mb-2">
                    Solution Architecture
                  </span>
                  <p className="text-xs text-[#2C3539] leading-relaxed">
                    {activeCaseStudy.solutionArchitecture}
                  </p>
                </div>
              </div>

              {/* ASCII Dataflow Architecture Diagram */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <GitBranch className="w-4 h-4 text-[#6B8E9B]" />
                  <span className="text-[11px] font-sans uppercase tracking-wider text-[#6B8E9B] font-semibold">
                    Architecture Dataflow Diagram
                  </span>
                </div>
                <pre className="p-4 rounded-xl bg-[#2C3539] text-[#FFFFB3] text-xs font-mono overflow-x-auto leading-relaxed border border-[#D1D8DB]/30 shadow-inner">
                  <code>{activeCaseStudy.asciiFlow}</code>
                </pre>
              </div>

              {/* Products Chain */}
              <div>
                <span className="text-[11px] font-sans uppercase tracking-wider text-[#6B8E9B] font-semibold block mb-2">
                  Integrated Google Cloud Products
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeCaseStudy.gcpServices.map((service) => (
                    <span
                      key={service}
                      className="px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#D1D8DB] text-xs text-[#2C3539] font-medium shadow-2xs"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              {/* Production Code Snippet */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-sans uppercase tracking-wider text-[#6B8E9B] font-semibold">
                    {activeCaseStudy.codeSnippetTitle}
                  </span>
                  <button
                    onClick={() => handleCopyCode(activeCaseStudy.id, activeCaseStudy.codeSnippet)}
                    className="flex items-center gap-1.5 text-xs text-[#6B8E9B] hover:text-[#2C3539] cursor-pointer transition-colors"
                  >
                    {copiedCodeId === activeCaseStudy.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-medium">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Snippet</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-[#2C3539] text-[#F9F8F6] text-xs font-mono overflow-x-auto leading-relaxed">
                  <code>{activeCaseStudy.codeSnippet}</code>
                </pre>
              </div>

              {/* Solutions Architect Exam Note */}
              <div className="p-4 rounded-xl bg-[#6B8E9B]/10 border border-[#6B8E9B]/30 flex items-start gap-3">
                <Award className="w-5 h-5 text-[#6B8E9B] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs font-sans font-bold uppercase tracking-wider text-[#2C3539] block">
                    Certification & Solutions Architect Takeaway
                  </span>
                  <p className="text-xs text-[#2C3539] leading-relaxed">
                    {activeCaseStudy.examTakeaway}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Bottom Footer */}
            <div className="mt-8 pt-4 border-t border-[#D1D8DB]/60 flex items-center justify-between text-xs text-[#6B8E9B]">
              <span>Press Esc or click Close to dismiss</span>
              <button
                onClick={() => setActiveCaseStudy(null)}
                className="px-4 py-2 rounded-lg bg-[#2C3539] text-white text-xs font-medium hover:bg-[#6B8E9B] transition-colors cursor-pointer"
              >
                Close Blueprint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
