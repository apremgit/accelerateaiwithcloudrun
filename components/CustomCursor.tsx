'use client';

import React, { useEffect, useState, useRef } from 'react';

interface PollenParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
}

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [particles, setParticles] = useState<PollenParticle[]>([]);

  const cursorRef = useRef<HTMLDivElement | null>(null);
  const mouseCoords = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Only enable for fine pointer devices (desktop/laptop)
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    setEnabled(true);

    // Instant zero-delay tracking directly in mousemove
    const handleMouseMove = (e: MouseEvent) => {
      mouseCoords.current = { x: e.clientX, y: e.clientY };

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isInteractive =
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.closest('[data-cursor]') ||
        target.closest('.cursor-pointer');

      setHovered(!!isInteractive);
    };

    const handleMouseDown = () => {
      setClicked(true);

      // Burst tiny golden pollen particles on click
      const newPollen: PollenParticle[] = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        x: mouseCoords.current.x,
        y: mouseCoords.current.y,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 3 - 1,
        alpha: 0.9,
        size: Math.random() * 3 + 2,
      }));

      setParticles((prev) => [...prev.slice(-12), ...newPollen]);
    };

    const handleMouseUp = () => {
      setClicked(false);
    };

    const handleMouseLeave = () => {
      if (cursorRef.current) {
        cursorRef.current.style.opacity = '0';
      }
    };

    const handleMouseEnter = () => {
      if (cursorRef.current) {
        cursorRef.current.style.opacity = '1';
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Particle decay animation
    let particleTimer = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            alpha: p.alpha - 0.05,
          }))
          .filter((p) => p.alpha > 0)
      );
    }, 25);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      clearInterval(particleTimer);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      {/* Click Pollen Burst Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="fixed pointer-events-none z-[9999] rounded-full bg-gradient-to-tr from-[#FFE259] to-[#D4AF37] shadow-xs"
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

      {/* Zero-Delay Cloud Pollinator Cursor */}
      <div
        ref={cursorRef}
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none z-[9999] select-none will-change-transform"
        style={{
          transform: 'translate3d(-100px, -100px, 0)',
        }}
      >
        {/* Precision Targeting Pinpoint at Click Point (0,0) */}
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2">
          <span className="block w-1.5 h-1.5 rounded-full bg-[#FFE259] shadow-[0_0_6px_#FFE259]" />
        </div>

        {/* The Cloud Pollinator Body hovering next to the pointer tip */}
        <div
          className={`relative -top-2 left-2 flex items-center justify-center transition-transform duration-100 ease-out ${
            clicked
              ? 'scale-85'
              : hovered
              ? 'scale-115'
              : 'scale-100'
          }`}
        >
          {/* Outer Orbital Golden Halo Ring */}
          <div
            className={`absolute -inset-1.5 rounded-full border border-dashed border-[#FFE259]/60 transition-opacity duration-200 animate-spin ${
              hovered ? 'opacity-90 border-[#FFE259]' : 'opacity-40'
            }`}
            style={{ animationDuration: hovered ? '6s' : '14s' }}
          />

          {/* Core Body */}
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#083D2A] via-[#0D2E20] to-[#022016] border border-[#D4AF37] shadow-lg flex items-center justify-center relative">
            {/* Wing Left */}
            <span
              className="absolute -top-1 left-0.5 w-2.5 h-3 rounded-full bg-white/60 border border-white/90 origin-bottom-right"
              style={{
                animation: `wingFlutter ${hovered ? '0.07s' : '0.12s'} ease-in-out infinite alternate`,
              }}
            />
            {/* Wing Right */}
            <span
              className="absolute -top-1 right-0.5 w-2.5 h-3 rounded-full bg-white/60 border border-white/90 origin-bottom-left"
              style={{
                animation: `wingFlutter ${hovered ? '0.07s' : '0.12s'} ease-in-out infinite alternate-reverse`,
              }}
            />

            {/* Bee Center Emoji / Icon */}
            <span className="text-[13px] leading-none select-none filter drop-shadow-xs">
              🐝
            </span>
          </div>

          {/* Tiny blueprint 28 sparkle pill when hovered */}
          {hovered && (
            <span className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded-full bg-[#FFE259] text-[#083D2A] text-[8px] font-mono font-black shadow-xs">
              PAI
            </span>
          )}
        </div>
      </div>
    </>
  );
}
