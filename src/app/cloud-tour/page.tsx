'use client';

import { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

const stations = [
  { id: 's1', name: '昆明北站', en: 'Kunming North', x: 28, y: 22, status: 'active', built: 1910 },
  { id: 's2', name: '宜良站', en: 'Yiliang', x: 36, y: 32, status: 'active', built: 1910 },
  { id: 's3', name: '开远站', en: 'Kaiyuan', x: 50, y: 48, status: 'active', built: 1910 },
  { id: 's4', name: '碧色寨站', en: 'Bisezhai', x: 58, y: 58, status: 'heritage', built: 1909 },
  { id: 's5', name: '蒙自站', en: 'Mengzi', x: 60, y: 64, status: 'active', built: 1909 },
  { id: 's6', name: '河口口岸', en: 'Hekou', x: 78, y: 88, status: 'border', built: 1910 },
];

const layers = [
  { key: 'L1', label: '全局视图', en: 'Global' },
  { key: 'L2', label: '局部视图', en: 'Regional' },
  { key: 'L3', label: '沉浸视图', en: 'Immersive' },
];

const statusBadge: Record<string, string> = {
  active: '运营中',
  heritage: '遗产站点',
  border: '口岸枢纽',
};

export default function CloudTourPage() {
  const [activeId, setActiveId] = useState('s4');
  const [layer, setLayer] = useState('L1');
  const active = stations.find((s) => s.id === activeId)!;

  return (
    <main className="min-h-screen bg-background text-foreground page-fade-in">
      <Navigation />

      <section className="h-screen relative overflow-hidden">
        {/* 地图占位背景 */}
        <div className="absolute inset-0 bg-surface-2">
          <img
            src="https://picsum.photos/seed/migui-map-yunnan/1920/1080?grayscale"
            alt=""
            aria-hidden
            className="w-full h-full object-cover"
            style={{ filter: 'sepia(0.45) contrast(0.9) opacity(0.55)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/40" />
        </div>

        {/* 站点标记 */}
        <div className="absolute inset-0">
          {/* 连线 */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            <polyline
              points={stations.map((s) => `${s.x},${s.y}`).join(' ')}
              fill="none"
              stroke="var(--accent-gold)"
              strokeWidth="0.25"
              strokeDasharray="0.6 0.6"
              opacity="0.55"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {stations.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveId(s.id)}
              className="absolute -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
            >
              <span
                className={`block w-3 h-3 border transition-all
                  ${activeId === s.id
                    ? 'bg-accent border-accent scale-150'
                    : 'bg-background border-accent group-hover:scale-125'}`}
              />
              <span
                className={`absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap
                            text-[10px] tracking-[0.25em] italic transition-opacity
                            ${activeId === s.id ? 'text-accent opacity-100' : 'text-text-secondary opacity-70 group-hover:opacity-100'}`}
                style={enFont}
              >
                {s.en}
              </span>
            </button>
          ))}
        </div>

        {/* 顶部标题 */}
        <div className="absolute top-28 left-6 md:left-12 max-w-md">
          <p
            className="text-[10px] tracking-[0.5em] uppercase italic text-accent mb-2"
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

        {/* 层级切换 */}
        <div className="absolute top-28 right-6 md:right-12 bg-surface-1/95 backdrop-blur-sm border border-border-subtle">
          {layers.map((L) => (
            <button
              key={L.key}
              onClick={() => setLayer(L.key)}
              className={`block w-full px-5 py-3 text-left transition-colors border-l-2
                ${layer === L.key
                  ? 'bg-accent/10 border-l-accent text-accent'
                  : 'border-l-transparent text-text-secondary hover:text-text-primary'}`}
            >
              <p
                className="text-[10px] tracking-[0.4em] uppercase italic"
                style={enFont}
              >
                {L.key} · {L.en}
              </p>
              <p className="font-serif text-sm tracking-wider mt-0.5">{L.label}</p>
            </button>
          ))}
        </div>

        {/* 站点信息面板 */}
        <div className="absolute bottom-8 left-6 right-6 md:left-12 md:right-auto md:w-[26rem]
                        bg-surface-1/95 backdrop-blur-sm border border-accent/30">
          <div className="absolute top-0 left-4 right-4 h-[2px] bg-accent/70" />
          <div className="p-6 md:p-7">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p
                  className="text-[10px] tracking-[0.4em] uppercase italic text-accent mb-2"
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
                  {active.en}
                </p>
              </div>
              <span
                className="px-2 py-1 text-[10px] tracking-[0.25em] italic uppercase border border-accent text-accent"
                style={enFont}
              >
                {statusBadge[active.status]}
              </span>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed mb-5">
              {active.id === 's4'
                ? '碧色寨车站融合了法国第三共和时期建筑语汇与本土砖石工艺，被誉为"东方小巴黎"。'
                : '该站点的详细介绍数据将在 GIS 系统对接后接入。'}
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
