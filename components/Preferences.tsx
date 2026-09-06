'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Check,
  Sliders,
  Clock,
  Compass,
  Database,
  Sparkles,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface UserPreferencesData {
  tone: 'direct' | 'balanced' | 'reflective';
  pacingDelay: boolean; // 2s artificial calm delay
  enableMapsContext: boolean;
  persistenceMode: 'firestore' | 'session';
}

interface PreferencesProps {
  onBack: () => void;
  onPreferencesUpdated?: (prefs: UserPreferencesData) => void;
}

const DEFAULT_PREFERENCES: UserPreferencesData = {
  tone: 'reflective',
  pacingDelay: true,
  enableMapsContext: true,
  persistenceMode: 'firestore',
};

export function Preferences({ onBack, onPreferencesUpdated }: PreferencesProps) {
  const [preferences, setPreferences] = useState<UserPreferencesData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('serene_user_preferences');
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (e) {
        console.error('Failed to load user preferences', e);
      }
    }
    return DEFAULT_PREFERENCES;
  });
  const [isDirty, setIsDirty] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleToneChange = (val: number) => {
    setIsDirty(true);
    setIsSaved(false);
    let toneVal: 'direct' | 'balanced' | 'reflective' = 'reflective';
    if (val === 0) toneVal = 'direct';
    else if (val === 1) toneVal = 'balanced';
    else toneVal = 'reflective';

    setPreferences((prev) => ({ ...prev, tone: toneVal }));
  };

  const toneToNumber = (tone: 'direct' | 'balanced' | 'reflective') => {
    if (tone === 'direct') return 0;
    if (tone === 'balanced') return 1;
    return 2;
  };

  const handleSave = () => {
    try {
      localStorage.setItem('serene_user_preferences', JSON.stringify(preferences));
    } catch (e) {
      console.error('Failed to persist preferences', e);
    }

    if (onPreferencesUpdated) {
      onPreferencesUpdated(preferences);
    }

    setIsDirty(false);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2800);
  };

  return (
    <div
      id="view-preferences"
      data-lenis-prevent="true"
      className="min-h-full bg-[#0a0a0a] text-[#f4f4f4] py-12 px-6 sm:px-12 flex flex-col justify-between selection:bg-[#D4AF37]/30 selection:text-[#f4f4f4]"
    >
      <div className="max-w-3xl mx-auto w-full space-y-10">
        {/* Navigation & Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between"
        >
          <button
            id="btn-preferences-back"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-mono text-[#7d7d7d] hover:text-white transition-colors cursor-pointer"
            data-cursor="RETURN"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return</span>
          </button>
          <span className="text-[11px] uppercase tracking-widest font-mono text-[#D4AF37] flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/25">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
            CONFIGURATIONS &bull; PACING &bull; TONE
          </span>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2 text-xs font-mono text-[#7d7d7d] uppercase tracking-wider">
            <Sliders className="w-3.5 h-3.5 text-[#10b981]" />
            <span>Runtime Control Parameters</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading font-medium tracking-tight text-[#f4f4f4] leading-tight">
            Preferences.
          </h1>
          <p className="text-base text-[#999] font-normal leading-relaxed">
            Calibrate PAI&apos;s cognitive tempo, reasoning tone, spatial memory grounding, and cloud persistence.
          </p>
        </motion.div>

        {/* Divider */}
        <div className="border-t border-white/10 w-full" />

        {/* Preferences Cards */}
        <div className="space-y-4">
          {/* Card 1: Tone Setting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="p-6 rounded-xl bg-[#111111] border border-white/10 hover:border-white/20 transition-all space-y-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <label htmlFor="tone-slider" className="text-base font-heading font-semibold text-white block">
                    Companion Reasoning Tone
                  </label>
                </div>
                <p className="text-xs sm:text-sm text-[#999]">
                  Modulates the system instruction prompt: from crisp direct answers to spacious, contemplative depth.
                </p>
              </div>
              <span className="text-xs uppercase font-mono tracking-wider font-semibold text-[#D4AF37] px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 whitespace-nowrap">
                {preferences.tone}
              </span>
            </div>

            <div className="space-y-3 pt-2">
              <input
                id="tone-slider"
                type="range"
                min="0"
                max="2"
                step="1"
                value={toneToNumber(preferences.tone)}
                onChange={(e) => handleToneChange(Number(e.target.value))}
                className="w-full accent-[#D4AF37] cursor-pointer h-2 bg-[#222] rounded-lg appearance-none"
              />
              <div className="flex justify-between text-xs font-mono uppercase tracking-wider text-[#7d7d7d]">
                <span className={preferences.tone === 'direct' ? 'text-white font-bold' : ''}>Direct</span>
                <span className={preferences.tone === 'balanced' ? 'text-white font-bold' : ''}>Balanced</span>
                <span className={preferences.tone === 'reflective' ? 'text-white font-bold' : ''}>Reflective</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Pacing Toggle (2s Delay) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.25 }}
            className="p-6 rounded-xl bg-[#111111] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-6"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#10b981]" />
                <span className="text-base font-heading font-semibold text-white block">
                  Artificial Pacing Delay (2s)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#999]">
                Injects an intentional calm pause before reflections reveal, reducing frantic reactivity and urgency.
              </p>
            </div>

            <button
              id="btn-toggle-pacing"
              role="switch"
              aria-checked={preferences.pacingDelay}
              onClick={() => {
                setIsDirty(true);
                setIsSaved(false);
                setPreferences((prev) => ({ ...prev, pacingDelay: !prev.pacingDelay }));
              }}
              className={`w-14 h-7 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                preferences.pacingDelay ? 'bg-[#10b981]' : 'bg-[#262626] border border-white/10'
              }`}
              data-cursor="TOGGLE"
            >
              <span
                className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform shadow-md ${
                  preferences.pacingDelay ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
          </motion.div>

          {/* Card 3: Spatial Awareness (Google Maps) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.35 }}
            className="p-6 rounded-xl bg-[#111111] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-6"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#3b82f6]" />
                <span className="text-base font-heading font-semibold text-white block">
                  Google Maps &amp; Spatial Grounding
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#999]">
                Enables the live Places (New) and Routes API agent to discover peaceful physical sanctuaries, botanical gardens, and contemplative walks.
              </p>
            </div>

            <button
              id="btn-toggle-maps"
              role="switch"
              aria-checked={preferences.enableMapsContext}
              onClick={() => {
                setIsDirty(true);
                setIsSaved(false);
                setPreferences((prev) => ({ ...prev, enableMapsContext: !prev.enableMapsContext }));
              }}
              className={`w-14 h-7 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                preferences.enableMapsContext ? 'bg-[#3b82f6]' : 'bg-[#262626] border border-white/10'
              }`}
              data-cursor="TOGGLE"
            >
              <span
                className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform shadow-md ${
                  preferences.enableMapsContext ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
          </motion.div>

          {/* Card 4: Durable Firestore Persistence */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.45 }}
            className="p-6 rounded-xl bg-[#111111] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-6"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#8b5cf6]" />
                <span className="text-base font-heading font-semibold text-white block">
                  Durable Cloud Persistence
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#999]">
                Sync reflections securely to your private, owner-partitioned Google Cloud Firestore vault across devices.
              </p>
            </div>

            <button
              id="btn-toggle-persistence"
              role="switch"
              aria-checked={preferences.persistenceMode === 'firestore'}
              onClick={() => {
                setIsDirty(true);
                setIsSaved(false);
                setPreferences((prev) => ({
                  ...prev,
                  persistenceMode: prev.persistenceMode === 'firestore' ? 'session' : 'firestore',
                }));
              }}
              className={`w-14 h-7 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                preferences.persistenceMode === 'firestore' ? 'bg-[#8b5cf6]' : 'bg-[#262626] border border-white/10'
              }`}
              data-cursor="TOGGLE"
            >
              <span
                className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform shadow-md ${
                  preferences.persistenceMode === 'firestore' ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
          </motion.div>
        </div>

        {/* Action Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="flex items-center justify-between pt-4"
        >
          <span className="text-xs font-mono text-[#7d7d7d]">
            {isDirty ? '● Unsaved modifications pending' : '✓ Configurations synchronized'}
          </span>

          <button
            id="btn-save-preferences"
            onClick={handleSave}
            className={`px-6 py-3 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
              isSaved
                ? 'bg-[#10b981] text-black font-semibold'
                : isDirty
                ? 'bg-[#D4AF37] text-black font-semibold hover:bg-[#c49f27] animate-pulse shadow-lg shadow-[#D4AF37]/20'
                : 'bg-white/10 hover:bg-white/20 text-white font-medium border border-white/15'
            }`}
            data-cursor="SAVE"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Preserved</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </motion.div>

        {/* Footer Note */}
        <div className="text-center pt-8 pb-4 text-xs font-mono text-[#7d7d7d]">
          <p>PAI &bull; Sovereign Companion Configuration Layer</p>
        </div>
      </div>
    </div>
  );
}
