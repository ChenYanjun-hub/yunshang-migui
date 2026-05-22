'use client';

import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';

const trainNavItems = [
  {
    href: '/archive',
    no: '01',
    icon: '档',
    title: '史料藏馆',
    desc: '百年档案 · 数字珍藏',
    en: 'Archive',
  },
  {
    href: '/cloud-tour',
    no: '02',
    icon: '览',
    title: '云游导览',
    desc: 'GIS 地图 · VR 全景',
    en: 'Cloud Tour',
  },
  {
    href: '/exhibition',
    no: '03',
    icon: '影',
    title: '光影展览',
    desc: '3D 照片墙 · UGC',
    en: 'Exhibition',
  },
  {
    href: '/community',
    no: '04',
    icon: '社',
    title: '研学社区',
    desc: 'AI 答疑 · 学术论坛',
    en: 'Community',
  },
];

const stats = [
  { value: '855', unit: 'km', label: '全线里程' },
  { value: '32', unit: '', label: '历史站点' },
  { value: '115', unit: '年', label: '历经岁月' },
  { value: '5000', unit: '+', label: '数字史料' },
];

const timelineEras = [
  { year: '1903 — 1910', name: '修建期', desc: '法人主导，七年成线' },
  { year: '1910 — 1940', name: '运营期', desc: '滇越通衢，黄金时代' },
  { year: '1940 — 1980', name: '变迁期', desc: '战火与转折' },
  { year: '2000 — 至今', name: '遗产保护', desc: '工业记忆，文化延续' },
];

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden page-fade-in">
      {/* 地图底纹 */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 pointer-events-none overflow-hidden flex items-center justify-center"
      >
        <img
          src="/images/overall-map.png"
          alt=""
          className="w-[130vw] md:w-[105vw] max-w-[1600px] select-none"
          style={{
            mixBlendMode: 'multiply',
            opacity: 0.22,
            filter: 'sepia(0.45) saturate(0.45) contrast(0.9)',
          }}
        />
      </div>

      <Navigation />

      {/* ============ HERO ============ */}
      <section className="min-h-screen flex flex-col items-center justify-center px-5 md:px-6 pt-20 md:pt-24 pb-12">
        <p
          className="archive-label mb-6 md:mb-8 flex items-center gap-2 md:gap-3 text-[9.5px] md:text-xs text-center"
          style={{ fontFamily: 'var(--font-typewriter)' }}
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-cinnabar" />
          <span className="md:hidden">RECORD · EST. 1910</span>
          <span className="hidden md:inline">RECORD · DIANYUE RAILWAY · EST. 1910</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-cinnabar" />
        </p>

        <h1 className="font-serif text-[2.5rem] md:text-7xl lg:text-[5.5rem] font-medium leading-[1.15] tracking-wide text-center text-text-primary">
          一条<span className="text-migui-yellow">云上米轨</span>
          <br />
          半部西南近代史
        </h1>

        <div className="flex items-center gap-4 mt-10">
          <span className="block w-12 h-px bg-border-hard" />
          <span className="block w-1 h-1 rounded-full bg-cinnabar" />
          <span
            className="text-[10px] tracking-[0.4em] uppercase italic text-text-secondary"
            style={enFont}
          >
            The Steel Spine Through Time
          </span>
          <span className="block w-1 h-1 rounded-full bg-cinnabar" />
          <span className="block w-12 h-px bg-border-hard" />
        </div>

        {/* ============ TRAIN-CARRIAGE NAV ============ */}
        <div className="w-full max-w-6xl mt-12 md:mt-20" style={{ perspective: '1400px' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {trainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="carriage group relative block bg-surface-1/95 backdrop-blur-sm border border-border-hard/60
                           shadow-[0_1px_4px_rgba(26,24,20,0.06)]
                           transition-[transform,box-shadow,border-color] duration-500 ease-out
                           hover:border-accent/60 hover:shadow-[0_8px_24px_rgba(26,24,20,0.12)]"
              >
                {/* 车顶金条 */}
                <div className="absolute top-0 left-3 right-3 h-[3px] bg-accent/70" />

                <div className="px-3 md:px-5 pt-5 md:pt-7 pb-4 md:pb-6">
                  {/* 车厢编号 —— 档案档号印章感 */}
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <span
                      className="px-1.5 py-0.5 text-[8.5px] md:text-[9px] tracking-[0.25em] md:tracking-[0.3em] uppercase text-cinnabar italic border border-cinnabar/40 bg-cinnabar-soft"
                      style={enFont}
                    >
                      No.{item.no}
                    </span>
                    <span className="block w-3 md:w-4 h-px bg-border-hard" />
                  </div>

                  {/* 中文图标 */}
                  <div
                    className="mx-auto mb-4 md:mb-6 w-10 h-10 md:w-14 md:h-14 flex items-center justify-center
                               font-serif text-lg md:text-2xl text-accent border border-accent/40
                               group-hover:bg-cinnabar group-hover:border-cinnabar group-hover:text-[#f8f5ee]
                               transition-colors duration-500"
                  >
                    {item.icon}
                  </div>

                  <h3 className="font-serif text-[15px] md:text-lg text-center tracking-[0.1em] md:tracking-[0.15em] text-text-primary mb-1 md:mb-1.5 leading-tight">
                    {item.title}
                  </h3>
                  <p
                    className="text-[10px] md:text-[11px] text-center tracking-[0.2em] md:tracking-[0.25em] uppercase italic text-text-muted mb-2 md:mb-4"
                    style={enFont}
                  >
                    {item.en}
                  </p>
                  <p className="text-[11px] md:text-[12px] text-center text-text-secondary leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {/* 车窗细节 */}
                <div className="border-t border-border-subtle px-5 py-2 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 border border-border-hard" />
                    <span className="w-2 h-2 border border-border-hard" />
                    <span className="w-2 h-2 border border-border-hard" />
                  </div>
                  <span
                    className="text-[9px] tracking-[0.3em] uppercase text-text-muted italic
                               group-hover:text-accent transition-colors duration-500
                               inline-flex items-center gap-1"
                    style={enFont}
                  >
                    Enter
                    <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* 铁轨 */}
          <div className="relative mt-8 mx-4">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
            <div className="h-px w-full mt-1.5 bg-[repeating-linear-gradient(to_right,var(--accent-gold)_0_8px,transparent_8px_18px)] opacity-40" />
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="py-16 md:py-32 border-y border-border-subtle bg-background/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-5 md:px-6">
          <div className="text-center mb-10 md:mb-16">
            <p
              className="text-[11px] tracking-[0.5em] uppercase italic text-accent mb-4"
              style={enFont}
            >
              In Numbers
            </p>
            <h2 className="font-serif text-2xl md:text-3xl tracking-[0.15em] text-text-primary">
              百年米轨 · 数据切片
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border-subtle">
            {stats.map((stat, index) => (
              <div key={index} className="bg-background px-3 md:px-6 py-7 md:py-10 text-center">
                <div className="font-serif text-3xl md:text-6xl font-medium text-text-primary mb-2 md:mb-3 tracking-tight">
                  {stat.value}
                  <span className="text-base md:text-xl text-cinnabar ml-1 font-normal">{stat.unit}</span>
                </div>
                <div
                  className="text-[10px] text-text-muted tracking-[0.4em] uppercase italic"
                  style={enFont}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TIMELINE ============ */}
      <section className="py-16 md:py-32">
        <div className="max-w-6xl mx-auto px-5 md:px-6">
          <div className="text-center mb-12 md:mb-20">
            <p
              className="text-[11px] tracking-[0.5em] uppercase italic text-accent mb-4"
              style={enFont}
            >
              Timeline
            </p>
            <h2 className="font-serif text-2xl md:text-4xl tracking-[0.1em] text-text-primary mb-4">
              穿越百年时空
            </h2>
            <p className="text-sm text-text-secondary max-w-xl mx-auto leading-relaxed">
              从滇越铁路的修建到今日的遗产保护，沿米轨追溯每一个重要刻度。
            </p>
          </div>

          {/* 横向时间轴 */}
          <div className="relative">
            {/* 主轴线 */}
            <div className="hidden md:block absolute top-3 left-0 right-0 h-px bg-border-subtle" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
              {timelineEras.map((era, index) => (
                <div key={index} className="group relative cursor-pointer">
                  {/* 节点 —— 默认金边，hover 朱砂填充：穿越百年的"重要刻度" */}
                  <div className="hidden md:flex justify-center mb-8">
                    <span className="w-3 h-3 border border-accent bg-background relative z-10 group-hover:bg-cinnabar group-hover:border-cinnabar transition-colors" />
                  </div>

                  <div className="text-center md:text-left md:px-2">
                    <div
                      className="text-[10px] tracking-[0.4em] uppercase italic text-text-muted mb-2"
                      style={enFont}
                    >
                      Phase {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="font-serif text-lg md:text-xl text-text-primary mb-3 tracking-wider group-hover:text-accent transition-colors">
                      {era.year}
                    </div>
                    <div className="text-sm text-text-secondary mb-1">{era.name}</div>
                    <div className="text-xs text-text-muted leading-relaxed">{era.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="py-20 md:py-32 text-center border-t border-border-subtle bg-background/80 backdrop-blur-sm">
        <p
          className="text-[10px] md:text-[11px] tracking-[0.4em] md:tracking-[0.5em] uppercase italic text-accent mb-4 md:mb-6"
          style={enFont}
        >
          Begin Your Journey
        </p>
        <h2 className="font-serif text-2xl md:text-4xl tracking-[0.08em] md:tracking-[0.1em] text-text-primary mb-8 md:mb-12">
          开启你的米轨之旅
        </h2>
        {/* 移动端：竖排、按钮等宽撑满，避免 tracking 撑爆 */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center sm:flex-wrap px-5 md:px-6 max-w-md sm:max-w-none mx-auto">
          <Link
            href="/cloud-tour"
            className="group px-6 sm:px-10 py-3.5 md:py-4 bg-accent text-background border border-accent
                       text-sm tracking-[0.2em] md:tracking-[0.25em] transition-all duration-300
                       hover:bg-transparent hover:text-accent"
          >
            开始云游 <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <Link
            href="/archive"
            className="px-6 sm:px-10 py-3.5 md:py-4 bg-transparent text-text-primary border border-border-hard
                       text-sm tracking-[0.2em] md:tracking-[0.25em] transition-all duration-300
                       hover:border-accent hover:text-accent"
          >
            探索史料
          </Link>
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
    </main>
  );
}
