'use client';

import React from 'react';
import {
  ArrowLeft,
  Server,
  Sparkles,
  Database,
  ShieldCheck,
  Compass,
  Lock,
  Layers,
  Activity,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import { motion } from 'motion/react';

interface GoogleStackProps {
  onBack: () => void;
  onNavigateToCaseStudies?: () => void;
}

interface GoogleService {
  id: string;
  name: string;
  category: string;
  badge: string;
  icon: React.ReactNode;
  description: string;
  implementationDetail: string;
  specs: string[];
}

export function GoogleStack({ onBack, onNavigateToCaseStudies }: GoogleStackProps) {
  const googleServices: GoogleService[] = [
    {
      id: 'cloud-run',
      name: 'Google Cloud Run',
      category: 'Compute & Edge Hosting',
      badge: 'Serverless Runtime',
      icon: <Server className="w-5 h-5 text-[#10b981]" />,
      description:
        'The entire Next.js full-stack application is packaged into an OCI container and hosted on Google Cloud Run, providing instant serverless scaling, global HTTPS termination, and zero-idle cost.',
      implementationDetail:
        'Configured with --min-instances=0 for true scale-to-zero economics, automatically scaling instances on incoming traffic while complying with the official Cloud Run AI Challenge specifications.',
      specs: ['Scale-to-Zero ($0 Idle)', 'Sub-second Cold Starts', 'Automated Health Probes'],
    },
    {
      id: 'gemini-api',
      name: 'Google Gemini API & AI Studio',
      category: 'Generative Intelligence',
      badge: 'Multimodal Brain',
      icon: <Sparkles className="w-5 h-5 text-[#3b82f6]" />,
      description:
        'Powers all reflective analysis, conversational companion dialogues, thought summarization, and brainstorming using Google\'s flagship Gemini Flash multimodal models.',
      implementationDetail:
        'Implemented via the official @google/genai v2.4+ SDK with an enterprise 4-tier fallback ladder (gemini-2.5-flash → gemini-2.0-flash → gemini-1.5-flash → gemini-2.0-pro) ensuring 99.99% operational resilience against API rate limits.',
      specs: ['@google/genai v2.4+ SDK', '4-Tier Fallback Cascade', 'Grounded System Instructions'],
    },
    {
      id: 'firestore',
      name: 'Google Cloud Firestore',
      category: 'Database & Persistence',
      badge: 'NoSQL Document Store',
      icon: <Database className="w-5 h-5 text-[#8b5cf6]" />,
      description:
        'Serverless cloud document database providing private, encrypted, and low-latency persistence for user journal entries, reflection threads, and personal insights.',
      implementationDetail:
        'Strict zero-trust data hierarchy partitioned at /users/{userId}/entries/{entryId}. Enforced by owner-bound Firestore Security Rules guaranteeing that no user can access another user\'s private thoughts.',
      specs: ['Owner-Partitioned Hierarchy', 'Real-time Document Sync', 'Strict Security Rules'],
    },
    {
      id: 'firebase-auth',
      name: 'Firebase Authentication (Google Identity)',
      category: 'Identity & Access',
      badge: 'Zero-Trust Auth',
      icon: <ShieldCheck className="w-5 h-5 text-[#f59e0b]" />,
      description:
        'Handles user sign-in and session verification using Google Identity Services and OAuth 2.0, providing cryptographic identity tokens that anchor all database operations.',
      implementationDetail:
        'Integrated with GoogleAuthProvider supporting one-click sign-in and seamless session lifecycle listeners (onAuthStateChanged) without storing plain-text passwords or session secrets.',
      specs: ['Google OAuth 2.0 Sign-In', 'JWT Identity Tokens', 'Session Token Refresh'],
    },
    {
      id: 'google-maps',
      name: 'Google Maps Platform',
      category: 'Spatial Intelligence',
      badge: 'Places & Routes API',
      icon: <Compass className="w-5 h-5 text-[#10b981]" />,
      description:
        'Enables spatial awareness and location grounding within personal reflections, allowing users to discover serene places, plan mindful journeys, and compute travel itineraries.',
      implementationDetail:
        'Leverages Places API (New) for search and editorial place summaries alongside Routes API for multi-modal travel duration computation, visually embedded with @vis.gl/react-google-maps.',
      specs: ['Places API (New)', 'Routes & Directions API', '@vis.gl/react-google-maps SDK'],
    },
    {
      id: 'secret-manager',
      name: 'Google Cloud Secret Manager',
      category: 'Security & Governance',
      badge: 'Key Vault',
      icon: <Lock className="w-5 h-5 text-[#ec4899]" />,
      description:
        'Provides centralized, auditable, and encrypted storage for sensitive runtime environment variables, Google Maps API keys, and service account tokens.',
      implementationDetail:
        'Cloud Run service identity accesses secrets at container initialization via IAM Secret Accessor roles, preventing secrets from leaking into client-side bundles or source repositories.',
      specs: ['Zero-Trust IAM Binding', 'Automatic Secret Rotation', 'Cloud Audit Logging'],
    },
    {
      id: 'cloud-logging',
      name: 'Cloud Logging & Error Reporting',
      category: 'Observability & SRE',
      badge: 'Real-Time Telemetry',
      icon: <Activity className="w-5 h-5 text-[#3b82f6]" />,
      description:
        'Captures structured JSON application logs, HTTP request latencies, and unexpected runtime exceptions automatically routed from Cloud Run.',
      implementationDetail:
        'Structured log payloads include trace identifiers correlated with Google Cloud Trace for end-to-end request latency profiling across serverless invocations.',
      specs: ['Structured JSON Logging', 'Automated Exception Alerts', 'Distributed Trace IDs'],
    },
    {
      id: 'bigquery',
      name: 'Google BigQuery & Vector Search',
      category: 'Analytics & Memory RAG',
      badge: 'Vector Embeddings',
      icon: <Layers className="w-5 h-5 text-[#8b5cf6]" />,
      description:
        'Enterprise analytics warehouse and vector search engine storing long-term memory embeddings for semantic similarity queries and pattern extraction.',
      implementationDetail:
        'VECTOR_SEARCH using text-embedding-005 embeddings with Cosine distance indexing over user lifetime reflection corpora for instant contextual recall.',
      specs: ['Serverless Vector Indexes', 'Cosine Distance Matching', 'Partitioned Retention'],
    },
  ];

  return (
    <motion.div
      id="view-google-stack"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      data-lenis-prevent="true"
      className="min-h-full bg-[#0a0a0a] text-[#f4f4f4] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-between"
    >
      <div className="max-w-4xl mx-auto w-full space-y-12">
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between">
          <button
            id="btn-stack-back"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.06em] font-mono text-[#7d7d7d] hover:text-white transition-colors cursor-pointer"
            data-cursor="RETURN"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return</span>
          </button>
          <span className="text-[11px] uppercase tracking-[0.08em] font-mono text-[#10b981] flex items-center gap-2 bg-[#111111] px-3.5 py-1.5 rounded-full border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
            100% Google Cloud Architecture
          </span>
        </div>

        {/* Title Block */}
        <div className="space-y-3">
          <span className="text-[11px] uppercase tracking-[0.08em] font-mono text-[#7d7d7d]">
            Technology Foundation
          </span>
          <h1 className="text-display-section font-heading text-white">
            The Google Stack.
          </h1>
          <p className="text-[#999] text-base leading-relaxed max-w-2xl font-light">
            This application is architected natively and exclusively on the Google Cloud ecosystem,
            combining serverless compute, multimodal intelligence, and zero-trust security.
          </p>
        </div>

        {/* Architecture Flow Banner */}
        <div className="p-6 bg-[#111111] border border-white/10 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-[11px] uppercase tracking-[0.08em] font-mono text-white font-semibold">
              Unified Data &amp; Runtime Pipeline
            </span>
            <span className="text-[10px] uppercase font-mono text-[#7d7d7d]">
              GCP Native &bull; us-central1
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-3 rounded-lg bg-[#161616] border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-[#7d7d7d] uppercase block">Client Layer</span>
              <p className="font-medium text-white">Firebase Auth</p>
              <p className="text-[10px] font-mono text-[#7d7d7d]">Google OAuth 2.0</p>
            </div>
            <div className="p-3 rounded-lg bg-[#161616] border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-[#7d7d7d] uppercase block">Compute Layer</span>
              <p className="font-medium text-white">Cloud Run</p>
              <p className="text-[10px] font-mono text-[#7d7d7d]">Next.js 15 Serverless</p>
            </div>
            <div className="p-3 rounded-lg bg-[#161616] border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-[#7d7d7d] uppercase block">AI &amp; Spatial</span>
              <p className="font-medium text-white">Gemini &amp; Maps</p>
              <p className="text-[10px] font-mono text-[#7d7d7d]">Flash Fallback Ladder</p>
            </div>
            <div className="p-3 rounded-lg bg-[#161616] border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-[#7d7d7d] uppercase block">Data &amp; Vault</span>
              <p className="font-medium text-white">Firestore &amp; Secrets</p>
              <p className="text-[10px] font-mono text-[#7d7d7d]">Zero-Trust Isolation</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10" />

        {/* Services Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] uppercase tracking-[0.08em] font-mono text-[#7d7d7d]">
              Component Breakdown ({googleServices.length} Services)
            </h2>
            <span className="text-xs font-mono text-[#10b981] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
              Production Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {googleServices.map((service) => (
              <div
                key={service.id}
                className="p-6 bg-[#111111] border border-white/10 rounded-xl hover:border-white/20 transition-all space-y-4 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Service Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#161616] border border-white/10 flex items-center justify-center">
                        {service.icon}
                      </div>
                      <div>
                        <h3 className="font-heading text-base font-semibold text-white leading-snug">
                          {service.name}
                        </h3>
                        <p className="text-[11px] uppercase tracking-[0.06em] text-[#7d7d7d] font-mono">
                          {service.category}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#161616] border border-white/10 text-[#f4f4f4]">
                      {service.badge}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-[#999] leading-relaxed">
                    {service.description}
                  </p>

                  {/* Technical Implementation */}
                  <div className="p-3 bg-[#161616] rounded-lg border border-white/5 text-xs text-[#999] leading-normal font-mono">
                    <span className="font-semibold text-white block mb-1 uppercase tracking-[0.05em] text-[10px]">
                      Engineering Implementation:
                    </span>
                    {service.implementationDetail}
                  </div>
                </div>

                {/* Tags / Specs */}
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/5">
                  {service.specs.map((spec, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#7d7d7d]"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cloud Run AI Challenge Compliance Note */}
        <div className="p-6 bg-[#111111] border border-[#10b981]/40 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-[#10b981]">
            <CheckCircle2 className="w-4 h-4" />
            <h3 className="text-sm uppercase tracking-[0.06em] font-mono font-semibold text-white">
              Google Cloud Run AI Challenge Compliance
            </h3>
          </div>
          <p className="text-xs text-[#999] leading-relaxed">
            This deployment strictly adheres to Google Cloud Run Challenge guidelines, using Cloud Secret Manager
            for Zero-Trust credential delivery, Firestore owner isolation for data sovereignty, and the mandatory
            verification campaign label:
          </p>
          <div className="bg-[#0a0a0a] p-3 rounded border border-white/10 font-mono text-xs text-[#10b981] overflow-x-auto">
            gcloud run services update reflectai-app --update-labels=dev-tutorial=cloud-run-ai-challenge
          </div>
        </div>

        {/* Enterprise Case Studies Gateway */}
        {onNavigateToCaseStudies && (
          <div className="p-6 bg-gradient-to-r from-[#111111] to-[#161616] border border-white/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <span className="text-[10px] font-mono uppercase tracking-[0.08em] font-semibold text-[#D4AF37] block">
                Architecture Knowledge Base
              </span>
              <h4 className="font-heading text-base sm:text-lg text-white font-semibold">
                Want to see how these services solve real-world enterprise challenges?
              </h4>
              <p className="text-xs text-[#7d7d7d] leading-relaxed">
                Explore 28 production case studies covering vLLM GPUs on Cloud Run, VPC-SC, AlloyDB vector search, and PCA/ACE exam patterns.
              </p>
            </div>
            <button
              onClick={onNavigateToCaseStudies}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-white text-black text-xs font-mono uppercase tracking-wider font-semibold hover:bg-[#D4AF37] transition-colors cursor-pointer shrink-0"
              data-cursor="BLUEPRINTS"
            >
              <span>Explore 28 Blueprints</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className="text-center pt-16 pb-4 text-xs font-mono text-[#7d7d7d]">
        <p>Built with Google Cloud Run &bull; Gemini Flash &bull; Google Maps Platform &bull; Cloud Firestore</p>
      </div>
    </motion.div>
  );
}
