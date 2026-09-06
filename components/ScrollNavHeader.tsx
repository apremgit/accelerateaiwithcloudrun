'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { signOutUser } from '@/lib/firebase';
import { LogOut, Compass, Menu, X } from 'lucide-react';
import Image from 'next/image';

interface ScrollNavHeaderProps {
  user: User | null;
  onOpenMaps: () => void;
  onOpenMemoryHub: () => void;
  onOpenPrivacy: () => void;
  onOpenPreferences: () => void;
  onOpenStack: () => void;
  onSignOut: () => void;
  onSignIn: () => void;
}

const SECTIONS = [
  { id: 'hero', label: 'Home' },
  { id: 'selected-works', label: 'Selected' },
  { id: 'archives', label: 'Archives' },
  { id: 'about', label: 'About' },
] as const;

export function ScrollNavHeader({
  user,
  onOpenMaps,
  onOpenMemoryHub,
  onOpenPrivacy,
  onOpenPreferences,
  onOpenStack,
  onSignOut,
  onSignIn,
}: ScrollNavHeaderProps) {
  const [activeSection, setActiveSection] = useState('hero');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    // IntersectionObserver for active section tracking
    const observers: IntersectionObserver[] = [];
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' }
      );
      observer.observe(el);
      observers.push(observer);
    });

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observers.forEach((o) => o.disconnect());
    };
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOutUser();
    onSignOut();
  };

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0a0a0a]/85 backdrop-blur-xl border-b border-white/[0.06]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-[var(--spacing-page-x)] h-16 flex items-center justify-between">
          {/* Left: Logo & Identity */}
          <button
            onClick={() => scrollToSection('hero')}
            className="flex items-center gap-3 group cursor-pointer"
            data-cursor="HOME"
          >
            <div className="w-9 h-9 rounded-md bg-[#111] border border-white/[0.1] flex items-center justify-center text-[#D4AF37] font-heading font-bold text-lg group-hover:border-[#D4AF37]/50 transition-colors">
              P
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-heading text-[#f4f4f4] tracking-[-0.02em] text-base font-semibold">
                  PAI
                </span>
              </div>
            </div>
          </button>

          {/* Center: Status Widget */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-[#7d7d7d] uppercase tracking-[0.06em]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            <span>Hackathon • Accelerate AI with Cloud Run</span>
          </div>

          {/* Right: Navigation */}
          <div className="flex items-center gap-1">
            {/* Section Nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              {SECTIONS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className={`px-3 py-1.5 rounded text-[11px] uppercase tracking-[0.06em] transition-all cursor-pointer ${
                    activeSection === id
                      ? 'text-[#f4f4f4] bg-white/[0.06]'
                      : 'text-[#7d7d7d] hover:text-[#f4f4f4]'
                  }`}
                  data-cursor={label.toUpperCase()}
                >
                  {label}
                </button>
              ))}

              <div className="w-px h-4 bg-white/[0.08] mx-1" />

              {/* Functional nav */}
              <button
                onClick={onOpenMemoryHub}
                className="px-3 py-1.5 rounded text-[11px] uppercase tracking-[0.06em] text-[#7d7d7d] hover:text-[#f4f4f4] transition-all cursor-pointer"
                data-cursor="MEMORY"
              >
                Memory Hub
              </button>
              <button
                onClick={onOpenStack}
                className="px-3 py-1.5 rounded text-[11px] uppercase tracking-[0.06em] text-[#7d7d7d] hover:text-[#f4f4f4] transition-all cursor-pointer"
                data-cursor="STACK"
              >
                Stack
              </button>
            </nav>

            {/* Maps Agent */}
            <button
              onClick={onOpenMaps}
              title="Open Google Maps & Journey Intelligence Agent"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] uppercase tracking-[0.06em] text-[#7d7d7d] hover:text-[#f4f4f4] transition-all cursor-pointer ml-1"
              data-cursor="MAPS"
            >
              <Compass className="w-3.5 h-3.5" />
            </button>

            {/* Auth */}
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/[0.08]">
              {user ? (
                <>
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      width={28}
                      height={28}
                      className="w-7 h-7 rounded-full border border-white/[0.1] object-cover"
                      referrerPolicy="no-referrer"
                      unoptimized
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-[#7d7d7d] text-xs font-mono">
                      {user.displayName ? user.displayName.slice(0, 1).toUpperCase() : 'U'}
                    </div>
                  )}
                  <button
                    onClick={handleSignOut}
                    title="Sign out"
                    className="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-[#7d7d7d] hover:text-[#f4f4f4] transition-colors cursor-pointer"
                    data-cursor="LEAVE"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={onSignIn}
                  className="px-3 py-1.5 rounded text-[11px] uppercase tracking-[0.06em] bg-white/[0.06] border border-white/[0.1] text-[#f4f4f4] hover:bg-white/[0.1] transition-all cursor-pointer"
                  data-cursor="SIGN IN"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden ml-2 p-2 text-[#7d7d7d] hover:text-[#f4f4f4] transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[49] bg-[#0a0a0a]/95 backdrop-blur-xl md:hidden pt-20">
          <nav className="flex flex-col items-center gap-1 px-6 py-8">
            {SECTIONS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={`w-full px-4 py-3 rounded-lg text-sm uppercase tracking-[0.06em] transition-all cursor-pointer text-center ${
                  activeSection === id
                    ? 'text-[#f4f4f4] bg-white/[0.06]'
                    : 'text-[#7d7d7d]'
                }`}
              >
                {label}
              </button>
            ))}
            <div className="w-full h-px bg-white/[0.06] my-3" />
            <button
              onClick={() => { onOpenMemoryHub(); setMobileMenuOpen(false); }}
              className="w-full px-4 py-3 rounded-lg text-sm uppercase tracking-[0.06em] text-[#7d7d7d] cursor-pointer text-center"
            >
              Memory Hub
            </button>
            <button
              onClick={() => { onOpenStack(); setMobileMenuOpen(false); }}
              className="w-full px-4 py-3 rounded-lg text-sm uppercase tracking-[0.06em] text-[#7d7d7d] cursor-pointer text-center"
            >
              Google Stack
            </button>
            <button
              onClick={() => { onOpenPrivacy(); setMobileMenuOpen(false); }}
              className="w-full px-4 py-3 rounded-lg text-sm uppercase tracking-[0.06em] text-[#7d7d7d] cursor-pointer text-center"
            >
              Our Pact
            </button>
            <button
              onClick={() => { onOpenPreferences(); setMobileMenuOpen(false); }}
              className="w-full px-4 py-3 rounded-lg text-sm uppercase tracking-[0.06em] text-[#7d7d7d] cursor-pointer text-center"
            >
              Preferences
            </button>
            <button
              onClick={() => { onOpenMaps(); setMobileMenuOpen(false); }}
              className="w-full px-4 py-3 rounded-lg text-sm uppercase tracking-[0.06em] text-[#7d7d7d] cursor-pointer text-center flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4" />
              Maps Agent
            </button>
          </nav>
        </div>
      )}
    </>
  );
}
