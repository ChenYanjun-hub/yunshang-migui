'use client';

import { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { MiguiMap } from '@/components/cloud-tour/MiguiMap';
import {
  stations,
  stationStatusLabel,
  stationIntro,
  PLACEHOLDER_INTRO,
} from '@/data/migui-line';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

const layers = [
  { key: 'L1', label: '全局视图', en: 'Global', enabled: true },
  { key: 'L2', label: '局部视图', en: 'Regional', enabled: false },
  { key: 'L3', label: '沉浸视图', en: 'Immersive', enabled: false },
];

export default function CloudTourPage() {
  const [activeId, setActiveId] = useState('s4');
  const [layer, setLayer] = useState('L1');
  const active = stations.find((s) => s.id === activeId)!;
  const intro = stationIntro[active.id] ?? PLACEHOLDER_INTRO;

  return (
    <main className="min-h-screen bg-background text-foreground page-fade-in">
      <Navigation />

      <section className="h-screen relative overflow-hidden">
        {/* 地图主体（底图 + 朱砂主线 + 站点印章） */}
        <MiguiMap activeStationId={activeId} onSelectStation={setActiveId} />

        {/* 顶部标题 */}
        <div className="absolute top-28 left-6 md:left-12 max-w-md">
          <p
            className="text-[10px] tracking-[0.5em] uppercase italic text-cinnabar mb-2"
            style={enFont}
          >
            Cloud Tour · 云游导览
          </p>
          <h1 className="font-serif text-2xl md:text-3xl tracking-[0.1em] text-text-primary mb-2">
            米轨地图 · 全线 855 公里
          </h1>
          <p
            className="text-[11px] tracking-[0.25em] italic text-text-secondary"
            style={enFont}
          >
            From Kunming to Hekou — 32 stations along the steel spine.
          </p>
        </div>

        {/* 层级切换 —— L2/L3 演示期锁定，仅 L1 可点 */}
        <div className="absolute top-28 right-6 md:right-12 bg-surface-1/95 backdrop-blur-sm border border-border-subtle">
          {layers.map((L) => {
            const isActive = layer === L.key;
            const isLocked = !L.enabled;
            return (
              <button
                key={L.key}
                onClick={() => L.enabled && setLayer(L.key)}
                disabled={isLocked}
                className={`block w-full px-5 py-3 text-left transition-colors border-l-2
                  ${isActive
                    ? 'bg-accent/10 border-l-accent text-accent'
                    : 'border-l-transparent text-text-secondary hover:text-text-primary'}
                  ${isLocked ? 'opacity-50 cursor-not-allowed hover:text-text-secondary' : ''}`}
              >
                <p
                  className="text-[10px] tracking-[0.4em] uppercase italic flex items-center gap-2"
                  style={enFont}
                >
                  <span>{L.key} · {L.en}</span>
                  {isLocked && <span className="text-[8px] tracking-[0.3em]">[soon]</span>}
                </p>
                <p className="font-serif text-sm tracking-wider mt-0.5">{L.label}</p>
              </button>
            );
          })}
        </div>

        {/* 站点信息面板 */}
        <div className="absolute bottom-8 left-6 right-6 md:left-12 md:right-auto md:w-[26rem]
                        bg-surface-1/95 backdrop-blur-sm border border-cinnabar/30">
          <div className="absolute top-0 left-4 right-4 h-[2px] bg-cinnabar/70" />
          <div className="p-6 md:p-7">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p
                  className="text-[10px] tracking-[0.4em] uppercase italic text-cinnabar mb-2"
                  style={enFont}
                >
                  Station · est. {active.built}
                </p>
                <h3 className="font-serif text-xl tracking-[0.12em] text-text-primary">
                  {active.name}
                </h3>
                <p
                  className="text-[11px] tracking-[0.3em] italic text-text-muted mt-1"
                  style={enFont}
                >
                  {active.en} · {active.kmFromKunming} km
                </p>
              </div>
              <span
                className="px-2 py-1 text-[10px] tracking-[0.25em] italic uppercase border border-cinnabar text-cinnabar bg-cinnabar-soft"
                style={enFont}
              >
                {stationStatusLabel[active.status]}
              </span>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed mb-5">
              {intro}
            </p>

            <div className="flex gap-2">
              <button
                className="flex-1 py-2.5 text-xs tracking-[0.25em] border border-accent text-accent
                           hover:bg-accent hover:text-background transition-colors"
              >
                VR 全景
              </button>
              <button
                className="flex-1 py-2.5 text-xs tracking-[0.25em] border border-border-hard text-text-secondary
                           hover:border-accent hover:text-accent transition-colors"
              >
                查看史料
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
