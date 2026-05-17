'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const TUNNEL_MS = 850;

export default function Intro() {
  const router = useRouter();
  const [entering, setEntering] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    router.prefetch('/home');

    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        if (timerRef.current !== null) {
          window.clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        setEntering(false);
      }
    };
    window.addEventListener('pageshow', onPageShow);

    return () => {
      window.removeEventListener('pageshow', onPageShow);
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [router]);

  const enter = () => {
    if (entering) return;
    setEntering(true);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      router.push('/home');
    }, TUNNEL_MS);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      enter();
    }
  };

  return (
    <main
      role="button"
      tabIndex={0}
      aria-label="进入云上米轨主页"
      onClick={enter}
      onKeyDown={onKey}
      className="relative h-screen w-screen overflow-hidden bg-background text-foreground select-none"
      style={{
        cursor: entering ? 'wait' : 'pointer',
        opacity: entering ? 0 : 1,
        transition: `opacity ${TUNNEL_MS}ms ease-in`,
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/intro-hero.jpg')",
          filter: entering
            ? 'grayscale(0.55) sepia(0.18) contrast(0.95) blur(10px)'
            : 'grayscale(0.55) sepia(0.18) contrast(0.95)',
          opacity: entering ? 0.18 : 0.42,
          transform: entering ? 'scale(2.6)' : 'scale(1)',
          transformOrigin: 'center',
          transition: `transform ${TUNNEL_MS}ms cubic-bezier(0.55, 0, 0.65, 1), filter ${TUNNEL_MS}ms ease-in, opacity ${TUNNEL_MS}ms ease-in`,
          willChange: 'transform, filter, opacity',
        }}
      />

      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/55 to-background pointer-events-none"
      />

      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at center, rgba(239,165,24,0.45) 0%, rgba(239,165,24,0.14) 35%, transparent 65%)',
          opacity: entering ? 1 : 0,
          transform: entering ? 'scale(2.2)' : 'scale(0.9)',
          transformOrigin: 'center',
          transition: `opacity ${TUNNEL_MS}ms ease-in, transform ${TUNNEL_MS}ms cubic-bezier(0.55, 0, 0.65, 1)`,
          willChange: 'transform, opacity',
        }}
      />

      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-baseline gap-2 text-text-primary z-10">
        <span className="font-serif text-lg md:text-xl font-semibold tracking-[0.2em]">
          云上米轨
        </span>
        <span
          className="text-[10px] tracking-[0.4em] uppercase text-text-muted"
          style={{ fontFamily: 'var(--font-serif-en)' }}
        >
          Yunshang Migui
        </span>
      </div>

      <div
        className="relative z-10 h-full flex items-center justify-center"
        style={{
          opacity: entering ? 0 : 1,
          transform: entering ? 'translateY(-12px) scale(0.96)' : 'translateY(0) scale(1)',
          filter: entering ? 'blur(4px)' : 'none',
          transition: `opacity 480ms ease-in, transform 600ms ease-in, filter 480ms ease-in`,
        }}
      >
        <div className="max-w-2xl px-6 text-center space-y-10">
          <p className="font-serif text-base md:text-lg leading-loose tracking-wide text-text-primary">
            欢迎来到「云上米轨」——穿越时空的钢铁脊梁。
            <br />
            一座致力于探索百年滇越铁路史料、工业遗产美学
            <br className="hidden md:block" />
            与人类跨地域文明交流的数字化平台。
            <br />
            <span className="text-text-secondary">
              汽笛声远，铁轨依旧。我们在何处启程？记忆往何处延伸？
            </span>
          </p>

          <p
            className="text-sm md:text-base leading-loose text-text-secondary italic"
            style={{ fontFamily: 'var(--font-serif-en)' }}
          >
            Welcome to Yunshang Migui — the Steel Spine Through Time.
            <br />
            A digital platform devoted to the centennial Dianyue Railway:
            <br className="hidden md:block" />
            its archives, its industrial heritage, its quiet exchange between cultures.
            <br />
            The whistle has faded; the rails remain. Where do we set out? How far does memory reach?
          </p>
        </div>
      </div>

      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-text-muted z-10"
        style={{
          opacity: entering ? 0 : 1,
          transition: 'opacity 300ms ease-in',
          animation: entering ? 'none' : 'pulse 2s ease-in-out infinite',
        }}
      >
        <span
          className="text-[10px] tracking-[0.4em] uppercase italic"
          style={{ fontFamily: 'var(--font-serif-en)' }}
        >
          Click anywhere to enter
        </span>
        {/* 朱砂启印：进入门户的小印章 */}
        <span aria-hidden className="block w-2 h-2 bg-cinnabar" />
        <div className="w-px h-8 bg-gradient-to-b from-accent/60 to-transparent" />
      </div>
    </main>
  );
}
