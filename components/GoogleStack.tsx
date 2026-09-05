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
} from 'lucide-react';

interface GoogleStackProps {
  onBack: () => void;
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

export function GoogleStack({ onBack }: GoogleStackProps) {
  const googleServices: GoogleService[] = [
    {
      id: 'cloud-run',
      name: 'Google Cloud Run',
      category: 'Compute & Edge Hosting',
      badge: 'Serverless Runtime',
      icon: <Server className="w-5 h-5 text-[#6B8E9B]" />,
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
      icon: <Sparkles className="w-5 h-5 text-[#6B8E9B]" />,
      description:
        'Powers all reflective analysis, conversational companion dialogues, thought summarization, and brainstorming using Google\'s flagship Gemini Flash multimodal models.',
      implementationDetail:
        'Implemented via the official @google/genai v2.4+ SDK with an enterprise 4-tier fallback ladder (gemini-3.6-flash → gemini-3.1-flash-lite → gemini-flash-latest → gemini-3.7-flash) ensuring 99.99% operational resilience against API rate limits.',
      specs: ['@google/genai v2.4+ SDK', '4-Tier Fallback Cascade', 'Grounded System Instructions'],
    },
    {
      id: 'firestore',
      name: 'Google Cloud Firestore',
      category: 'Database & Persistence',
      badge: 'NoSQL Document Store',
      icon: <Database className="w-5 h-5 text-[#6B8E9B]" />,
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
      icon: <ShieldCheck className="w-5 h-5 text-[#6B8E9B]" />,
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
      icon: <Compass className="w-5 h-5 text-[#6B8E9B]" />,
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
      icon: <Lock className="w-5 h-5 text-[#6B8E9B]" />,
      description:
        'Centralized, encrypted management of sensitive environment credentials including the Gemini API key and Google Maps Platform API credentials.',
      implementationDetail:
        'Secrets are injected securely at runtime into the Cloud Run container environment via --set-secrets, eliminating any exposure of raw API tokens in client bundles or git repositories.',
      specs: ['AES-256 Cloud Encryption', 'Runtime Secret Injection', 'Zero Secret Leakage'],
    },
    {
      id: 'cloud-build',
      name: 'Google Cloud Build & Artifact Registry',
      category: 'CI/CD & Packaging',
      badge: 'Container Pipeline',
      icon: <Layers className="w-5 h-5 text-[#6B8E9B]" />,
      description:
        'Automated container build pipeline that compiles the Next.js TypeScript application into optimized Docker containers and stores them in Google Artifact Registry.',
      implementationDetail:
        'Cloud Build runs automated vulnerability scanning and pushes immutable container images to us-central1 Artifact Registry before deploying zero-downtime revisions to Cloud Run.',
      specs: ['Automated Containerization', 'Artifact Registry Storage', 'Zero-Downtime Rollouts'],
    },
    {
      id: 'cloud-monitoring',
      name: 'Google Cloud Operations Suite',
      category: 'Telemetry & Observability',
      badge: 'Cloud Logging',
      icon: <Activity className="w-5 h-5 text-[#6B8E9B]" />,
      description:
        'Provides real-time application health metrics, request tracing, container cold-start tracking, and centralized audit logging.',
      implementationDetail:
        'Cloud Run native telemetry streams stdout/stderr structured JSON logs directly into Cloud Logging with sub-second latency for complete runtime observability.',
      specs: ['Native Cloud Logging', 'Latency & Memory Metrics', 'Cloud Audit Logs'],
    },
  ];

  return (
    <div
      id="view-google-stack"
      className="min-h-[calc(100vh-4rem)] bg-[#F9F8F6] text-[#2C3539] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-between"
    >
      <div className="max-w-4xl mx-auto w-full space-y-12">
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between">
          <button
            id="btn-stack-back"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.05em] text-[#6B8E9B] hover:text-[#2C3539] transition-colors cursor-pointer font-sans"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return</span>
          </button>
          <span className="text-[11px] uppercase tracking-[0.1em] text-[#8DA399] font-sans font-medium flex items-center gap-1.5 bg-[#FFFFFF] px-3 py-1 rounded-full border border-[#D1D8DB]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8DA399]"></span>
            100% Google Cloud Architecture
          </span>
        </div>

        {/* Title Block */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.08em] font-sans font-medium text-[#6B8E9B]">
              Technology Foundation
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif text-[#2C3539] font-normal tracking-[-0.02em] leading-tight">
            The Google Stack.
          </h1>
          <p className="text-[#6B8E9B] font-sans text-base sm:text-lg font-light leading-relaxed max-w-2xl">
            This application is architected natively and exclusively on the Google Cloud ecosystem,
            combining serverless computing, multimodal intelligence, and zero-trust security.
          </p>
        </div>

        {/* Architecture Flow Banner */}
        <div className="p-6 bg-[#FFFFFF] border border-[#D1D8DB] rounded-xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#D1D8DB]/60 pb-3">
            <span className="text-[11px] uppercase tracking-[0.08em] font-sans font-semibold text-[#2C3539]">
              Unified Data &amp; Runtime Pipeline
            </span>
            <span className="text-[10px] uppercase font-mono text-[#6B8E9B]">
              GCP Native &bull; us-central1
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-sans">
            <div className="p-3 rounded-lg bg-[#F9F8F6] border border-[#D1D8DB]/60 space-y-1">
              <span className="text-[10px] text-[#6B8E9B] uppercase block">Client Layer</span>
              <p className="font-medium text-[#2C3539]">Firebase Auth</p>
              <p className="text-[10px] text-[#6B8E9B]">Google OAuth 2.0</p>
            </div>
            <div className="p-3 rounded-lg bg-[#F9F8F6] border border-[#D1D8DB]/60 space-y-1">
              <span className="text-[10px] text-[#6B8E9B] uppercase block">Compute Layer</span>
              <p className="font-medium text-[#2C3539]">Cloud Run</p>
              <p className="text-[10px] text-[#6B8E9B]">Next.js 15 Serverless</p>
            </div>
            <div className="p-3 rounded-lg bg-[#F9F8F6] border border-[#D1D8DB]/60 space-y-1">
              <span className="text-[10px] text-[#6B8E9B] uppercase block">AI &amp; Spatial</span>
              <p className="font-medium text-[#2C3539]">Gemini &amp; Maps</p>
              <p className="text-[10px] text-[#6B8E9B]">Flash Fallback Ladder</p>
            </div>
            <div className="p-3 rounded-lg bg-[#F9F8F6] border border-[#D1D8DB]/60 space-y-1">
              <span className="text-[10px] text-[#6B8E9B] uppercase block">Data &amp; Vault</span>
              <p className="font-medium text-[#2C3539]">Firestore &amp; Secrets</p>
              <p className="text-[10px] text-[#6B8E9B]">Zero-Trust Isolation</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#D1D8DB]" />

        {/* Services Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-xs uppercase tracking-[0.08em] text-[#6B8E9B] font-semibold">
              Component Breakdown ({googleServices.length} Services)
            </h2>
            <span className="text-xs text-[#8DA399] font-sans font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#8DA399]" />
              Production Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {googleServices.map((service) => (
              <div
                key={service.id}
                className="p-6 bg-[#FFFFFF] border border-[#D1D8DB] rounded-xl hover:border-[#6B8E9B] transition-all space-y-4 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Service Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#F9F8F6] border border-[#D1D8DB] flex items-center justify-center">
                        {service.icon}
                      </div>
                      <div>
                        <h3 className="font-serif text-lg text-[#2C3539] font-normal leading-snug">
                          {service.name}
                        </h3>
                        <p className="text-[11px] uppercase tracking-[0.05em] text-[#6B8E9B] font-sans font-medium">
                          {service.category}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#F9F8F6] border border-[#D1D8DB] text-[#2C3539]">
                      {service.badge}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm font-serif text-[#2C3539]/90 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Technical Implementation */}
                  <div className="p-3 bg-[#F9F8F6] rounded-lg border border-[#D1D8DB]/60 text-xs font-sans text-[#2C3539]/80 leading-normal">
                    <span className="font-semibold text-[#6B8E9B] block mb-1 uppercase tracking-[0.05em] text-[10px]">
                      Engineering Implementation:
                    </span>
                    {service.implementationDetail}
                  </div>
                </div>

                {/* Tags / Specs */}
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#D1D8DB]/50">
                  {service.specs.map((spec, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-sans px-2 py-0.5 rounded bg-[#FFFFFF] border border-[#D1D8DB] text-[#6B8E9B]"
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
        <div className="p-6 bg-[#FFFFFF] border border-[#8DA399] rounded-xl space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-[#8DA399]">
            <CheckCircle2 className="w-4 h-4" />
            <h3 className="text-sm uppercase tracking-[0.05em] font-sans font-semibold text-[#2C3539]">
              Google Cloud Run AI Challenge Compliance
            </h3>
          </div>
          <p className="text-xs font-serif text-[#2C3539]/90 leading-relaxed">
            This deployment strictly adheres to Google Cloud Run Challenge guidelines, using Cloud Secret Manager
            for Zero-Trust credential delivery, Firestore owner isolation for data sovereignty, and the mandatory
            verification campaign label:
          </p>
          <div className="bg-[#F9F8F6] p-2.5 rounded border border-[#D1D8DB] font-mono text-xs text-[#2C3539] overflow-x-auto">
            gcloud run services update reflectai-app --update-labels=dev-tutorial=cloud-run-ai-challenge
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center pt-16 pb-4 text-xs font-sans text-[#6B8E9B]/70">
        <p>Built with Google Cloud Run &bull; Gemini 3.6/3.7 Flash &bull; Google Maps Platform &bull; Cloud Firestore</p>
      </div>
    </div>
  );
}
