'use client';

import { useEffect, useMemo, useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import type { ArchivePeriod, ArchiveType } from '@/types';

type ArchiveItem = {
  id: string;
  title: string;
  period: ArchivePeriod;
  type: ArchiveType;
  year: number;
  description: string;
  source: string;
  height: number;
};

const mockArchives: ArchiveItem[] = [
  { id: 'a01', title: '碧色寨车站旧影', period: 'operation', type: 'photo', year: 1920, description: '碧色寨曾是滇越铁路上最重要的中转站之一，中法风格建筑在彩云之南留下独特注脚。', source: '云南省档案馆', height: 900 },
  { id: 'a02', title: '人字桥工程图纸', period: 'construction', type: 'blueprint', year: 1907, description: '法国工程师 Paul Bodin 设计的"人字桥"原稿，是世界铁路史上著名的悬臂结构杰作。', source: '中国铁道博物馆', height: 1100 },
  { id: 'a03', title: '昆明站通车典礼', period: 'operation', type: 'photo', year: 1910, description: '1910年4月1日全线通车典礼瞬间，标志着中国西南第一条国际铁路正式运营。', source: '昆明铁路局史志', height: 700 },
  { id: 'a04', title: '筑路劳工口述实录', period: 'construction', type: 'oral_history', year: 1908, description: '七年间，约二十万劳工在崇山峻岭之间开凿铁路。这是其中一位老人的口述。', source: '红河州地方志', height: 800 },
  { id: 'a05', title: '河口口岸老照片', period: 'republic', type: 'photo', year: 1935, description: '中越边境河口，米轨抵达国境的最后一站。拍摄者为法国人类学家。', source: '法国远东学院', height: 1000 },
  { id: 'a06', title: '米轨列车时刻表', period: 'prc', type: 'document', year: 1960, description: '建国后人民铁路接管运营，发布的早期客运时刻表，沿线 32 站皆有标注。', source: '昆明铁路局', height: 600 },
  { id: 'a07', title: '滇越铁路全线手绘图', period: 'construction', type: 'map', year: 1910, description: '通车之初官方测绘的全线纵断面图，沿河谷与山脊蜿蜒 855 公里。', source: '法国国家图书馆', height: 750 },
  { id: 'a08', title: '蒙自海关报关簿', period: 'republic', type: 'document', year: 1928, description: '蒙自海关进出口货物登记册，反映当年中越贸易往来的繁盛。', source: '蒙自市档案馆', height: 850 },
  { id: 'a09', title: '寻甸段铁路弯道', period: 'operation', type: 'photo', year: 1925, description: '滇越铁路著名的"S 形弯"，铁轨在喀斯特地貌中盘桓而下。', source: '云南省图书馆', height: 700 },
  { id: 'a10', title: '法文《滇越铁路报》', period: 'operation', type: 'newspaper', year: 1915, description: '当年的中法双语报刊，刊载沿线运营、文化、商贸消息。', source: '上海图书馆', height: 950 },
  { id: 'a11', title: '芷村机车检修车间', period: 'prc', type: 'photo', year: 1972, description: '芷村是米轨机车的核心维修基地，至今仍保留法式厂房旧貌。', source: '红河州档案馆', height: 800 },
  { id: 'a12', title: '滇越铁路文化遗产保护方案', period: 'heritage', type: 'document', year: 2018, description: '世界文化遗产申报阶段提交的保护规划文本（节选）。', source: '云南省文物局', height: 700 },
  { id: 'a13', title: '碧色寨现存建筑测绘', period: 'heritage', type: 'blueprint', year: 2015, description: '当代建筑师对碧色寨的现状测绘，记录每一道砖石的现存状态。', source: '同济大学历史建筑研究中心', height: 900 },
  { id: 'a14', title: '蒙自南湖站台', period: 'operation', type: 'photo', year: 1918, description: '蒙自南湖之畔的小站，曾是茶马商旅与法籍铁路员工共聚的场所。', source: '蒙自档案馆', height: 1050 },
  { id: 'a15', title: '云南军阀通电反对铁路条约', period: 'republic', type: 'newspaper', year: 1923, description: '当年地方报刊对滇越铁路条约修订的争论，反映民族铁路意识的觉醒。', source: '云南省图书馆', height: 700 },
  { id: 'a16', title: '滇南民歌录音', period: 'prc', type: 'oral_history', year: 1985, description: '沿米轨地区采集的彝、壮、苗族民歌，记录了铁路与少数民族文化的交融。', source: '云南民族大学', height: 600 },
];

const periodLabels: Record<ArchivePeriod, string> = {
  construction: '修建期',
  operation: '运营期',
  republic: '民国时期',
  prc: '建国后',
  heritage: '遗产保护',
};

const periodEn: Record<ArchivePeriod, string> = {
  construction: 'Construction',
  operation: 'Operation',
  republic: 'Republic Era',
  prc: 'PRC Era',
  heritage: 'Heritage',
};

const typeLabels: Record<ArchiveType, string> = {
  photo: '老照片',
  document: '文献',
  map: '手绘地图',
  blueprint: '工程图纸',
  newspaper: '报刊剪报',
  oral_history: '口述史',
};

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

const imageUrl = (id: string, h: number) =>
  `https://picsum.photos/seed/yunshang-${id}/800/${h}?grayscale`;

export default function ArchivePage() {
  const [period, setPeriod] = useState<ArchivePeriod | 'all'>('all');
  const [type, setType] = useState<ArchiveType | 'all'>('all');
  const [keyword, setKeyword] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return mockArchives.filter((item) => {
      if (period !== 'all' && item.period !== period) return false;
      if (type !== 'all' && item.type !== type) return false;
      if (keyword.trim()) {
        const k = keyword.trim().toLowerCase();
        if (
          !item.title.toLowerCase().includes(k) &&
          !item.description.toLowerCase().includes(k) &&
          !item.source.toLowerCase().includes(k)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [period, type, keyword]);

  const active = useMemo(
    () => mockArchives.find((it) => it.id === activeId) ?? null,
    [activeId]
  );

  // ESC closes lightbox
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveId(null);
    };
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

      {/* ============ HEADER ============ */}
      <section className="pt-32 pb-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <p
            className="text-[11px] tracking-[0.5em] uppercase italic text-accent mb-4"
            style={enFont}
          >
            Archive · 史料藏馆
          </p>
          <h1 className="font-serif text-4xl md:text-6xl tracking-[0.05em] text-text-primary mb-6 leading-tight">
            数字米轨史料藏馆
          </h1>
          <p
            className="italic text-text-secondary text-base md:text-lg leading-relaxed max-w-2xl mb-3"
            style={enFont}
          >
            A century of photographs, blueprints, journals and voices —
            <br className="hidden md:block" />
            tracing the steel spine across mountains and time.
          </p>
          <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
            收录百年滇越铁路的珍贵史料，包括老照片、文献档案、工程图纸、手绘地图与口述记忆，
            按时期与类型多维归档。
          </p>
        </div>
      </section>

      {/* ============ FILTER BAR ============ */}
      <section className="border-y border-border-subtle bg-surface-2/50">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-8">
          <div className="grid md:grid-cols-[1fr_1fr_auto] gap-8 items-start">
            {/* Period */}
            <div>
              <p
                className="text-[10px] tracking-[0.4em] uppercase italic text-text-muted mb-3"
                style={enFont}
              >
                Period · 时期
              </p>
              <div className="flex flex-wrap gap-2">
                <FilterChip
                  active={period === 'all'}
                  onClick={() => setPeriod('all')}
                  label="全部"
                />
                {(Object.keys(periodLabels) as ArchivePeriod[]).map((p) => (
                  <FilterChip
                    key={p}
                    active={period === p}
                    onClick={() => setPeriod(p)}
                    label={periodLabels[p]}
                  />
                ))}
              </div>
            </div>

            {/* Type */}
            <div>
              <p
                className="text-[10px] tracking-[0.4em] uppercase italic text-text-muted mb-3"
                style={enFont}
              >
                Type · 类型
              </p>
              <div className="flex flex-wrap gap-2">
                <FilterChip
                  active={type === 'all'}
                  onClick={() => setType('all')}
                  label="全部"
                />
                {(Object.keys(typeLabels) as ArchiveType[]).map((t) => (
                  <FilterChip
                    key={t}
                    active={type === t}
                    onClick={() => setType(t)}
                    label={typeLabels[t]}
                  />
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="md:w-64">
              <p
                className="text-[10px] tracking-[0.4em] uppercase italic text-text-muted mb-3"
                style={enFont}
              >
                Search · 关键词
              </p>
              <input
                type="search"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="标题 / 描述 / 来源…"
                className="w-full px-3 py-2 bg-surface-1 border border-border-hard
                           text-sm text-text-primary placeholder:text-text-muted
                           focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          {/* Result count */}
          <div className="mt-6 flex items-center justify-between border-t border-border-subtle pt-4">
            <p
              className="text-[11px] tracking-[0.3em] uppercase italic text-text-muted"
              style={enFont}
            >
              Showing <span className="text-accent">{filtered.length}</span> of {mockArchives.length} records
            </p>
            {(period !== 'all' || type !== 'all' || keyword) && (
              <button
                onClick={() => {
                  setPeriod('all');
                  setType('all');
                  setKeyword('');
                }}
                className="text-[11px] tracking-wider text-text-secondary hover:text-accent transition-colors italic"
                style={enFont}
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ============ MASONRY GRID ============ */}
      <section className="px-6 md:px-12 py-16">
        <div className="max-w-6xl mx-auto">
          {filtered.length === 0 ? (
            <div className="py-32 text-center">
              <p
                className="text-[11px] tracking-[0.4em] uppercase italic text-text-muted mb-3"
                style={enFont}
              >
                No matching records
              </p>
              <p className="font-serif text-xl text-text-secondary">
                未找到匹配的史料
              </p>
            </div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
              {filtered.map((item) => (
                <ArchiveCard
                  key={item.id}
                  item={item}
                  onClick={() => setActiveId(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="py-10 border-t border-border-subtle">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-sm tracking-[0.2em] text-text-primary">云上米轨</span>
            <span
              className="text-[10px] tracking-[0.4em] uppercase italic text-text-muted"
              style={enFont}
            >
              Yunshang Migui
            </span>
          </div>
          <p
            className="text-[10px] tracking-[0.3em] uppercase italic text-text-muted"
            style={enFont}
          >
            © 2026 · Dianyue Railway Digital Heritage Platform
          </p>
        </div>
      </footer>

      {/* ============ LIGHTBOX ============ */}
      {active && (
        <Lightbox item={active} onClose={() => setActiveId(null)} />
      )}
    </main>
  );
}

// ============================================================
// 子组件
// ============================================================

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs tracking-wider border transition-all duration-200
        ${
          active
            ? 'border-accent text-accent bg-accent/10'
            : 'border-border-hard text-text-secondary hover:border-accent/60 hover:text-text-primary'
        }`}
    >
      {label}
    </button>
  );
}

function ArchiveCard({
  item,
  onClick,
}: {
  item: ArchiveItem;
  onClick: () => void;
}) {
  return (
    <article
      onClick={onClick}
      className="break-inside-avoid mb-6 group cursor-pointer
                 bg-surface-1 border border-border-subtle
                 hover:border-accent/50 transition-all duration-300
                 hover:shadow-[0_18px_36px_-20px_rgba(168,136,74,0.35)]"
    >
      {/* 图片 + 水印 */}
      <div className="relative overflow-hidden bg-surface-2">
        <img
          src={imageUrl(item.id, item.height)}
          alt={item.title}
          width={800}
          height={item.height}
          loading="lazy"
          decoding="async"
          className="w-full h-auto block transition-transform duration-700 group-hover:scale-[1.04]"
          style={{ filter: 'sepia(0.18) contrast(0.96)' }}
        />
        {/* 水印 */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <span
            className="text-[10px] tracking-[0.6em] uppercase italic text-white/35 select-none"
            style={{ ...enFont, transform: 'rotate(-28deg)', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
          >
            云上米轨 · YUNSHANG MIGUI
          </span>
        </div>
        {/* 类型徽章 */}
        <div className="absolute top-3 left-3 px-2 py-1 bg-background/85 backdrop-blur-sm border border-border-subtle">
          <span
            className="text-[9px] tracking-[0.3em] uppercase italic text-text-secondary"
            style={enFont}
          >
            {typeLabels[item.type]}
          </span>
        </div>
      </div>

      {/* 文字 */}
      <div className="p-5">
        <div className="flex items-baseline gap-2 mb-3">
          <span
            className="text-[10px] tracking-[0.4em] uppercase italic text-accent"
            style={enFont}
          >
            {periodEn[item.period]}
          </span>
          <span className="text-[10px] text-text-muted">·</span>
          <span
            className="text-[10px] tracking-[0.3em] italic text-text-muted"
            style={enFont}
          >
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
          <span
            className="text-[10px] tracking-[0.2em] italic text-text-muted"
            style={enFont}
          >
            {item.source}
          </span>
          <span
            className="text-[10px] tracking-[0.3em] uppercase italic text-text-muted
                       group-hover:text-accent transition-colors"
            style={enFont}
          >
            View →
          </span>
        </div>
      </div>
    </article>
  );
}

function Lightbox({
  item,
  onClose,
}: {
  item: ArchiveItem;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12
                 bg-[rgba(20,18,14,0.92)] backdrop-blur-sm
                 animate-[page-fade-in_320ms_ease-out_both]"
    >
      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        aria-label="关闭"
        className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center
                   border border-white/30 text-white/80 hover:border-accent hover:text-accent
                   transition-colors text-xl"
      >
        ×
      </button>

      <div
        className="relative max-w-6xl w-full max-h-full grid md:grid-cols-[1.6fr_1fr] gap-6 md:gap-10
                   bg-background border border-accent/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 图片区 */}
        <div className="relative bg-surface-2 flex items-center justify-center min-h-[50vh]">
          <img
            src={imageUrl(item.id, Math.max(item.height, 1100))}
            alt={item.title}
            className="max-w-full max-h-[80vh] object-contain"
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

        {/* 信息区 */}
        <div className="p-6 md:p-8 flex flex-col">
          <p
            className="text-[10px] tracking-[0.4em] uppercase italic text-accent mb-3"
            style={enFont}
          >
            {periodEn[item.period]} · {item.year}
          </p>
          <h2 className="font-serif text-2xl md:text-3xl tracking-[0.08em] text-text-primary mb-2 leading-tight">
            {item.title}
          </h2>
          <p
            className="italic text-text-secondary text-sm mb-6"
            style={enFont}
          >
            {typeLabels[item.type]}
          </p>

          <p className="text-sm text-text-secondary leading-loose mb-6">
            {item.description}
          </p>

          <dl className="space-y-3 text-xs border-t border-border-subtle pt-5">
            <div className="flex">
              <dt
                className="w-24 tracking-[0.3em] uppercase italic text-text-muted"
                style={enFont}
              >
                Period
              </dt>
              <dd className="text-text-primary">{periodLabels[item.period]}</dd>
            </div>
            <div className="flex">
              <dt
                className="w-24 tracking-[0.3em] uppercase italic text-text-muted"
                style={enFont}
              >
                Source
              </dt>
              <dd className="text-text-primary">{item.source}</dd>
            </div>
            <div className="flex">
              <dt
                className="w-24 tracking-[0.3em] uppercase italic text-text-muted"
                style={enFont}
              >
                Record
              </dt>
              <dd className="text-text-primary uppercase tracking-wider">{item.id}</dd>
            </div>
          </dl>

          <div className="mt-auto pt-8">
            <div className="border border-accent/40 bg-accent/5 p-4">
              <p
                className="text-[10px] tracking-[0.4em] uppercase italic text-accent mb-2"
                style={enFont}
              >
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
}
