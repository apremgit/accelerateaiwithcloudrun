'use client';

import React, { useState } from 'react';
import { signInWithGoogle } from '@/lib/firebase';
import { ArrowRight, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onSignedIn?: () => void;
  onBeginReflection?: (initialThought: string) => void;
  onNavigateToPrivacy?: () => void;
  onNavigateToPreferences?: () => void;
  onNavigateToStack?: () => void;
}

export function LandingPage({
  onSignedIn,
  onBeginReflection,
  onNavigateToPrivacy,
  onNavigateToPreferences,
  onNavigateToStack,
}: LandingPageProps) {
  const [initialThought, setInitialThought] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!initialThought.trim() && !authLoading) return;

    setIsSubmitting(true);
    setTimeout(() => {
      if (onBeginReflection) {
        onBeginReflection(initialThought.trim());
      }
    }, 400);
  };

  const handleSignIn = async () => {
    setAuthLoading(true);
    setErrorMsg(null);
    try {
      const { user, error } = await signInWithGoogle();
      if (error) {
        setErrorMsg(error);
      } else if (user && onSignedIn) {
        onSignedIn();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div
      id="view-landing-page"
      className={`min-h-[calc(100vh-4.5rem)] flex flex-col justify-between bg-[#F9F8F6] text-[#2C3539] transition-all duration-700 ${
        isSubmitting ? 'opacity-50 -translate-y-4' : 'opacity-100 translate-y-0'
      }`}
    >
      {/* Centered Sanctuary Introduction (Maximum Negative Space) */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-8 py-16 max-w-2xl mx-auto w-full text-center">
        {/* Slow-breathing welcome prompt */}
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.1em] text-[#8DA399] font-sans font-medium animate-pulse">
            What&apos;s on your mind today?
          </p>
        </div>

        {/* Hero Title: Lora, 48px, #2C3539 */}
        <h1 className="text-4xl sm:text-5xl lg:text-[48px] font-serif text-[#2C3539] font-normal tracking-[-0.02em] leading-tight mb-4">
          A quiet corner of the internet.
        </h1>

        {/* Subtitle: Albert Sans, 18px, #6B8E9B */}
        <p className="text-base sm:text-lg text-[#6B8E9B] font-sans font-light max-w-lg mx-auto leading-relaxed mb-12">
          Your private sounding board for untangling complex thoughts.
        </p>

        {/* Entry Input: width: 480px, floating underline, border-bottom: 1px solid #D1D8DB */}
        <form onSubmit={handleSubmit} className="w-full max-w-[480px] space-y-6">
          <div className="relative group">
            <input
              id="input-landing-thought"
              type="text"
              value={initialThought}
              onChange={(e) => setInitialThought(e.target.value)}
              placeholder="Begin typing..."
              className="w-full bg-transparent border-b border-[#D1D8DB] group-hover:border-[#6B8E9B] focus:border-[#6B8E9B] pb-3 text-lg font-serif text-[#2C3539] placeholder-[#D1D8DB] outline-hidden transition-colors duration-300 text-center sm:text-left"
              autoFocus
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {initialThought.trim() ? (
              <button
                id="btn-begin-reflection"
                type="submit"
                className="w-full sm:w-auto px-8 py-3 rounded bg-[#6B8E9B] hover:opacity-90 active:scale-[0.99] text-white text-xs font-sans uppercase tracking-[0.05em] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Begin Reflection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                id="btn-enter-sanctuary"
                type="button"
                onClick={() => {
                  if (onBeginReflection) onBeginReflection('');
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded border border-[#D1D8DB] hover:border-[#6B8E9B] text-[#2C3539] hover:text-[#6B8E9B] text-xs font-sans uppercase tracking-[0.05em] transition-all cursor-pointer"
              >
                Enter Sanctuary
              </button>
            )}

            {/* Quick Google Sign In */}
            <button
              id="btn-google-auth-landing"
              type="button"
              onClick={handleSignIn}
              disabled={authLoading}
              className="w-full sm:w-auto px-5 py-2.5 rounded bg-white border border-[#D1D8DB] hover:border-[#6B8E9B] text-[#2C3539] text-xs font-sans uppercase tracking-[0.05em] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {authLoading ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign In</span>
                </>
              )}
            </button>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-600 font-sans">{errorMsg}</p>
          )}
        </form>
      </div>

      {/* Footer Links: Bottom, 13px, #D1D8DB, links to Privacy and Preferences */}
      <footer className="border-t border-[#D1D8DB]/60 py-6 px-8 flex flex-col sm:flex-row items-center justify-between text-[13px] font-sans text-[#6B8E9B] gap-4">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8DA399]"></span>
          <span className="text-xs text-[#2C3539] font-serif italic">Serene Minimalist AI</span>
        </div>

        <div className="flex items-center gap-6 text-xs uppercase tracking-[0.05em]">
          <button
            id="link-footer-privacy"
            onClick={onNavigateToPrivacy}
            className="hover:text-[#2C3539] transition-colors cursor-pointer"
          >
            Our Pact (Privacy)
          </button>
          <span className="text-[#D1D8DB]">&bull;</span>
          <button
            id="link-footer-preferences"
            onClick={onNavigateToPreferences}
            className="hover:text-[#2C3539] transition-colors cursor-pointer"
          >
            Preferences
          </button>
          {onNavigateToStack && (
            <>
              <span className="text-[#D1D8DB]">&bull;</span>
              <button
                id="link-footer-stack"
                onClick={onNavigateToStack}
                className="hover:text-[#2C3539] transition-colors cursor-pointer"
              >
                Google Stack
              </button>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}

