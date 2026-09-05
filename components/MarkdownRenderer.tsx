'use client';

import React from 'react';
import Markdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`font-serif text-[18px] text-[#2C3539] leading-[1.8] space-y-4 font-normal ${className}`}>
      <Markdown>{content}</Markdown>
    </div>
  );
}
