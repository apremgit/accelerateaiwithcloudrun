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
  title: 'ReflectAI - Journal & Reflection Workspace',
  description: 'User-authenticated multi-turn journaling and reflection dashboard with private Firestore persistence and Gemini 3.6 Flash AI analysis.',
  openGraph: {
    title: 'ReflectAI - Journal & Reflection Workspace',
    description: 'User-authenticated multi-turn journaling and reflection dashboard with private Firestore persistence and Gemini 3.6 Flash AI analysis.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ReflectAI - Journal & Reflection Workspace',
    description: 'User-authenticated multi-turn journaling and reflection dashboard with private Firestore persistence and Gemini 3.6 Flash AI analysis.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${lora.variable} ${albertSans.variable}`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
