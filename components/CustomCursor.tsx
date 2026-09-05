'use client';

import React, { useEffect, useState, useRef } from 'react';

interface CursorState {
  x: number;
  y: number;
  hovered: boolean;
  text: string;
  variant: 'default' | 'gold' | 'emerald';
}

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [cursorState, setCursorState] = useState<CursorState>({
    x: -100,
    y: -100,
    hovered: false,
    text: '',
    variant: 'default',
  });

  const mouseRef = useRef({ x: -100, y: -100 });
  const posRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Only enable for non-touch fine pointer devices (desktop/laptop)
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    setEnabled(true);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };

      // Inspect target element or closest parent for data-cursor or interactive tag
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const cursorEl = target.closest('[data-cursor]') as HTMLElement | null;
      const isClickable =
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.closest('.cursor-pointer');

      if (cursorEl) {
        const text = cursorEl.getAttribute('data-cursor') || 'VIEW';
        const variant = (cursorEl.getAttribute('data-cursor-variant') as 'gold' | 'emerald') || 'gold';
        setCursorState((prev) => ({
          ...prev,
          hovered: true,
          text,
          variant,
        }));
      } else if (isClickable) {
        setCursorState((prev) => ({
          ...prev,
          hovered: true,
          text: '',
          variant: 'default',
        }));
      } else {
        setCursorState((prev) => ({
          ...prev,
          hovered: false,
          text: '',
          variant: 'default',
        }));
      }
    };

    const handleMouseLeave = () => {
      setCursorState((prev) => ({ ...prev, hovered: false, text: '' }));
      mouseRef.current = { x: -100, y: -100 };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    // Spring/lerp animation loop
    const tick = () => {
      posRef.current.x += (mouseRef.current.x - posRef.current.x) * 0.18;
      posRef.current.y += (mouseRef.current.y - posRef.current.y) * 0.18;

      setCursorState((prev) => ({
        ...prev,
        x: posRef.current.x,
        y: posRef.current.y,
      }));

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!enabled || cursorState.x < 0) return null;

  const isTextBadge = cursorState.text.length > 0;

  return (
    <aside
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden select-none"
    >
      {/* Precision center dot */}
      <div
        className="absolute w-2 h-2 rounded-full bg-[#D4AF37] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-150 shadow-xs"
        style={{
          left: `${mouseRef.current.x}px`,
          top: `${mouseRef.current.y}px`,
          opacity: isTextBadge ? 0 : 1,
        }}
      />

      {/* Trailing smooth magnetic halo ring */}
      <div
        className={`absolute rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-300 flex items-center justify-center backdrop-blur-[1px] ${
          isTextBadge
            ? 'w-18 h-18 bg-[#083D2A]/90 border border-[#D4AF37] shadow-lg scale-105'
            : cursorState.hovered
            ? 'w-12 h-12 border-2 border-[#D4AF37] bg-[#D4AF37]/10 scale-110'
            : 'w-8 h-8 border border-[#6B8E9B]/50 bg-transparent'
        }`}
        style={{
          left: `${cursorState.x}px`,
          top: `${cursorState.y}px`,
        }}
      >
        {isTextBadge && (
          <span className="text-[10px] font-sans font-bold tracking-widest text-[#FFE259] uppercase animate-in fade-in zoom-in-75 duration-150">
            {cursorState.text}
          </span>
        )}
      </div>
    </aside>
  );
}
