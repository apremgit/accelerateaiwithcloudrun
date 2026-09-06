'use client';

import React from 'react';
import { ArrowUpRight, Mail, Github } from 'lucide-react';

interface AboutSectionProps {
  onOpenStack: () => void;
}

const TECH_STACK = [
  { name: 'Google Cloud Run', desc: 'Serverless scale-to-zero compute', color: '#10b981' },
  { name: 'Gemini API & AI Studio', desc: 'Multimodal cognitive reasoning', color: '#3b82f6' },
  { name: 'Cloud Firestore', desc: 'Zero-trust sovereign memory', color: '#8b5cf6' },
  { name: 'Google Maps Platform', desc: 'Spatial intelligence grounding', color: '#f59e0b' },
  { name: 'BigQuery Vector Search', desc: 'Lifetime skill embeddings & RAG', color: '#ec4899' },
  { name: 'Firebase Auth', desc: 'OAuth 2.0 identity boundary', color: '#f97316' },
];

export function AboutSection({ onOpenStack }: AboutSectionProps) {
  return (
    <section
      id="about"
      className="bg-[#0a0a0a] py-[var(--spacing-section)] px-[var(--spacing-page-x)]"
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Section Label */}
        <div className="flex items-center gap-3 mb-16">
          <span className="text-[11px] uppercase tracking-[0.08em] font-mono text-[#7d7d7d]">
            About
          </span>
          <div className="flex-1 h-px bg-[var(--color-divider)]" />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left: Project Description */}
          <div>
            <h2 className="text-display-section font-heading text-[#f4f4f4] mb-8">
              Accelerate AI
              <br />
              with Cloud Run
            </h2>
            <p className="text-[#999] text-base leading-relaxed mb-6">
              PAI (Personal AI Companion) is a zero-loss persistent memory — a sovereign
              cognitive layer that resurfaces your deep work state, active coding logic, culinary
              recipes, and spatial journeys. You may forget, but your AI can&apos;t.
            </p>
            <p className="text-[#999] text-base leading-relaxed mb-6">
              Built for the &ldquo;Accelerate AI with Cloud Run&rdquo; hackathon, PAI demonstrates
              28 production-grade Google Cloud architecture blueprints across identity sovereignty,
              reasoning engines, vector RAG pipelines, and spatial integrations.
            </p>
            <p className="text-[#7d7d7d] text-sm leading-relaxed mb-8">
              Every reflection is owner-bound via Firestore Security Rules, reasoned through Gemini&apos;s
              multi-turn orchestration, and grounded in real-world geography via Google Maps Platform.
            </p>

            {/* Developer Profile Card */}
            <div className="border-l-2 border-[#D4AF37] pl-6 py-2 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[11px] uppercase tracking-[0.08em] text-[#D4AF37] font-mono font-semibold">
                  Architect &amp; Developer
                </p>
              </div>

              <p className="text-[#f4f4f4] text-xl font-heading font-medium">
                Avula Prem Kumar
              </p>

              <p className="text-[#999] text-sm leading-relaxed">
                Full-stack Cloud &amp; AI Engineer specializing in Google Cloud Run, Gemini multimodal reasoning, vector RAG memory systems, and sovereign data architectures.
              </p>

              <p className="text-[#7d7d7d] text-xs leading-relaxed font-sans">
                Architected PAI with 28 production-grade blueprints to demonstrate end-to-end engineering rigor across serverless computing, multimodal intelligence, and zero-trust security. Open to engineering and solutions architecture opportunities.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono">
                <a
                  href="mailto:avulapremkumarnaidu@gmail.com?subject=Interview%20%26%20Opportunity%20Discussion%20-%20Avula%20Prem%20Kumar"
                  className="text-[#D4AF37] hover:underline inline-flex items-center gap-1.5 transition-colors"
                  data-cursor="EMAIL"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>avulapremkumarnaidu@gmail.com</span>
                </a>
                <a
                  href="https://github.com/apremgit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#7d7d7d] hover:text-[#f4f4f4] inline-flex items-center gap-1.5 transition-colors"
                  data-cursor="GITHUB"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>github.com/apremgit</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right: Tech Stack + Architectural Pillars */}
          <div>
            {/* Tech Stack */}
            <div className="mb-12">
              <h3 className="text-[11px] uppercase tracking-[0.08em] font-mono text-[#7d7d7d] mb-6">
                Core Technology Stack
              </h3>
              <div className="space-y-0">
                {TECH_STACK.map((tech) => (
                  <div
                    key={tech.name}
                    className="flex items-center gap-4 py-4 border-t border-white/[0.06] group"
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: tech.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[#f4f4f4] text-sm font-medium">{tech.name}</p>
                      <p className="text-[#7d7d7d] text-xs mt-0.5">{tech.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={onOpenStack}
                className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-[#7d7d7d] hover:text-[#f4f4f4] transition-colors cursor-pointer group"
                data-cursor="STACK"
              >
                <span>View Full Architecture Docs</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>

            {/* Architectural Pillars & Engineering Domains */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] uppercase tracking-[0.08em] font-mono text-[#7d7d7d]">
                  Architectural Pillars &amp; Disciplines
                </h3>
                <span className="text-[10px] font-mono text-[#10b981] uppercase tracking-wider">
                  28 Blueprints Built
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3.5 rounded-lg border border-white/[0.08] bg-white/[0.02] space-y-1">
                  <p className="text-[#f4f4f4] text-xs font-medium">Identity &amp; Sovereignty</p>
                  <p className="text-[#7d7d7d] text-[11px] leading-snug">Zero-trust owner-bound security &amp; secret isolation</p>
                </div>
                <div className="p-3.5 rounded-lg border border-white/[0.08] bg-white/[0.02] space-y-1">
                  <p className="text-[#f4f4f4] text-xs font-medium">Reasoning Engine</p>
                  <p className="text-[#7d7d7d] text-[11px] leading-snug">4-tier Gemini fallback &amp; SSE streaming pipeline</p>
                </div>
                <div className="p-3.5 rounded-lg border border-white/[0.08] bg-white/[0.02] space-y-1">
                  <p className="text-[#f4f4f4] text-xs font-medium">Vector RAG Memory</p>
                  <p className="text-[#7d7d7d] text-[11px] leading-snug">BigQuery Vector Search &amp; lifetime skill embeddings</p>
                </div>
                <div className="p-3.5 rounded-lg border border-white/[0.08] bg-white/[0.02] space-y-1">
                  <p className="text-[#f4f4f4] text-xs font-medium">Spatial Grounding</p>
                  <p className="text-[#7d7d7d] text-[11px] leading-snug">Google Maps Places (New) &amp; Routes API real-time grounding</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
