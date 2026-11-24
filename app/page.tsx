'use client';

import dynamic from 'next/dynamic';

// The WebGL landing is client-only. While its code loads, show the same dark backdrop the loader uses.
const Landing = dynamic(() => import('@/components/home/Landing'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-[#0e0c1d]" />,
});

export default function Home() {
  return <Landing />;
}
