'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Navigation } from '@/components/layout/Navigation';
import {
  stations,
  stationStatusLabel,
  stationIntro,
  PLACEHOLDER_INTRO,
} from '@/data/migui-line';

// Leaflet 依赖 window/document，必须客户端动态加载（SSR 阶段不导入）
const MiguiMap = dynamic(
  () => import('@/components/cloud-tour/MiguiLeafletMap').then((m) => m.MiguiLeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center text-text-muted text-sm tracking-[0.3em] italic">
        loading map…
      </div>
    ),
  }
);

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

        {/* 顶部标题 · 移动端: 紧凑、左侧 58% 宽，给右侧 L1/L2/L3 让位 */}
        <div className="absolute top-20 md:top-28 left-3 md:left-12 max-w-[58%] md:max-w-md z-[1000] pointer-events-none
                        bg-surface-1/85 backdrop-blur-md border border-border-subtle
                        px-3 py-2 md:px-6 md:py-5">
          <p
            className="text-[8.5px] md:text-[10px] tracking-[0.3em] md:tracking-[0.5em] uppercase italic text-cinnabar mb-0.5 md:mb-2"
            style={enFont}
          >
            Cloud Tour · 云游导览
          </p>
          <h1 className="font-serif text-[13px] md:text-3xl tracking-[0.05em] md:tracking-[0.1em] text-text-primary mb-0 md:mb-2 leading-tight">
            <span className="md:hidden">米轨 · 855km</span>
            <span className="hidden md:inline">米轨地图 · 全线 855 公里</span>
          </h1>
          <p
            className="hidden md:block text-[11px] tracking-[0.25em] italic text-text-secondary"
            style={enFont}
          >
            From Kunming to Hekou — 32 stations along the steel spine.
          </p>
        </div>

        {/* 层级切换 —— L2/L3 演示期锁定，仅 L1 可点 · 移动端紧凑、同 top-20 与标题并排 */}
        <div className="absolute top-20 md:top-28 right-3 md:right-12 bg-surface-1/95 backdrop-blur-sm border border-border-subtle z-[1000]">
          {layers.map((L) => {
            const isActive = layer === L.key;
            const isLocked = !L.enabled;
            return (
              <button
                key={L.key}
                onClick={() => L.enabled && setLayer(L.key)}
                disabled={isLocked}
                className={`block w-full px-3 md:px-5 py-1.5 md:py-3 text-left transition-colors border-l-2
                  ${isActive
                    ? 'bg-accent/10 border-l-accent text-accent'
                    : 'border-l-transparent text-text-secondary hover:text-text-primary'}
                  ${isLocked ? 'opacity-50 cursor-not-allowed hover:text-text-secondary' : ''}`}
              >
                <p
                  className="text-[8.5px] md:text-[10px] tracking-[0.3em] md:tracking-[0.4em] uppercase italic flex items-center gap-1.5"
                  style={enFont}
                >
                  <span>
                    {L.key}
                    <span className="hidden md:inline"> · {L.en}</span>
                  </span>
                  {isLocked && <span className="text-[7px] md:text-[8px]">[soon]</span>}
                </p>
                <p className="font-serif text-[11px] md:text-sm tracking-wider mt-0 md:mt-0.5 leading-tight">{L.label}</p>
              </button>
            );
          })}
        </div>

        {/* 站点信息面板 · 移动端：紧贴底部、padding 收紧，让地图区域更大 */}
        <div className="absolute bottom-3 md:bottom-8 left-3 right-3 md:left-12 md:right-auto md:w-[26rem]
                        bg-surface-1/95 backdrop-blur-sm border border-cinnabar/30 z-[1000]
                        max-h-[44vh] md:max-h-none overflow-y-auto">
          <div className="absolute top-0 left-3 right-3 md:left-4 md:right-4 h-[2px] bg-cinnabar/70" />
          <div className="p-4 md:p-7">
            <div className="flex items-start justify-between gap-3 mb-3 md:mb-4">
              <div className="min-w-0">
                <p
                  className="text-[9px] md:text-[10px] tracking-[0.3em] md:tracking-[0.4em] uppercase italic text-cinnabar mb-1 md:mb-2"
                  style={enFont}
                >
                  Station · est. {active.built}
                </p>
                <h3 className="font-serif text-base md:text-xl tracking-[0.1em] md:tracking-[0.12em] text-text-primary leading-tight">
                  {active.name}
                </h3>
                <p
                  className="text-[10px] md:text-[11px] tracking-[0.25em] md:tracking-[0.3em] italic text-text-muted mt-1"
                  style={enFont}
                >
                  {active.en} · {active.kmFromKunming} km
                </p>
              </div>
              <span
                className="shrink-0 px-1.5 md:px-2 py-0.5 md:py-1 text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.25em] italic uppercase border border-cinnabar text-cinnabar bg-cinnabar-soft"
                style={enFont}
              >
                {stationStatusLabel[active.status]}
              </span>
            </div>

            <p className="text-[13px] md:text-sm text-text-secondary leading-relaxed mb-4 md:mb-5">
              {intro}
            </p>

            <div className="flex gap-2">
              <button
                className="flex-1 py-2 md:py-2.5 text-[11px] md:text-xs tracking-[0.2em] md:tracking-[0.25em] border border-accent text-accent
                           hover:bg-accent hover:text-background transition-colors"
              >
                VR 全景
              </button>
              <button
                className="flex-1 py-2 md:py-2.5 text-[11px] md:text-xs tracking-[0.2em] md:tracking-[0.25em] border border-border-hard text-text-secondary
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
