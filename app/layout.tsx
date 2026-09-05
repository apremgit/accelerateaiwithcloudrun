import type { Metadata } from 'next';
import { Lora, Albert_Sans } from 'next/font/google';
import './globals.css'; // Global styles

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
});

const albertSans = Albert_Sans({
  subsets: ['latin'],
  variable: '--font-albert-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PAI - Personal AI Companion & Persistent Memory OS',
  description: 'Your sovereign cognitive layer. Store all data so you never forget across cooking, coding, and daily skills. Powered by BigQuery Vector RAG, Cloud Run, and Gemini reasoning.',
  openGraph: {
    title: 'PAI - The Companion That Never Forgets',
    description: 'Your sovereign cognitive layer. Resurfaces your deep work state, active coding logic, culinary recipes, and spatial journeys through BigQuery Vector RAG and Gemini reasoning.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PAI - The Companion That Never Forgets',
    description: 'Zero-loss persistent memory OS powered by Google Cloud Run, BigQuery Vector RAG, and Gemini.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${lora.variable} ${albertSans.variable}`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
