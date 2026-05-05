'use client';

import { Navigation } from '@/components/layout/Navigation';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

const features = [
  {
    no: '01',
    title: '轨迹追踪',
    en: 'Trace',
    desc: '调用设备 GPS 实时绘制行走轨迹，记录时长、速度与高程曲线。',
  },
  {
    no: '02',
    title: '游戏化打卡',
    en: 'Geofence Stamp',
    desc: '靠近站点触发动效，收集解锁电子印章，沿米轨集齐 32 站徽章。',
  },
  {
    no: '03',
    title: 'AR 识别',
    en: 'AR Recognition',
    desc: '对准桥梁与建筑，AR 叠加结构工艺、年代信息与历史照片。',
  },
  {
    no: '04',
    title: 'LBS 语音',
    en: 'Audio Guide',
    desc: '抵达地标自动唤起专业讲解，沿途讲述铁路与人的故事。',
  },
];

export default function OfflineTourPage() {
  return (
    <main className="min-h-screen bg-background text-foreground page-fade-in">
      <Navigation />

      <section className="pt-32 pb-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <p
            className="text-[11px] tracking-[0.5em] uppercase italic text-accent mb-4"
            style={enFont}
          >
            Offline Tour · 线下导览
          </p>
          <h1 className="font-serif text-4xl md:text-6xl tracking-[0.05em] text-text-primary mb-6 leading-tight">
            线下游览导览
          </h1>
          <p
            className="italic text-text-secondary text-base md:text-lg leading-relaxed max-w-2xl mb-3"
            style={enFont}
          >
            Walk the rails — let GPS, AR and audio<br className="hidden md:block" /> open every station as you arrive.
          </p>
          <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
            结合 LBS 与游戏化机制，让现实中的米轨之旅成为可被记录、可被解锁的体验。
          </p>
        </div>
      </section>

      <section className="border-y border-border-subtle px-6 md:px-12 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border-subtle border border-border-subtle">
            {features.map((f) => (
              <div
                key={f.no}
                className="p-8 md:p-10 bg-surface-1 hover:bg-surface-2/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-baseline justify-between mb-6">
                  <span
                    className="text-[10px] tracking-[0.4em] uppercase italic text-text-muted"
                    style={enFont}
                  >
                    No.{f.no} · {f.en}
                  </span>
                  <span className="block w-8 h-px bg-border-hard group-hover:bg-accent transition-colors" />
                </div>
                <h3 className="font-serif text-2xl tracking-[0.12em] text-text-primary mb-3 group-hover:text-accent transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-baseline justify-between mb-10">
            <div>
              <p
                className="text-[10px] tracking-[0.4em] uppercase italic text-accent mb-2"
                style={enFont}
              >
                Live Demo
              </p>
              <h2 className="font-serif text-2xl tracking-[0.15em] text-text-primary">现场试用</h2>
            </div>
          </div>
          <div className="aspect-video bg-surface-1 border border-border-subtle flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-30">
              <img
                src="https://picsum.photos/seed/migui-trail/1600/900?grayscale"
                alt=""
                aria-hidden
                className="w-full h-full object-cover"
                style={{ filter: 'sepia(0.3) contrast(0.95)' }}
              />
            </div>
            <div className="relative text-center">
              <p
                className="text-[10px] tracking-[0.4em] uppercase italic text-text-muted mb-3"
                style={enFont}
              >
                Permission required
              </p>
              <p className="font-serif text-xl text-text-secondary mb-6 tracking-[0.1em]">
                需要授权 GPS 与摄像头权限
              </p>
              <button
                className="px-8 py-3 bg-accent text-background text-xs tracking-[0.3em] uppercase
                           hover:bg-transparent hover:text-accent border border-accent transition-colors"
              >
                Begin · 开启定位
              </button>
            </div>
          </div>
        </div>
      </section>

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
