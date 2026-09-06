import type { Metadata } from 'next';
import { Sora, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PAI - Personal AI Companion & Persistent Memory',
  description: 'Your sovereign cognitive layer. Store all data so you never forget across cooking, coding, and daily skills. Powered by BigQuery Vector RAG, Cloud Run, and Gemini reasoning.',
  openGraph: {
    title: 'PAI - The Companion That Never Forgets',
    description: 'Your sovereign cognitive layer. Resurfaces your deep work state, active coding logic, culinary recipes, and spatial journeys through BigQuery Vector RAG and Gemini reasoning.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PAI - The Companion That Never Forgets',
    description: 'Zero-loss persistent memory powered by Google Cloud Run, BigQuery Vector RAG, and Gemini.',
  },
  other: {
    'theme-color': '#0a0a0a',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
