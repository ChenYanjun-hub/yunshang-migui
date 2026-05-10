'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';

export type ArchivePeriod = 'construction' | 'operation' | 'republic' | 'prc' | 'heritage';
export type ArchiveType = 'photo' | 'document' | 'map' | 'blueprint' | 'newspaper' | 'oral_history';

export type ArchiveItem = {
  id: string;
  title: string;
  period: ArchivePeriod;
  type: ArchiveType;
  year: number;
  description: string;
  source: string;
  height: number;
  coverUrl: string;
};

const periodLabels: Record<ArchivePeriod, string> = {
  construction: '修建期', operation: '运营期', republic: '民国时期', prc: '建国后', heritage: '遗产保护',
};
const periodEn: Record<ArchivePeriod, string> = {
  construction: 'Construction', operation: 'Operation', republic: 'Republic Era', prc: 'PRC Era', heritage: 'Heritage',
};
const typeLabels: Record<ArchiveType, string> = {
  photo: '老照片', document: '文献', map: '手绘地图', blueprint: '工程图纸', newspaper: '报刊剪报', oral_history: '口述史',
};

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

export default function ArchiveClient({ archives }: { archives: ArchiveItem[] }) {
  const [period, setPeriod] = useState<ArchivePeriod | 'all'>('all');
  const [type, setType] = useState<ArchiveType | 'all'>('all');
  const [keyword, setKeyword] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return archives.filter((item) => {
      if (period !== 'all' && item.period !== period) return false;
      if (type !== 'all' && item.type !== type) return false;
      if (keyword.trim()) {
        const k = keyword.trim().toLowerCase();
        if (
          !item.title.toLowerCase().includes(k) &&
          !item.description.toLowerCase().includes(k) &&
          !item.source.toLowerCase().includes(k)
        ) return false;
      }
      return true;
    });
  }, [archives, period, type, keyword]);

  const active = useMemo(() => archives.find((it) => it.id === activeId) ?? null, [archives, activeId]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setActiveId(null); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [active]);

  return (
    <main className="min-h-screen bg-background text-foreground page-fade-in">
      <Navigation />

      <section className="pt-32 pb-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <p className="text-[11px] tracking-[0.5em] uppercase italic text-accent mb-4" style={enFont}>
            Archive · 史料藏馆
          </p>
          <h1 className="font-serif text-4xl md:text-6xl tracking-[0.05em] text-text-primary mb-6 leading-tight">
            数字米轨史料藏馆
          </h1>
          <p className="italic text-text-secondary text-base md:text-lg leading-relaxed max-w-2xl mb-3" style={enFont}>
            A century of photographs, blueprints, journals and voices —
            <br className="hidden md:block" />
            tracing the steel spine across mountains and time.
          </p>
          <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
            收录百年滇越铁路的珍贵史料，包括老照片、文献档案、工程图纸、手绘地图与口述记忆，按时期与类型多维归档。
          </p>
        </div>
      </section>

      <section className="border-y border-border-subtle bg-surface-2/50">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-8">
          <div className="grid md:grid-cols-[1fr_1fr_auto] gap-8 items-start">
            <div>
              <p className="text-[10px] tracking-[0.4em] uppercase italic text-text-muted mb-3" style={enFont}>
                Period · 时期
              </p>
              <div className="flex flex-wrap gap-2">
                <FilterChip active={period === 'all'} onClick={() => setPeriod('all')} label="全部" />
                {(Object.keys(periodLabels) as ArchivePeriod[]).map((p) => (
                  <FilterChip key={p} active={period === p} onClick={() => setPeriod(p)} label={periodLabels[p]} />
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] tracking-[0.4em] uppercase italic text-text-muted mb-3" style={enFont}>
                Type · 类型
              </p>
              <div className="flex flex-wrap gap-2">
                <FilterChip active={type === 'all'} onClick={() => setType('all')} label="全部" />
                {(Object.keys(typeLabels) as ArchiveType[]).map((t) => (
                  <FilterChip key={t} active={type === t} onClick={() => setType(t)} label={typeLabels[t]} />
                ))}
              </div>
            </div>

            <div className="md:w-64">
              <p className="text-[10px] tracking-[0.4em] uppercase italic text-text-muted mb-3" style={enFont}>
                Search · 关键词
              </p>
              <input
                type="search"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="标题 / 描述 / 来源…"
                className="w-full px-3 py-2 bg-surface-1 border border-border-hard text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-border-subtle pt-4">
            <p className="text-[11px] tracking-[0.3em] uppercase italic text-text-muted" style={enFont}>
              Showing <span className="text-accent">{filtered.length}</span> of {archives.length} records
            </p>
            {(period !== 'all' || type !== 'all' || keyword) && (
              <button
                onClick={() => { setPeriod('all'); setType('all'); setKeyword(''); }}
                className="text-[11px] tracking-wider text-text-secondary hover:text-accent transition-colors italic"
                style={enFont}
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 py-16">
        <div className="max-w-6xl mx-auto">
          {filtered.length === 0 ? (
            <div className="py-32 text-center">
              <p className="text-[11px] tracking-[0.4em] uppercase italic text-text-muted mb-3" style={enFont}>
                No matching records
              </p>
              <p className="font-serif text-xl text-text-secondary">
                {archives.length === 0 ? '藏馆暂无已发布资料' : '未找到匹配的史料'}
              </p>
            </div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
              {filtered.map((item) => (
                <ArchiveCard key={item.id} item={item} onClick={() => setActiveId(item.id)} />
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="py-10 border-t border-border-subtle">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-sm tracking-[0.2em] text-text-primary">云上米轨</span>
            <span className="text-[10px] tracking-[0.4em] uppercase italic text-text-muted" style={enFont}>
              Yunshang Migui
            </span>
          </div>
          <p className="text-[10px] tracking-[0.3em] uppercase italic text-text-muted" style={enFont}>
            © 2026 · Dianyue Railway Digital Heritage Platform
          </p>
        </div>
      </footer>

      {active && <Lightbox item={active} onClose={() => setActiveId(null)} />}
    </main>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs tracking-wider border transition-all duration-200 ${
        active
          ? 'border-accent text-accent bg-accent/10'
          : 'border-border-hard text-text-secondary hover:border-accent/60 hover:text-text-primary'
      }`}
    >
      {label}
    </button>
  );
}

function ArchiveCard({ item, onClick }: { item: ArchiveItem; onClick: () => void }) {
  return (
    <article
      onClick={onClick}
      className="break-inside-avoid mb-6 group cursor-pointer bg-surface-1 border border-border-subtle hover:border-accent/50 transition-all duration-300 hover:shadow-[0_18px_36px_-20px_rgba(168,136,74,0.35)]"
    >
      <div className="relative overflow-hidden bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.coverUrl}
          alt={item.title}
          width={800}
          height={item.height}
          loading="lazy"
          decoding="async"
          className="w-full h-auto block transition-transform duration-700 group-hover:scale-[1.04]"
          style={{ filter: 'sepia(0.18) contrast(0.96)' }}
        />
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <span
            className="text-[10px] tracking-[0.6em] uppercase italic text-white/35 select-none"
            style={{ ...enFont, transform: 'rotate(-28deg)', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
          >
            云上米轨 · YUNSHANG MIGUI
          </span>
        </div>
        <div className="absolute top-3 left-3 px-2 py-1 bg-background/85 backdrop-blur-sm border border-border-subtle">
          <span className="text-[9px] tracking-[0.3em] uppercase italic text-text-secondary" style={enFont}>
            {typeLabels[item.type]}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-[10px] tracking-[0.4em] uppercase italic text-accent" style={enFont}>
            {periodEn[item.period]}
          </span>
          <span className="text-[10px] text-text-muted">·</span>
          <span className="text-[10px] tracking-[0.3em] italic text-text-muted" style={enFont}>
            {item.year}
          </span>
        </div>

        <h3 className="font-serif text-lg tracking-[0.1em] text-text-primary mb-2 group-hover:text-accent transition-colors">
          {item.title}
        </h3>

        <p className="text-[13px] text-text-secondary leading-relaxed mb-4">
          {item.description}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
          <span className="text-[10px] tracking-[0.2em] italic text-text-muted" style={enFont}>
            {item.source}
          </span>
          <span className="text-[10px] tracking-[0.3em] uppercase italic text-text-muted group-hover:text-accent transition-colors" style={enFont}>
            View →
          </span>
        </div>
      </div>
    </article>
  );
}

function Lightbox({ item, onClose }: { item: ArchiveItem; onClose: () => void }) {
  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-[rgba(20,18,14,0.95)] animate-[lightbox-in_280ms_ease-out] flex items-center justify-center p-6"
    >
      <button
        onClick={onClose}
        aria-label="关闭"
        className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center border border-white/30 text-white/80 hover:border-accent hover:text-accent transition-colors text-xl"
      >
        ×
      </button>

      <div
        className="relative max-w-5xl w-full grid md:grid-cols-[1.4fr_1fr] gap-0 bg-background border border-accent/30 max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-surface-2 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.coverUrl}
            alt={item.title}
            className="max-w-full max-h-[88vh] object-contain"
            style={{ filter: 'sepia(0.18) contrast(0.96)' }}
          />
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <span
              className="text-base md:text-2xl tracking-[0.6em] uppercase italic text-white/25 select-none"
              style={{ ...enFont, transform: 'rotate(-28deg)' }}
            >
              云上米轨 · YUNSHANG MIGUI
            </span>
          </div>
        </div>

        <div className="p-6 md:p-8 flex flex-col overflow-y-auto max-h-[88vh]">
          <p className="text-[10px] tracking-[0.4em] uppercase italic text-accent mb-3" style={enFont}>
            {periodEn[item.period]} · {item.year}
          </p>
          <h2 className="font-serif text-2xl md:text-3xl tracking-[0.08em] text-text-primary mb-2 leading-tight">
            {item.title}
          </h2>
          <p className="italic text-text-secondary text-sm mb-6" style={enFont}>
            {typeLabels[item.type]}
          </p>

          <p className="text-sm text-text-secondary leading-loose mb-6">
            {item.description}
          </p>

          <dl className="space-y-3 text-xs border-t border-border-subtle pt-5">
            <div className="flex">
              <dt className="w-24 tracking-[0.3em] uppercase italic text-text-muted" style={enFont}>Period</dt>
              <dd className="text-text-primary">{periodLabels[item.period]}</dd>
            </div>
            <div className="flex">
              <dt className="w-24 tracking-[0.3em] uppercase italic text-text-muted" style={enFont}>Source</dt>
              <dd className="text-text-primary">{item.source}</dd>
            </div>
            <div className="flex">
              <dt className="w-24 tracking-[0.3em] uppercase italic text-text-muted" style={enFont}>Record</dt>
              <dd className="text-text-primary uppercase tracking-wider">{item.id.slice(0, 8)}</dd>
            </div>
          </dl>

          <div className="mt-auto pt-8 space-y-4">
            <Link
              href={{
                pathname: '/ai',
                query: {
                  q: `请帮我解读这条史料：《${item.title}》（${item.year} 年，${periodLabels[item.period]}）。${item.description}`,
                  from: `archive:${item.id}`,
                },
              }}
              className="group relative flex items-center justify-between border-2 border-cinnabar bg-cinnabar/[0.04] hover:bg-cinnabar hover:text-[#f8f5ee] text-cinnabar transition-all duration-200 px-5 py-3.5"
            >
              <div className="flex items-center gap-3">
                <span
                  className="archive-label text-cinnabar group-hover:text-[#f8f5ee]/80 transition-colors"
                  style={{ fontFamily: 'var(--font-typewriter)' }}
                >
                  ASK NANDU AI
                </span>
                <span className="font-serif text-base tracking-[0.15em]">问问南渡</span>
              </div>
              <span className="font-serif text-lg group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <div className="border border-migui-yellow/50 bg-migui-yellow/[0.06] p-4">
              <p className="text-[10px] tracking-[0.4em] uppercase italic text-migui-yellow mb-2" style={enFont}>
                VIP Access
              </p>
              <p className="text-xs text-text-secondary leading-relaxed">
                成为「云上米轨」会员，解锁无水印高清原图与完整档案下载。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
