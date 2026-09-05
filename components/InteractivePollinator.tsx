'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X } from 'lucide-react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
}

interface InteractivePollinatorProps {
  onActivate: () => void;
  activeTab?: string;
}

export function InteractivePollinator({ onActivate, activeTab }: InteractivePollinatorProps) {
  const [hovered, setHovered] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [feedCount, setFeedCount] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const targetRef = useRef({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number | null>(null);

  // Initialize position to bottom right
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initialX = window.innerWidth - 90;
      const initialY = window.innerHeight - 90;
      posRef.current = { x: initialX, y: initialY };
      targetRef.current = { x: initialX, y: initialY };
      setPos({ x: initialX, y: initialY });
    }
  }, []);

  // Soft cursor attraction within proximity
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const homeX = window.innerWidth - 90;
      const homeY = window.innerHeight - 90;

      // Distance from home
      const dx = e.clientX - homeX;
      const dy = e.clientY - homeY;
      const dist = Math.hypot(dx, dy);

      // If cursor is within 320px, gently attract the pollinator towards cursor (leash effect)
      if (dist < 320) {
        targetRef.current = {
          x: homeX + dx * 0.35,
          y: homeY + dy * 0.35,
        };
      } else {
        // Return to home base
        targetRef.current = { x: homeX, y: homeY };
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Organic floating motion loop & particle physics
  useEffect(() => {
    let angle = 0;

    const tick = () => {
      angle += 0.04;
      const hoverWobbleX = Math.sin(angle) * 4;
      const hoverWobbleY = Math.cos(angle * 1.5) * 5;

      // Lerp position towards target
      posRef.current.x += (targetRef.current.x + hoverWobbleX - posRef.current.x) * 0.08;
      posRef.current.y += (targetRef.current.y + hoverWobbleY - posRef.current.y) * 0.08;

      setPos({ x: posRef.current.x, y: posRef.current.y });

      // Update active particles
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            alpha: p.alpha - 0.02,
          }))
          .filter((p) => p.alpha > 0)
      );

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const handleFeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFeedCount((prev) => prev + 1);

    // Burst 10 golden pollen particles
    const newParticles: Particle[] = Array.from({ length: 10 }, (_, i) => ({
      id: Date.now() + i,
      x: pos.x + 24,
      y: pos.y + 24,
      vx: (Math.random() - 0.5) * 6,
      vy: -Math.random() * 5 - 2,
      alpha: 1,
      size: Math.random() * 4 + 3,
    }));

    setParticles((prev) => [...prev, ...newParticles]);
  };

  if (activeTab === 'case-studies') return null;

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed bottom-5 right-5 z-40 bg-[#083D2A] text-[#FFE259] border border-[#D4AF37] px-3 py-1.5 rounded-full text-xs font-sans shadow-md hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
        data-cursor="OPEN"
      >
        <span className="w-2 h-2 rounded-full bg-[#FFE259] animate-ping" />
        <span className="font-serif italic text-xs">Pollinator (28)</span>
      </button>
    );
  }

  return (
    <>
      {/* Floating Golden Pollen Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="fixed pointer-events-none z-50 rounded-full bg-gradient-to-tr from-[#FFE259] to-[#D4AF37] shadow-xs"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.alpha,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* Interactive Pollinator Container */}
      <div
        className="fixed z-40 select-none flex flex-col items-end"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Floating Teaser Pill with "Click to feed the bee" */}
        {hovered && (
          <div
            className="absolute bottom-16 right-0 mb-2 p-3.5 rounded-2xl bg-[#083D2A] text-[#F7F7F7] border border-[#D4AF37]/50 shadow-2xl w-64 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#D4AF37]/30">
              <span className="text-[10px] font-sans uppercase tracking-widest text-[#FFE259] font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#FFE259]" />
                Cloud Pollinator
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMinimized(true);
                }}
                className="text-[#D4AF37] hover:text-white p-0.5 rounded cursor-pointer"
                title="Minimize"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <p className="font-serif italic text-white text-xs mb-1">
              "Click to feed the bee"
            </p>
            <p className="text-[11px] text-[#A2B8AF] leading-snug mb-2.5">
              Fed {feedCount} {feedCount === 1 ? 'time' : 'times'}. Double-click or click below to explore the 28 Architecture Blueprints.
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleFeed}
                className="flex-1 py-1.5 rounded-lg bg-[#FFE259] text-[#083D2A] text-xs font-bold hover:bg-white transition-all cursor-pointer shadow-sm text-center"
                data-cursor="FEED"
              >
                Feed Pollen 🍯
              </button>
              <button
                type="button"
                onClick={onActivate}
                className="flex-1 py-1.5 rounded-lg bg-[#022016] text-[#D4AF37] border border-[#D4AF37]/50 text-xs font-medium hover:border-[#FFE259] transition-all cursor-pointer text-center"
                data-cursor="EXPLORE"
              >
                Open (28)
              </button>
            </div>
          </div>
        )}

        {/* The Pollinator Avatar & Orbital Rings */}
        <div
          className="relative group cursor-pointer"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={handleFeed}
          onDoubleClick={onActivate}
          data-cursor="FEED"
          role="button"
          tabIndex={0}
          aria-label="Feed the Cloud Pollinator or view architecture blueprints"
        >
          {/* Orbital golden halo */}
          <div
            className="absolute -inset-2.5 rounded-full border border-[#D4AF37]/40 animate-spin"
            style={{ animationDuration: '14s' }}
          />
          <div
            className="absolute -inset-1 rounded-full border border-dashed border-[#FFE259]/60 animate-spin"
            style={{ animationDuration: '20s', animationDirection: 'reverse' }}
          />

          {/* Core Body with Fluttering Wings */}
          <div className="w-13 h-13 rounded-full bg-gradient-to-br from-[#083D2A] via-[#0D2E20] to-[#022016] border-2 border-[#D4AF37] shadow-xl flex items-center justify-center relative transition-transform duration-200 group-hover:scale-110">
            {/* Wing Left */}
            <span
              className="absolute -top-1.5 left-1 w-4 h-5 rounded-full bg-white/50 border border-white/80 origin-bottom-right transition-transform"
              style={{
                animation: 'wingFlutter 0.12s ease-in-out infinite alternate',
              }}
            />
            {/* Wing Right */}
            <span
              className="absolute -top-1.5 right-1 w-4 h-5 rounded-full bg-white/50 border border-white/80 origin-bottom-left transition-transform"
              style={{
                animation: 'wingFlutter 0.12s ease-in-out infinite alternate-reverse',
              }}
            />

            {/* Honeycomb / Bee center icon */}
            <span className="text-lg select-none filter drop-shadow-sm">🐝</span>

            {/* Architecture Blueprints count badge */}
            <span
              onClick={(e) => {
                e.stopPropagation();
                onActivate();
              }}
              title="Open 28 Architecture Blueprints"
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-[#FFE259] to-[#D4AF37] text-[#083D2A] text-[10px] font-black font-sans flex items-center justify-center shadow-md border border-[#083D2A] hover:scale-125 transition-transform cursor-pointer"
              data-cursor="BLUEPRINTS"
            >
              28
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
