import type { Metadata } from 'next';
import { DM_Sans, Unbounded } from 'next/font/google';
import AppShell from '@/components/ui/AppShell';
import './globals.css';

const display = Unbounded({ subsets: ['latin'], variable: '--font-display' });
const body = DM_Sans({ subsets: ['latin'], variable: '--font-body' });

export const metadata: Metadata = {
  title: 'Fourfold Events: concerts, parties, church and community gatherings',
  description:
    'Plan an event in minutes. Pick the event, headcount, food, DJ and decor, see the crew and price, then pay by card, UPI or cash.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}