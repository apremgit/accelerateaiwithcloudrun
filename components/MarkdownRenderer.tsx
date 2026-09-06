'use client';

import React from 'react';
import Markdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`font-sans text-[16px] sm:text-[17px] text-[#f4f4f4] leading-[1.8] space-y-4 font-normal prose prose-invert max-w-none ${className}`}>
      <Markdown>{content}</Markdown>
    </div>
  );
}
