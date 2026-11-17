'use client';

import dynamic from 'next/dynamic';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import MobileStack from '@/components/home/MobileStack';

// The WebGL experience is only ever loaded on desktop-width screens.
const DesktopExperience = dynamic(() => import('@/components/home/DesktopExperience'), { ssr: false });

export default function Home() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  if (isDesktop === null) return <div className="min-h-screen" />;
  return isDesktop ? <DesktopExperience /> : <MobileStack />;
}
