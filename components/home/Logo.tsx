import Link from 'next/link';
import { BRAND_WORD } from '@/lib/poses';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 font-display text-base sm:text-lg">
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
        <path d="M13 2 23 7.5v11L13 24 3 18.5v-11z" fill="none" stroke="var(--ui-accent)" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M3 7.5 13 13l10-5.5M13 13v11" fill="none" stroke="var(--ui-accent)" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
      {BRAND_WORD}
    </Link>
  );
}
