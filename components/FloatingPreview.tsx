'use client';

import React, { useEffect, useRef } from 'react';
import { CaseStudy } from '@/data/caseStudies';

interface FloatingPreviewProps {
  study: CaseStudy | null;
  visible: boolean;
}

const trackColors: Record<string, string> = {
  'identity-secrets': '#10b981',
  'reasoning-engine': '#3b82f6',
  'vector-rag': '#8b5cf6',
  'spatial-workspace': '#f59e0b',
};

export default function FloatingPreview({ study, visible }: FloatingPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef({ currentX: 0, currentY: 0, targetX: 0, targetY: 0 });
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      positionRef.current.targetX = e.clientX;
      positionRef.current.targetY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    // Set initial position immediately to avoid jumping from 0,0
    positionRef.current.currentX = positionRef.current.targetX;
    positionRef.current.currentY = positionRef.current.targetY;

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const animate = () => {
      const { currentX, currentY, targetX, targetY } = positionRef.current;
      
      const newX = currentX + (targetX - currentX) * 0.12;
      const newY = currentY + (targetY - currentY) * 0.12;
      
      positionRef.current.currentX = newX;
      positionRef.current.currentY = newY;
      
      if (containerRef.current) {
        // Offset: 20px right and 20px up from cursor
        containerRef.current.style.transform = `translate3d(${newX + 20}px, ${newY - 20}px, 0)`;
      }
      
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  const trackColor = study?.track ? trackColors[study.track] || '#7d7d7d' : '#7d7d7d';

  return (
    <div
      ref={containerRef}
      className={`fixed top-0 left-0 pointer-events-none z-50 transition-opacity duration-200 ${
        visible && study ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {study && (
        <div 
          className="w-[280px] bg-[#111111] rounded-lg border border-white/10 overflow-hidden shadow-2xl flex flex-col relative"
          style={{ borderLeftColor: trackColor, borderLeftWidth: '4px' }}
        >
          {/* Track gradient background strip at top */}
          <div 
            className="h-2 w-full opacity-30" 
            style={{ background: `linear-gradient(to right, ${trackColor}, transparent)` }} 
          />
          
          <div className="p-4 relative">
            {/* Blueprint number large semi-transparent */}
            <div 
              className="absolute right-4 top-2 text-[clamp(2rem,4vw,3rem)] font-bold text-white/10 select-none leading-none pointer-events-none font-mono"
            >
              {String(study.number).padStart(2, '0')}
            </div>

            <div className="relative z-10">
              <h3 className="text-white text-[14px] font-medium leading-tight mb-3 pr-8">
                {study.title}
              </h3>
              
              {study.asciiFlow && (
                <div className="mt-2 pt-2 border-t border-white/5">
                  <pre className="text-[10px] text-[#7d7d7d] font-mono overflow-hidden leading-tight line-clamp-3">
                    {study.asciiFlow.split('\n').slice(0, 3).join('\n')}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
