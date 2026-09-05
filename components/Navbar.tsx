'use client';

import React from 'react';
import { User } from 'firebase/auth';
import { signOutUser } from '@/lib/firebase';
import { LogOut, Compass, ShieldCheck, SlidersHorizontal, BookOpen } from 'lucide-react';
import Image from 'next/image';

interface NavbarProps {
  user: User | null;
  activeTab?: 'landing' | 'sanctuary' | 'privacy' | 'preferences' | 'stack' | 'case-studies';
  onNavigate?: (tab: 'landing' | 'sanctuary' | 'privacy' | 'preferences' | 'stack' | 'case-studies') => void;
  onOpenMaps?: () => void;
  onSignOut?: () => void;
}

export function Navbar({ user, activeTab = 'sanctuary', onNavigate, onOpenMaps, onSignOut }: NavbarProps) {
  const handleSignOut = async () => {
    await signOutUser();
    if (onSignOut) onSignOut();
  };

  return (
    <header id="app-navbar" className="w-full border-b border-[#D1D8DB] bg-[#F9F8F6]/95 backdrop-blur-xs sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate?.(user ? 'sanctuary' : 'landing')}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-md bg-[#6B8E9B] flex items-center justify-center text-white font-serif italic text-lg shadow-xs group-hover:opacity-90 transition-opacity">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-[#2C3539] tracking-[-0.02em] text-lg font-normal">
                  Serene
                </span>
                <span className="text-[10px] uppercase tracking-[0.05em] px-2 py-0.5 rounded bg-[#FFFFFF] text-[#6B8E9B] border border-[#D1D8DB] font-sans font-medium">
                  AI Sanctuary
                </span>
              </div>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-[#D1D8DB]">
            <button
              id="nav-tab-sanctuary"
              onClick={() => onNavigate?.(user ? 'sanctuary' : 'landing')}
              className={`px-3 py-1.5 rounded text-xs font-sans uppercase tracking-[0.05em] transition-all cursor-pointer ${
                activeTab === 'sanctuary' || activeTab === 'landing'
                  ? 'text-[#2C3539] font-medium bg-[#FFFFFF] border border-[#D1D8DB]'
                  : 'text-[#6B8E9B] hover:text-[#2C3539]'
              }`}
            >
              Sanctuary
            </button>

            <button
              id="nav-tab-privacy"
              onClick={() => onNavigate?.('privacy')}
              className={`px-3 py-1.5 rounded text-xs font-sans uppercase tracking-[0.05em] transition-all cursor-pointer ${
                activeTab === 'privacy'
                  ? 'text-[#2C3539] font-medium bg-[#FFFFFF] border border-[#D1D8DB]'
                  : 'text-[#6B8E9B] hover:text-[#2C3539]'
              }`}
            >
              Our Pact
            </button>

            <button
              id="nav-tab-preferences"
              onClick={() => onNavigate?.('preferences')}
              className={`px-3 py-1.5 rounded text-xs font-sans uppercase tracking-[0.05em] transition-all cursor-pointer ${
                activeTab === 'preferences'
                  ? 'text-[#2C3539] font-medium bg-[#FFFFFF] border border-[#D1D8DB]'
                  : 'text-[#6B8E9B] hover:text-[#2C3539]'
              }`}
            >
              Preferences
            </button>

            <button
              id="nav-tab-stack"
              onClick={() => onNavigate?.('stack')}
              className={`px-3 py-1.5 rounded text-xs font-sans uppercase tracking-[0.05em] transition-all cursor-pointer ${
                activeTab === 'stack'
                  ? 'text-[#2C3539] font-medium bg-[#FFFFFF] border border-[#D1D8DB]'
                  : 'text-[#6B8E9B] hover:text-[#2C3539]'
              }`}
            >
              Google Stack
            </button>

            <button
              id="nav-tab-case-studies"
              onClick={() => onNavigate?.('case-studies')}
              className={`px-3 py-1.5 rounded text-xs font-sans uppercase tracking-[0.05em] transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'case-studies'
                  ? 'text-[#2C3539] font-medium bg-[#FFFFFF] border border-[#D1D8DB]'
                  : 'text-[#6B8E9B] hover:text-[#2C3539]'
              }`}
            >
              <span>Case Studies</span>
              <span className="w-4 h-4 rounded-full bg-[#8DA399]/20 text-[#2C3539] text-[10px] font-bold flex items-center justify-center">
                28
              </span>
            </button>
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Spatial Agent Launcher */}
          {onOpenMaps && (
            <button
              id="btn-nav-maps"
              onClick={onOpenMaps}
              title="Open Google Maps & Journey Intelligence Agent"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#FFFFFF] hover:bg-[#F9F8F6] border border-[#D1D8DB] hover:border-[#6B8E9B] text-[#6B8E9B] hover:text-[#2C3539] text-xs font-sans uppercase tracking-[0.05em] transition-all cursor-pointer shadow-xs"
            >
              <Compass className="w-3.5 h-3.5 text-[#6B8E9B]" />
              <span className="hidden sm:inline">Maps Agent</span>
            </button>
          )}

          {/* Cloud Persistence Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded bg-[#FFFFFF] border border-[#D1D8DB] text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8DA399]"></span>
            <span className="text-[10px] uppercase tracking-[0.05em] text-[#6B8E9B] font-sans font-medium">
              Firestore Isolated
            </span>
          </div>

          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-[#D1D8DB]">
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  width={30}
                  height={30}
                  className="w-7 h-7 rounded-full border border-[#D1D8DB] object-cover"
                  referrerPolicy="no-referrer"
                  unoptimized
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#FFFFFF] border border-[#D1D8DB] flex items-center justify-center text-[#6B8E9B] font-sans text-xs">
                  {user.displayName ? user.displayName.slice(0, 1).toUpperCase() : 'U'}
                </div>
              )}

              <button
                id="btn-sign-out"
                onClick={handleSignOut}
                title="Sign out"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-[#D1D8DB] bg-[#FFFFFF] hover:bg-[#F9F8F6] text-[#6B8E9B] hover:text-[#2C3539] text-xs font-sans uppercase tracking-[0.05em] transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Leave</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate?.('landing')}
              className="px-4 py-1.5 rounded bg-[#6B8E9B] text-white text-xs font-sans uppercase tracking-[0.05em] hover:opacity-90 cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
