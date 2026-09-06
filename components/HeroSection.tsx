'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { signInWithGoogle } from '@/lib/firebase';

interface HeroSectionProps {
  onBeginReflection: (thought: string) => void;
  onSignedIn: () => void;
  onNavigateToCaseStudies: () => void;
}

export function HeroSection({
  onBeginReflection,
  onSignedIn,
  onNavigateToCaseStudies,
}: HeroSectionProps) {
  const [scrollOpacity, setScrollOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      // Reduce opacity to 0.3 at scrollY > 50vh
      const progress = Math.min(scrollY / (vh * 0.5), 1);
      setScrollOpacity(1 - progress * 0.7); // maps 1 down to 0.3
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      onSignedIn();
    } catch (error) {
      console.error('Sign in failed', error);
    }
  };

  const headingLines = [
    "PAI: THE COMPANION",
    "THAT NEVER FORGETS."
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const lineVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' as const }
    }
  };

  const contextChips = [
    { label: 'Culinary Notes', icon: '🍳' },
    { label: 'Coding State', icon: '💻' },
    { label: 'Spatial Journey', icon: '🗺️' },
    { label: 'Thought Log', icon: '🧠' }
  ];

  return (
    <section 
      className="relative w-full h-screen min-h-[800px] flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0a]"
      style={{ opacity: scrollOpacity }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <style>{`
          @keyframes float {
            0% { transform: translateY(0) translateX(0) rotate(0deg); }
            33% { transform: translateY(-30px) translateX(20px) rotate(10deg); }
            66% { transform: translateY(20px) translateX(-15px) rotate(-5deg); }
            100% { transform: translateY(0) translateX(0) rotate(0deg); }
          }
          @keyframes pulseGradient {
            0% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(1.2); }
            100% { opacity: 0.2; transform: scale(1); }
          }
          .animate-float-1 { animation: float 15s ease-in-out infinite; }
          .animate-float-2 { animation: float 18s ease-in-out infinite reverse; }
          .animate-float-3 { animation: float 20s ease-in-out infinite 2s; }
          .animate-pulse-grad { animation: pulseGradient 10s ease-in-out infinite; }
        `}</style>
        
        {/* Gradients */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#D4AF37]/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-grad"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#083D2A]/20 rounded-full blur-[100px] mix-blend-screen animate-pulse-grad" style={{ animationDelay: '2s' }}></div>
        
        {/* Geometric Shapes */}
        <div className="absolute top-1/3 right-1/3 w-32 h-32 border border-[#D4AF37]/20 rounded-full animate-float-1"></div>
        <div className="absolute bottom-1/3 left-1/4 w-48 h-48 border border-[#083D2A]/30 rotate-45 animate-float-2"></div>
        <div className="absolute top-1/2 left-2/3 w-24 h-24 border border-[#f4f4f4]/10 rounded-lg animate-float-3"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-start justify-center h-full">
        {/* System Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-[#D4AF37]/30 backdrop-blur-md mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
            PAI • ZERO-LOSS PERSISTENT MEMORY
          </span>
        </motion.div>

        {/* Giant Heading */}
        <motion.h1 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-[#f4f4f4] font-medium tracking-[-0.03em] flex flex-col"
          style={{ fontSize: 'clamp(3rem, 7vw, 8.5rem)', lineHeight: 0.92 }}
        >
          {headingLines.map((line, i) => (
            <div key={i} className="overflow-hidden py-1">
              <motion.span variants={lineVariants} className="block">
                {line}
              </motion.span>
            </div>
          ))}
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-8 text-[#999] text-[18px] max-w-3xl leading-relaxed"
        >
          Zero-loss persistent memory. Your sovereign cognitive layer across cooking, coding, and daily skills. Powered by BigQuery Vector RAG, Cloud Run, and Gemini reasoning.
        </motion.p>

        {/* Context Jump Chips */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-10 flex flex-wrap items-center gap-3"
        >
          {contextChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => onBeginReflection(chip.label)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/5 text-[#999] hover:text-white hover:border-white/40 transition-colors text-sm"
            >
              <span>{chip.icon}</span>
              <span>{chip.label}</span>
            </button>
          ))}
        </motion.div>

        {/* CTA Row */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-12 flex flex-wrap items-center gap-4"
        >
          <button 
            onClick={() => onBeginReflection("General")}
            className="px-6 py-3 bg-[#D4AF37] hover:bg-[#b5952f] text-black font-medium rounded-md transition-colors"
          >
            Resume Context
          </button>
          <button 
            onClick={onNavigateToCaseStudies}
            className="px-6 py-3 border border-white/30 hover:border-white text-white font-medium rounded-md transition-colors bg-white/5"
          >
            Explore Architecture
          </button>
          <button 
            onClick={handleSignIn}
            className="px-6 py-3 border border-white/30 hover:border-white text-white font-medium rounded-md transition-colors bg-white/5 inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign In
          </button>
        </motion.div>
      </div>

      {/* Scroll down indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center text-white/30 animate-bounce"
      >
        <ChevronDown className="w-8 h-8" />
      </motion.div>
    </section>
  );
}
