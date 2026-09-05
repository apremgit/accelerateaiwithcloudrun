'use client';

import React, { useState } from 'react';
import { ShieldCheck, Check, ArrowLeft, AlertCircle } from 'lucide-react';

interface TrustAndPrivacyProps {
  onBack: () => void;
  onPurgeLocalMemory?: () => void;
}

export function TrustAndPrivacy({ onBack, onPurgeLocalMemory }: TrustAndPrivacyProps) {
  const [purgeModalOpen, setPurgeModalOpen] = useState(false);
  const [showPurgedFlash, setShowPurgedFlash] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

  const handleConfirmPurge = () => {
    setIsPurging(true);
    setTimeout(() => {
      if (onPurgeLocalMemory) {
        onPurgeLocalMemory();
      }
      try {
        localStorage.removeItem('reflectai_recent_prompts');
        localStorage.removeItem('serene_user_preferences');
      } catch (e) {
        console.error('Storage clear error', e);
      }
      setIsPurging(false);
      setPurgeModalOpen(false);
      setShowPurgedFlash(true);
      setTimeout(() => {
        setShowPurgedFlash(false);
      }, 1200);
    }, 400);
  };

  return (
    <div
      id="view-trust-privacy"
      className={`min-h-[calc(100vh-4.5rem)] transition-colors duration-700 ${
        showPurgedFlash ? 'bg-[#8DA399]/20' : 'bg-[#F9F8F6]'
      } text-[#2C3539] flex flex-col justify-between py-12 px-6 sm:px-8`}
    >
      {/* Centered reading layout, reminiscent of a fine printed book */}
      <div className="max-w-[580px] mx-auto w-full space-y-12">
        {/* Back navigation */}
        <div className="flex items-center justify-between">
          <button
            id="btn-privacy-back"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.05em] text-[#6B8E9B] hover:opacity-80 transition-opacity cursor-pointer font-sans"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return</span>
          </button>
          <span className="text-[11px] uppercase tracking-[0.1em] text-[#8DA399] font-sans font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8DA399]"></span>
            Manifesto &amp; Safety
          </span>
        </div>

        {/* Page Title */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-serif text-[#2C3539] font-normal tracking-[-0.02em] leading-tight">
            Our Pact.
          </h1>
          <p className="text-[#6B8E9B] font-sans text-base font-light leading-relaxed">
            A transparent commitment to quiet contemplation, user sovereignty, and absolute privacy.
          </p>
        </div>

        {/* Subtle divider */}
        <div className="border-t border-[#D1D8DB] w-full" />

        {/* Series of Promise Blocks: Headings in Albert Sans uppercase, body in Lora */}
        <div className="space-y-10 font-serif text-[#2C3539] text-lg leading-[1.75]">
          <div className="space-y-2">
            <h2 className="font-sans text-[13px] uppercase tracking-[0.05em] text-[#6B8E9B] font-semibold">
              I. Sovereign Memory &amp; Zero Training
            </h2>
            <p className="text-base text-[#2C3539]/90 font-serif">
              Your words belong solely to you. We never sell your thoughts, monetize conversational telemetry,
              or permit third-party crawlers to train public foundation models on your private reflections. What is
              written in quiet contemplation remains yours alone.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-sans text-[13px] uppercase tracking-[0.05em] text-[#6B8E9B] font-semibold">
              II. Strict Firestore Isolation
            </h2>
            <p className="text-base text-[#2C3539]/90 font-serif">
              Every journal entry is cryptographically anchored to your verified user identifier. In Cloud
              Firestore, entries are partitioned strictly at{' '}
              <code className="text-xs font-mono bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#D1D8DB] text-[#2C3539]">
                /users/{'{userId}'}/entries/{'{entryId}'}
              </code>
              . Cross-tenant reads and insecure wildcard accesses are prohibited by our deployment rules.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-sans text-[13px] uppercase tracking-[0.05em] text-[#6B8E9B] font-semibold">
              III. Server-Only Secret Vault
            </h2>
            <p className="text-base text-[#2C3539]/90 font-serif">
              All interactions with Gemini 3.6 Flash and Google Maps Platform APIs execute on hardened Cloud Run
              server proxies. No client bundle ever receives raw credentials, preventing token leakage and unauthorized
              invocation.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-sans text-[13px] uppercase tracking-[0.05em] text-[#6B8E9B] font-semibold">
              IV. Unconditional Erasure
            </h2>
            <p className="text-base text-[#2C3539]/90 font-serif">
              You retain the unrestricted right to silence your history. You may purge active local session memories
              or delete individual journal logs at any time. When deleted, records are wiped immediately without lingering
              retention buffers.
            </p>
          </div>
        </div>

        {/* Data Purge Section */}
        <div className="pt-6 border-t border-[#D1D8DB] space-y-4">
          <div className="p-6 bg-[#FFFFFF] rounded-lg border border-[#D1D8DB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[13px] uppercase tracking-[0.05em] text-[#2C3539] font-sans font-semibold block">
                Local Memory Purge
              </span>
              <p className="text-xs text-[#6B8E9B] font-sans">
                Immediately clear local temporary session caches and prompt drafts from this browser.
              </p>
            </div>

            <button
              id="btn-purge-local-memory"
              onClick={() => setPurgeModalOpen(true)}
              className="px-5 py-2.5 rounded bg-transparent hover:bg-[#F9F8F6] border border-[#D1D8DB] hover:border-[#6B8E9B] text-xs uppercase tracking-[0.05em] font-sans text-[#2C3539] hover:text-[#6B8E9B] transition-all cursor-pointer whitespace-nowrap"
            >
              Purge Local Memory
            </button>
          </div>

          {showPurgedFlash && (
            <div className="p-3 bg-[#8DA399]/20 border border-[#8DA399] rounded text-[#2C3539] text-xs font-sans flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 text-[#8DA399]" />
              <span>Local session memories have been gently cleared.</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center pt-16 pb-4 text-xs font-sans text-[#6B8E9B]/70">
        <p>Serene Minimalist AI &bull; Written with transparency and care.</p>
      </div>

      {/* Soft Confirmation Modal */}
      {purgeModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2C3539]/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#D1D8DB] max-w-md w-full p-8 rounded-lg space-y-6 shadow-sm">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded bg-[#F9F8F6] border border-[#D1D8DB] flex items-center justify-center text-[#6B8E9B]">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-serif text-[#2C3539] font-normal">
                Are you sure?
              </h3>
              <p className="text-sm font-serif italic text-[#6B8E9B]">
                &ldquo;Silence is permanent.&rdquo;
              </p>
              <p className="text-xs font-sans text-[#2C3539]/80 leading-relaxed pt-2">
                This will clear unsaved local thought buffers and prompt history on this device.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                id="btn-cancel-purge"
                onClick={() => setPurgeModalOpen(false)}
                className="px-4 py-2 text-xs font-sans uppercase tracking-[0.05em] text-[#6B8E9B] hover:text-[#2C3539] cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-purge"
                onClick={handleConfirmPurge}
                disabled={isPurging}
                className="px-6 py-2.5 rounded bg-[#6B8E9B] hover:opacity-90 text-white text-xs font-sans uppercase tracking-[0.05em] transition-opacity cursor-pointer disabled:opacity-50"
              >
                {isPurging ? 'Purging...' : 'Confirm Purge'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
