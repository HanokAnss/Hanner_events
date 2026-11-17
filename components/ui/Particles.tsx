'use client';

import { useEffect, useRef } from 'react';
import type { RGB } from '@/lib/color';

interface Props {
  /** Float section index; used to speed particles up (and flip their direction) while scrolling. */
  getProgress: () => number;
  /** Current theme colour; particles ease towards it, so colour changes are always smooth. */
  getColor: () => RGB;
  density?: number;
}

interface P { x: number; y: number; r: number; vy: number; ph: number; a: number; z: number }

/** Drifting 2D-canvas particles. Faster on scroll, nudged by the cursor, tinted by the theme. */
export default function Particles({ getProgress, getColor, density = 1 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const gp = useRef(getProgress);
  const gc = useRef(getColor);
  gp.current = getProgress;
  gc.current = getColor;

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0, boost = 0, dir = 1;
    let last = performance.now();
    let lastP = gp.current();
    const col: RGB = [...gc.current()] as RGB;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let ps: P[] = [];

    const spawn = (anywhere: boolean): P => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 12,
      r: 0.8 + Math.random() * 2.2,
      vy: 6 + Math.random() * 18,
      ph: Math.random() * 6.28,
      a: 0.25 + Math.random() * 0.5,
      z: 0.3 + Math.random() * 0.7,
    });

    const frame = (now: number, dt: number) => {
      const p = gp.current();
      const dp = (p - lastP) / Math.max(dt, 0.001);
      lastP = p;
      if (Math.abs(dp) > 0.05) dir = dp > 0 ? 1 : -1;
      boost += (Math.min(Math.abs(dp), 5) - boost) * Math.min(1, dt * 6);
      mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 3);
      const target = gc.current();
      const k = Math.min(1, dt * 4);
      for (let i = 0; i < 3; i++) col[i] += (target[i] - col[i]) * k;
      const rgb = `${col[0] | 0},${col[1] | 0},${col[2] | 0}`;

      ctx.clearRect(0, 0, w, h);
      for (const q of ps) {
        q.y -= q.vy * q.z * (1 + boost * 4) * dt * dir;
        q.x += (Math.sin(now / 1600 + q.ph) * 10 - mouse.x * 26 * q.z) * dt;
        if (q.y < -14) { q.y = h + 12; q.x = Math.random() * w; }
        else if (q.y > h + 14) { q.y = -12; q.x = Math.random() * w; }
        if (q.x < -14) q.x = w + 12;
        else if (q.x > w + 14) q.x = -12;

        const r = q.r * q.z + 0.4;
        if (q.z < 0.5) {
          ctx.fillStyle = `rgba(${rgb},${q.a * 0.18})`;
          ctx.beginPath();
          ctx.arc(q.x, q.y, r * 4, 0, 6.283);
          ctx.fill();
        }
        ctx.fillStyle = `rgba(${rgb},${q.a})`;
        ctx.beginPath();
        ctx.ellipse(q.x, q.y, r, r * (1 + boost * 2.2), 0, 0, 6.283);
        ctx.fill();
      }
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      frame(now, dt);
      raf = requestAnimationFrame(tick);
    };

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(90, (w * h) / 20000) * density);
      ps = Array.from({ length: n }, () => spawn(true));
      if (reduce) frame(performance.now(), 0);
    };
    const onMouse = (e: MouseEvent) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouse);
    if (!reduce) raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
    };
  }, [density]);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 h-full w-full" />;
}