'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, signInWithGoogle } from '@/lib/firebase';
import Lenis from 'lenis';
import { AnimatePresence } from 'motion/react';
import { CASE_STUDIES, CaseStudy } from '@/data/caseStudies';

// New Léoparpeix-style dark portfolio components
import { ScrollNavHeader } from '@/components/ScrollNavHeader';
import { HeroSection } from '@/components/HeroSection';
import { SelectedWorks } from '@/components/SelectedWorks';
import { ArchivesTable } from '@/components/ArchivesTable';
import { AboutSection } from '@/components/AboutSection';
import { FooterContact } from '@/components/FooterContact';
import { BlueprintModal } from '@/components/BlueprintModal';
import { CustomCursor } from '@/components/CustomCursor';

// Functional overlays
import { Dashboard } from '@/components/Dashboard';
import { GoogleStack } from '@/components/GoogleStack';
import { TrustAndPrivacy } from '@/components/TrustAndPrivacy';
import { Preferences } from '@/components/Preferences';
import { MapsExplorerModal } from '@/components/MapsExplorerModal';
import { X } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal / Overlay states
  const [activeBlueprint, setActiveBlueprint] = useState<CaseStudy | null>(null);
  const [memoryHubOpen, setMemoryHubOpen] = useState(false);
  const [stackOpen, setStackOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [mapsModalOpen, setMapsModalOpen] = useState(false);
  const [initialThought, setInitialThought] = useState('');

  // Firebase Auth observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const lenisRef = React.useRef<Lenis | null>(null);

  // Initialize smooth momentum scrolling via Lenis
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Lock body scroll and pause Lenis when full-screen modal overlays are active
  useEffect(() => {
    const isAnyModalOpen =
      activeBlueprint !== null ||
      memoryHubOpen ||
      stackOpen ||
      privacyOpen ||
      preferencesOpen ||
      mapsModalOpen;

    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
      lenisRef.current?.stop();
    } else {
      document.body.style.overflow = '';
      lenisRef.current?.start();
    }
  }, [
    activeBlueprint,
    memoryHubOpen,
    stackOpen,
    privacyOpen,
    preferencesOpen,
    mapsModalOpen,
  ]);

  // Handler to jump to Archives section
  const handleScrollToArchives = useCallback(() => {
    const el = document.getElementById('archives');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Handlers for reflection flow from Hero
  const handleBeginReflection = (thought: string) => {
    setInitialThought(thought);
    setMemoryHubOpen(true);
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error('Sign-in failed', e);
    }
  };

  // Select a service from SelectedWorks and open its blueprint
  const handleSelectService = (caseStudyId: string) => {
    const study = CASE_STUDIES.find((s) => s.id === caseStudyId);
    if (study) {
      setActiveBlueprint(study);
    } else {
      // Fallback: match by prefix if exact ID shifted
      const fallback = CASE_STUDIES.find((s) => caseStudyId.startsWith(s.id.slice(0, 6)));
      if (fallback) setActiveBlueprint(fallback);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded bg-[#111] border border-white/10 flex items-center justify-center text-[#D4AF37] font-heading text-lg animate-pulse">
          P
        </div>
        <div className="space-y-1 text-center font-mono">
          <p className="text-[#f4f4f4] text-sm">PAI</p>
          <p className="text-xs text-[#7d7d7d]">Synchronizing architectural state...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f4f4f4] font-sans relative selection:bg-yellow-300 selection:text-black">
      {/* Precision Magnetic Inverted Cursor */}
      <CustomCursor />

      {/* Fixed Sticky Header matching Léoparpeix */}
      <ScrollNavHeader
        user={user}
        onOpenMaps={() => setMapsModalOpen(true)}
        onOpenMemoryHub={() => setMemoryHubOpen(true)}
        onOpenPrivacy={() => setPrivacyOpen(true)}
        onOpenPreferences={() => setPreferencesOpen(true)}
        onOpenStack={() => setStackOpen(true)}
        onSignOut={() => setUser(null)}
        onSignIn={handleSignIn}
      />

      {/* Main Single-Scroll Flow */}
      <main className="flex flex-col">
        {/* Section 1: Hero Manifesto */}
        <section id="hero">
          <HeroSection
            onBeginReflection={handleBeginReflection}
            onSignedIn={() => setMemoryHubOpen(true)}
            onNavigateToCaseStudies={handleScrollToArchives}
          />
        </section>

        {/* Section 2: Selected Works (Core 4 Flagship Services) */}
        <section id="selected-works">
          <SelectedWorks onSelectService={handleSelectService} />
        </section>

        {/* Section 3: Architecture Archives (Tabular 28 Blueprints) */}
        <section id="archives">
          <ArchivesTable onSelectBlueprint={(study: CaseStudy) => setActiveBlueprint(study)} />
        </section>

        {/* Section 4: About / Hackathon Story */}
        <section id="about">
          <AboutSection onOpenStack={() => setStackOpen(true)} />
        </section>

        {/* Section 5: Contact & Colophon */}
        <section id="contact">
          <FooterContact
            onOpenPrivacy={() => setPrivacyOpen(true)}
            onOpenPreferences={() => setPreferencesOpen(true)}
          />
        </section>
      </main>

      {/* Detail Modal Drawer for Blueprints */}
      <AnimatePresence>
        {activeBlueprint && (
          <BlueprintModal
            study={activeBlueprint}
            allStudies={CASE_STUDIES}
            onClose={() => setActiveBlueprint(null)}
            onNavigate={(nextStudy: CaseStudy) => setActiveBlueprint(nextStudy)}
          />
        )}
      </AnimatePresence>

      {/* Full-Screen Overlay: Memory Hub (Dashboard) */}
      {memoryHubOpen && (
        <div 
          className="fixed inset-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in duration-200"
          data-lenis-prevent="true"
        >
          <div className="h-14 border-b border-white/10 px-6 flex items-center justify-between bg-[#111] shrink-0">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <span className="font-heading font-semibold text-sm text-[#f4f4f4]">
                PAI Memory Hub & Sanctuary
              </span>
            </div>
            <button
              onClick={() => setMemoryHubOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#f4f4f4] text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              data-cursor="CLOSE"
            >
              <X className="w-4 h-4" />
              <span>Close Hub</span>
            </button>
          </div>
          <div className="flex-1 overflow-hidden bg-[#0a0a0a] text-[#f4f4f4]" data-lenis-prevent="true">
            <Dashboard
              user={user}
              initialPrompt={initialThought}
              onOpenMaps={() => setMapsModalOpen(true)}
              onOpenPrivacy={() => setPrivacyOpen(true)}
              onOpenPreferences={() => setPreferencesOpen(true)}
            />
          </div>
        </div>
      )}

      {/* Full-Screen Overlay: Google Stack */}
      {stackOpen && (
        <div 
          className="fixed inset-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in duration-200"
          data-lenis-prevent="true"
        >
          <div className="h-14 border-b border-white/10 px-6 flex items-center justify-between bg-[#111] shrink-0">
            <span className="font-heading font-semibold text-sm text-[#f4f4f4]">
              Google Cloud Stack & Architecture Specs
            </span>
            <button
              onClick={() => setStackOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#f4f4f4] text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              data-cursor="CLOSE"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain bg-[#0a0a0a] text-[#f4f4f4]" data-lenis-prevent="true">
            <GoogleStack
              onBack={() => setStackOpen(false)}
              onNavigateToCaseStudies={() => {
                setStackOpen(false);
                handleScrollToArchives();
              }}
            />
          </div>
        </div>
      )}

      {/* Full-Screen Overlay: Privacy (Our Pact) */}
      {privacyOpen && (
        <div 
          className="fixed inset-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in duration-200"
          data-lenis-prevent="true"
        >
          <div className="h-14 border-b border-white/10 px-6 flex items-center justify-between bg-[#111] shrink-0">
            <span className="font-heading font-semibold text-sm text-[#f4f4f4]">
              Our Pact & Sovereign Privacy Manifesto
            </span>
            <button
              onClick={() => setPrivacyOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#f4f4f4] text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              data-cursor="CLOSE"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain bg-[#0a0a0a] text-[#f4f4f4]" data-lenis-prevent="true">
            <TrustAndPrivacy onBack={() => setPrivacyOpen(false)} />
          </div>
        </div>
      )}

      {/* Full-Screen Overlay: Preferences */}
      {preferencesOpen && (
        <div 
          className="fixed inset-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in duration-200"
          data-lenis-prevent="true"
        >
          <div className="h-14 border-b border-white/10 px-6 flex items-center justify-between bg-[#111] shrink-0">
            <span className="font-heading font-semibold text-sm text-[#f4f4f4]">
              PAI Memory & Reflection Preferences
            </span>
            <button
              onClick={() => setPreferencesOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#f4f4f4] text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              data-cursor="CLOSE"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain bg-[#0a0a0a] text-[#f4f4f4]" data-lenis-prevent="true">
            <Preferences onBack={() => setPreferencesOpen(false)} />
          </div>
        </div>
      )}

      {/* Global Google Maps Agent Launcher Modal */}
      <MapsExplorerModal
        isOpen={mapsModalOpen}
        onClose={() => setMapsModalOpen(false)}
      />
    </div>
  );
}
