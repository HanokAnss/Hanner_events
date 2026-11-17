'use client';

import { MotionConfig } from 'framer-motion';
import Cursor from './Cursor';

/** App-wide client wrapper: honours "reduce motion" for every Framer animation and mounts the cursor. */
export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <Cursor />
      {children}
    </MotionConfig>
  );
}