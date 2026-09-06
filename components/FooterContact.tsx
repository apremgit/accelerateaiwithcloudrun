'use client';

import React from 'react';
import { ArrowUp, Github, Mail, ArrowUpRight } from 'lucide-react';

interface FooterContactProps {
  onOpenPrivacy: () => void;
  onOpenPreferences: () => void;
}

export function FooterContact({ onOpenPrivacy, onOpenPreferences }: FooterContactProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      id="contact"
      className="bg-[#0a0a0a] border-t border-white/[0.06]"
    >
      {/* Giant CTA Section */}
      <div className="py-[var(--spacing-section)] px-[var(--spacing-page-x)]">
        <div className="max-w-[1400px] mx-auto text-center">
          <h2 className="font-heading text-[#f4f4f4] mb-6" style={{
            fontSize: 'clamp(2rem, 5vw, 4.5rem)',
            lineHeight: 0.95,
            letterSpacing: '-0.03em',
            fontWeight: 500,
          }}>
            LET&apos;S DISCUSS
            <br />
            ARCHITECTURE &amp; ROLES
          </h2>
          <p className="text-[#999] text-base max-w-2xl mx-auto leading-relaxed mb-10 font-light">
            Avula Prem Kumar &bull; Architect &amp; Developer specializing in enterprise Cloud Run, multimodal Gemini reasoning, and sovereign memory architectures. Actively open for Solutions Architect and Cloud/AI Platform Engineering technical interviews.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="mailto:avulapremkumarnaidu@gmail.com?subject=Interview%20%26%20Opportunity%20Discussion%20-%20Avula%20Prem%20Kumar"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#f4f4f4] text-[#0a0a0a] text-sm font-medium hover:bg-[#D4AF37] transition-colors cursor-pointer shadow-lg"
              data-cursor="EMAIL"
            >
              <Mail className="w-4 h-4 text-[#0a0a0a]" />
              <span>Contact via Gmail</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://github.com/apremgit/accelerateaiwithcloudrun"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/[0.15] text-[#f4f4f4] text-sm hover:border-white/[0.3] hover:text-[#D4AF37] transition-colors cursor-pointer"
              data-cursor="GITHUB"
            >
              <Github className="w-4 h-4" />
              <span>Explore GitHub Repository</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/[0.06] px-[var(--spacing-page-x)] py-6">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Branding */}
          <div className="flex items-center gap-3 text-[11px] font-mono text-[#7d7d7d]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            <span>PAI</span>
            <span className="text-white/[0.15]">·</span>
            <span>Architected by Avula Prem Kumar (@apremgit)</span>
            <span className="text-white/[0.15]">·</span>
            <span>Cloud Run &bull; Gemini 2.5 &bull; Firestore</span>
          </div>

          {/* Center: Footer Links */}
          <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.06em] text-[#7d7d7d]">
            <button
              onClick={onOpenPrivacy}
              className="hover:text-[#f4f4f4] transition-colors cursor-pointer"
            >
              Privacy
            </button>
            <span className="text-white/[0.1]">·</span>
            <button
              onClick={onOpenPreferences}
              className="hover:text-[#f4f4f4] transition-colors cursor-pointer"
            >
              Preferences
            </button>
            <span className="text-white/[0.1]">·</span>
            <span className="text-[#555]">© 2026</span>
          </div>

          {/* Right: Back to Top */}
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-[11px] uppercase tracking-[0.06em] text-[#7d7d7d] hover:text-[#f4f4f4] transition-colors cursor-pointer group"
            data-cursor="TOP"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  );
}
