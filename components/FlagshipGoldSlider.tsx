'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Award } from 'lucide-react';
import { GoldPlayCard, FlagshipServiceData } from './GoldPlayCard';

interface FlagshipGoldSliderProps {
  onSelectService: (caseStudyId: string) => void;
}

export const FLAGSHIP_SERVICES: FlagshipServiceData[] = [
  {
    id: 'cloud-run',
    rank: '#01',
    title: 'Google Cloud Run',
    subtitle: 'Serverless Scale-to-Zero Compute Engine',
    category: 'Runtime & Edge',
    iconType: 'cloud-run',
    gcpBadge: 'Cloud Run',
    certifications: ['ACE', 'PCA', 'CSAE'],
    metrics: { label: 'Cold Start Latency', value: '<850ms (0 to 1)' },
    hackathonRole:
      'Packages our full-stack Next.js OCI container with true --min-instances=0 scale-to-zero economics, zero-idle spend, and sub-second burst concurrency.',
    caseStudyId: 'pai-12-http2-streaming-sse',
  },
  {
    id: 'gemini-api',
    rank: '#02',
    title: 'Google Gemini API & AI Studio',
    subtitle: 'Multimodal Cognitive Reasoning Brain',
    category: 'Generative AI',
    iconType: 'gemini',
    gcpBadge: 'Vertex AI / Gemini',
    certifications: ['Enterprise AI', 'PCA'],
    metrics: { label: 'Resilience Ladder', value: '4-Tier Cascade' },
    hackathonRole:
      'Powers multi-turn conversational reasoning, memory extraction, and cognitive reflections via @google/genai with an automated 4-tier model fallback ladder.',
    caseStudyId: 'pai-08-gemini-multi-turn-orchestration',
  },
  {
    id: 'firestore',
    rank: '#03',
    title: 'Google Cloud Firestore',
    subtitle: 'Zero-Trust Sovereign Memory Store',
    category: 'Database & Security',
    iconType: 'firestore',
    gcpBadge: 'Firestore / Firebase',
    certifications: ['ACE', 'Security Eng'],
    metrics: { label: 'Tenant Isolation', value: '100% Owner-Bound' },
    hackathonRole:
      'Cryptographically isolates user reflections at /users/{uid}/... with owner-bound Firestore Security Rules guaranteeing zero data cross-talk.',
    caseStudyId: 'pai-02-user-isolated-firestore-hierarchy',
  },
  {
    id: 'google-maps',
    rank: '#04',
    title: 'Google Maps Platform',
    subtitle: 'Spatial Intelligence & Journey Grounding',
    category: 'Spatial Intelligence',
    iconType: 'maps',
    gcpBadge: 'Places & Routes API',
    certifications: ['PCA', 'Enterprise AI'],
    metrics: { label: 'Spatial Grounding', value: 'Places + Routes' },
    hackathonRole:
      'Grounds thought reflections with real-world geography using Places API (New) and Routes API, rendered natively with @vis.gl/react-google-maps.',
    caseStudyId: 'pai-22-google-maps-spatial-grounding',
  },
];

export function FlagshipGoldSlider({ onSelectService }: FlagshipGoldSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    // Calculate approximate active card index
    const cardWidth = 350 + 20; // card width + gap
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(Math.max(index, 0), FLAGSHIP_SERVICES.length - 1));
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    slider.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();

    return () => slider.removeEventListener('scroll', checkScroll);
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const scrollAmount = 370;
    sliderRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="mb-14">
      {/* Editorial Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#083D2A] text-[#FFE259] border border-[#D4AF37]/50 text-xs font-sans tracking-wide mb-2 shadow-xs">
            <Award className="w-3.5 h-3.5 text-[#FFE259]" />
            <span className="font-semibold uppercase tracking-wider text-[10.5px]">
              Flagship Showcase • Core 4 Hackathon Services
            </span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl text-[#083D2A] font-bold tracking-tight">
            Accelerate AI with Cloud Run
          </h2>
          <p className="text-sm text-[#4A6977] font-sans mt-1 max-w-xl">
            Swipe through our 4 core architectural pillars powering serverless scale-to-zero, multimodal cognition, sovereign memory, and spatial journeys.
          </p>
        </div>

        {/* Carousel Chevrons & Slide Indicator */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <span className="text-xs font-mono font-bold text-[#083D2A] px-2 py-1 rounded bg-[#EAEFF0]">
            0{activeIndex + 1} / 0{FLAGSHIP_SERVICES.length}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              className="w-9 h-9 rounded-full bg-white border border-[#D1D8DB] flex items-center justify-center text-[#083D2A] hover:bg-[#083D2A] hover:text-[#FFE259] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-2xs"
              data-cursor="PREV"
              aria-label="Previous service card"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              className="w-9 h-9 rounded-full bg-white border border-[#D1D8DB] flex items-center justify-center text-[#083D2A] hover:bg-[#083D2A] hover:text-[#FFE259] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-2xs"
              data-cursor="NEXT"
              aria-label="Next service card"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Sliding Track */}
      <div
        ref={sliderRef}
        className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth snap-x snap-mandatory"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {FLAGSHIP_SERVICES.map((service) => (
          <div key={service.id} className="snap-start">
            <GoldPlayCard service={service} onSelect={onSelectService} />
          </div>
        ))}
      </div>
    </section>
  );
}
