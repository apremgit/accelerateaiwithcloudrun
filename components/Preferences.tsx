'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Sliders, Clock, MapPin, Database } from 'lucide-react';

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
    }, 3000);
  };

  return (
    <div id="view-preferences" className="min-h-[calc(100vh-4.5rem)] bg-[#F9F8F6] text-[#2C3539] py-12 px-6 sm:px-8 flex flex-col justify-between">
      {/* 600px centered container matching spec */}
      <div className="max-w-[600px] mx-auto w-full space-y-10">
        {/* Navigation & Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            id="btn-preferences-back"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.05em] text-[#6B8E9B] hover:opacity-80 transition-opacity cursor-pointer font-sans"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return</span>
          </button>
          <span className="text-[11px] uppercase tracking-[0.1em] text-[#6B8E9B] font-sans font-medium">
            Settings &bull; Pacing &bull; Tone
          </span>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-serif text-[#2C3539] font-normal tracking-[-0.02em]">
            Preferences
          </h1>
          <p className="text-base text-[#6B8E9B] font-sans font-light">
            Fine-tune the companion&apos;s pacing, tone, and sensory memory.
          </p>
        </div>

        {/* Preferences Rows */}
        <div className="space-y-1 divide-y divide-[#D1D8DB] border-y border-[#D1D8DB]">
          {/* Tone Setting */}
          <div className="py-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="tone-slider" className="text-sm font-sans font-medium text-[#2C3539] block">
                  Companion Tone
                </label>
                <p className="text-xs text-[#6B8E9B] font-sans font-light">
                  From crisp succinct analysis to spacious, contemplative depth.
                </p>
              </div>
              <span className="text-xs uppercase tracking-[0.05em] font-sans font-semibold text-[#6B8E9B] px-2.5 py-1 rounded bg-[#FFFFFF] border border-[#D1D8DB]">
                {preferences.tone}
              </span>
            </div>

            <div className="space-y-2 pt-1">
              <input
                id="tone-slider"
                type="range"
                min="0"
                max="2"
                step="1"
                value={toneToNumber(preferences.tone)}
                onChange={(e) => handleToneChange(Number(e.target.value))}
                className="w-full accent-[#6B8E9B] cursor-pointer h-1.5 bg-[#D1D8DB] rounded-lg"
              />
              <div className="flex justify-between text-[11px] uppercase tracking-[0.05em] text-[#6B8E9B]/80 font-sans font-medium">
                <span>Direct</span>
                <span>Balanced</span>
                <span>Reflective</span>
              </div>
            </div>
          </div>

          {/* Pacing Toggle: 2s Artificial Calm Delay */}
          <div className="py-6 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-sm font-sans font-medium text-[#2C3539] block">
                Artificial Pacing Delay (2s)
              </span>
              <p className="text-xs text-[#6B8E9B] font-sans font-light">
                Introduces a gentle 2-second pause before reflections reveal, eliminating urgency.
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
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                preferences.pacingDelay ? 'bg-[#6B8E9B]' : 'bg-[#D1D8DB]'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  preferences.pacingDelay ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Spatial Awareness (Google Maps) */}
          <div className="py-6 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-sm font-sans font-medium text-[#2C3539] block">
                Google Maps &amp; Spatial Grounding
              </span>
              <p className="text-xs text-[#6B8E9B] font-sans font-light">
                Allows finding tranquil physical sanctuaries, botanical gardens, and contemplative walking routes.
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
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                preferences.enableMapsContext ? 'bg-[#6B8E9B]' : 'bg-[#D1D8DB]'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  preferences.enableMapsContext ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Memory Storage Mode */}
          <div className="py-6 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-sm font-sans font-medium text-[#2C3539] block">
                Durable Cloud Persistence
              </span>
              <p className="text-xs text-[#6B8E9B] font-sans font-light">
                Sync securely to your owner-partitioned Firestore database across sessions.
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
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                preferences.persistenceMode === 'firestore' ? 'bg-[#6B8E9B]' : 'bg-[#D1D8DB]'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  preferences.persistenceMode === 'firestore' ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4">
          <span className="text-xs font-sans text-[#6B8E9B]">
            {isDirty ? 'Unsaved modifications.' : 'Configurations in rhythm.'}
          </span>

          <button
            id="btn-save-preferences"
            onClick={handleSave}
            className={`w-[140px] py-3 rounded text-xs font-sans uppercase tracking-[0.05em] transition-all cursor-pointer flex items-center justify-center gap-2 ${
              isSaved
                ? 'bg-[#FFFFFF] border border-[#8DA399] text-[#8DA399]'
                : isDirty
                ? 'bg-[#6B8E9B] text-white hover:opacity-90 animate-pulse'
                : 'bg-[#6B8E9B] text-white hover:opacity-90'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Preserved.</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center pt-16 pb-4 text-xs font-sans text-[#6B8E9B]/70">
        <p>Serene Minimalist AI &bull; Thoughtful configurations.</p>
      </div>
    </div>
  );
}
