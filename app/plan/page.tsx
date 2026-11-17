import { Suspense } from 'react';
import Wizard from '@/components/planner/Wizard';

export const metadata = { title: 'Plan your event | Fourfold Events' };

export default function PlanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <Wizard />
    </Suspense>
  );
}
