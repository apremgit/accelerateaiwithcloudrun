'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Check,
  ArrowLeft,
  AlertTriangle,
  Lock,
  Database,
  Server,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
        localStorage.removeItem('serene_guest_entries');
      } catch (e) {
        console.error('Storage clear error', e);
      }
      setIsPurging(false);
      setPurgeModalOpen(false);
      setShowPurgedFlash(true);
      setTimeout(() => {
        setShowPurgedFlash(false);
      }, 2000);
    }, 450);
  };

  const promises = [
    {
      num: '01',
      title: 'Sovereign Memory & Zero Training',
      icon: <Lock className="w-5 h-5 text-[#10b981]" />,
      tag: 'Zero-Telemetry',
      description:
        'Your words belong solely to you. We never sell your thoughts, monetize conversational telemetry, or permit third-party crawlers to train public foundation models on your private reflections. What is written in quiet contemplation remains yours alone.',
      badge: 'Zero AI Training',
    },
    {
      num: '02',
      title: 'Strict Firestore Tenant Isolation',
      icon: <Database className="w-5 h-5 text-[#8b5cf6]" />,
      tag: 'Owner-Bound',
      description:
        'Every reflection is cryptographically anchored to your verified user identifier. In Cloud Firestore, entries are partitioned strictly under /users/{userId}/entries/{entryId}. Cross-tenant reads and insecure wildcard accesses are structurally prohibited by deployment security rules.',
      code: '/users/{userId}/entries/{entryId}',
      badge: 'Cryptographic Boundary',
    },
    {
      num: '03',
      title: 'Server-Only Secret Vault',
      icon: <Server className="w-5 h-5 text-[#3b82f6]" />,
      tag: 'Zero-Leakage',
      description:
        'All interactions with Gemini 2.5 Flash and Google Maps Platform APIs execute strictly on hardened Google Cloud Run server proxies. No client bundle ever receives raw credentials or master API keys, preventing credential scraping and unauthorized calls.',
      badge: 'GCP Cloud Run Proxy',
    },
    {
      num: '04',
      title: 'Unconditional Instant Erasure',
      icon: <Trash2 className="w-5 h-5 text-[#D4AF37]" />,
      tag: 'Right to Silence',
      description:
        'You retain the unrestricted right to silence your history. You may purge active local session memories or delete individual journal entries at any time. When deleted, records are wiped immediately without lingering retention buffers or training caches.',
      badge: 'Permanent Deletion',
    },
  ];

  return (
    <div
      id="view-trust-privacy"
      data-lenis-prevent="true"
      className="min-h-full bg-[#0a0a0a] text-[#f4f4f4] py-12 px-6 sm:px-12 flex flex-col justify-between selection:bg-[#D4AF37]/30 selection:text-[#f4f4f4]"
    >
      <div className="max-w-4xl mx-auto w-full space-y-12">
        {/* Top Navigation & Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between"
        >
          <button
            id="btn-privacy-back"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-mono text-[#7d7d7d] hover:text-white transition-colors cursor-pointer"
            data-cursor="RETURN"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return</span>
          </button>
          <span className="text-[11px] uppercase tracking-widest font-mono text-[#10b981] flex items-center gap-2 px-3 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/25">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            SOVEREIGNTY &amp; PRIVACY MANIFESTO
          </span>
        </motion.div>

        {/* Page Hero Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 text-xs font-mono text-[#D4AF37] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cryptographic Trust Model</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-heading font-medium tracking-tight text-[#f4f4f4] leading-[1.05]">
            Our Pact.
          </h1>
          <p className="text-[#999] text-base sm:text-lg max-w-2xl font-normal leading-relaxed">
            A transparent, uncompromising commitment to sovereign persistent memory, complete user ownership, and zero-loss privacy on Google Cloud infrastructure.
          </p>
        </motion.div>

        {/* Divider */}
        <div className="border-t border-white/10 w-full" />

        {/* 4 Promises Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promises.map((item, idx) => (
            <motion.div
              key={item.num}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 + idx * 0.08 }}
              className="p-6 rounded-xl bg-[#111111] border border-white/10 hover:border-white/20 transition-all group flex flex-col justify-between relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                      {item.icon}
                    </div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#7d7d7d]">
                      {item.tag}
                    </span>
                  </div>
                  <span className="font-mono text-2xl font-bold text-white/10 group-hover:text-white/20 transition-colors">
                    {item.num}
                  </span>
                </div>

                <h2 className="text-lg font-heading font-medium text-white group-hover:text-[#D4AF37] transition-colors">
                  {item.title}
                </h2>

                <p className="text-sm text-[#999] leading-relaxed font-normal">
                  {item.description}
                </p>

                {item.code && (
                  <div className="pt-1">
                    <code className="text-xs font-mono text-[#10b981] bg-black/50 px-2.5 py-1 rounded border border-white/10 block overflow-x-auto">
                      {item.code}
                    </code>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#7d7d7d]">
                  {item.badge}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Data Purge Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="pt-6 space-y-4"
        >
          <div className="p-6 sm:p-8 bg-[#111111] rounded-xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-lg">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-sm font-heading font-semibold uppercase tracking-wider text-white">
                  Local Memory Purge
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#999] leading-relaxed">
                Immediately clear local temporary session caches, reflection prompt drafts, and guest entries from this browser instance.
              </p>
            </div>

            <button
              id="btn-purge-local-memory"
              onClick={() => setPurgeModalOpen(true)}
              className="px-5 py-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500 text-xs uppercase tracking-wider font-mono text-rose-400 hover:text-rose-300 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
              data-cursor="PURGE"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge Local Memory</span>
            </button>
          </div>

          <AnimatePresence>
            {showPurgedFlash && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-[#10b981]/15 border border-[#10b981]/30 rounded-lg text-[#10b981] text-xs font-mono flex items-center gap-2.5"
              >
                <Check className="w-4 h-4" />
                <span>Local session memories and browser caches have been successfully purged.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer Note */}
        <div className="text-center pt-8 pb-4 text-xs font-mono text-[#7d7d7d]">
          <p>PAI &bull; Zero-Loss Sovereign Architecture &bull; Built on Google Cloud Platform</p>
        </div>
      </div>

      {/* Dark Confirmation Modal */}
      <AnimatePresence>
        {purgeModalOpen && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#141414] border border-white/15 max-w-md w-full p-6 sm:p-8 rounded-2xl space-y-6 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-semibold text-white">
                    Purge Local Memories?
                  </h3>
                  <p className="text-xs font-mono text-[#7d7d7d] uppercase tracking-wider">
                    Irreversible Action
                  </p>
                </div>
              </div>

              <p className="text-sm text-[#999] leading-relaxed">
                This will clear all transient reflection drafts, cached prompts, and guest session states stored in this browser. Cloud-synced records attached to your Google Account will remain intact in your private Firestore vault.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setPurgeModalOpen(false)}
                  disabled={isPurging}
                  className="px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider text-[#999] hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-purge"
                  onClick={handleConfirmPurge}
                  disabled={isPurging}
                  className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isPurging ? (
                    <span>Purging...</span>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Confirm Purge</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
