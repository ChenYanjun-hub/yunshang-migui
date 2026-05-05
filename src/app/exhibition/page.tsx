'use client';

import { Navigation } from '@/components/layout/Navigation';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

const exhibitionItems = [
  {
    id: 'e1',
    title: '滇越铁路百年影像记录',
    en: 'A Century in Frames',
    author: '云南省档案馆',
    type: 'Documentary',
    seed: 'expo-1',
    likes: 1234,
  },
  {
    id: 'e2',
    title: '碧色寨光影记忆',
    en: 'Light & Memory of Bisezhai',
    author: '李明',
    type: 'Photo Series',
    seed: 'expo-2',
    likes: 856,
  },
  {
    id: 'e3',
    title: '米轨上的时光',
    en: 'Time Along the Narrow Gauge',
    author: '王晓',
    type: 'Travelogue',
    seed: 'expo-3',
    likes: 672,
  },
  {
    id: 'e4',
    title: '寻找消失的站点',
    en: 'In Search of Lost Stations',
    author: '张华',
    type: 'Essay',
    seed: 'expo-4',
    likes: 445,
  },
];

export default function ExhibitionPage() {
  return (
    <main className="min-h-screen bg-background text-foreground page-fade-in">
      <Navigation />

      {/* HEADER */}
      <section className="pt-32 pb-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <p
            className="text-[11px] tracking-[0.5em] uppercase italic text-accent mb-4"
            style={enFont}
          >
            Exhibition · 光影展
          </p>
          <h1 className="font-serif text-4xl md:text-6xl tracking-[0.05em] text-text-primary mb-6 leading-tight">
            米轨光影展
          </h1>
          <p
            className="italic text-text-secondary text-base md:text-lg leading-relaxed max-w-2xl mb-3"
            style={enFont}
          >
            Films, photographs and quiet stories —
            <br className="hidden md:block" />
            curated alongside the works of those who walked the rails.
          </p>
          <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
            3D 立体照片墙与用户创作专区，集结官方纪录、独立摄影与社区影像。
          </p>
        </div>
      </section>

      {/* FEATURED */}
      <section className="px-6 md:px-12 pb-16 border-y border-border-subtle py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-baseline justify-between mb-10">
            <h2 className="font-serif text-2xl tracking-[0.15em] text-text-primary">精选展览</h2>
            <span
              className="text-[10px] tracking-[0.4em] uppercase italic text-text-muted"
              style={enFont}
            >
              Curated
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exhibitionItems.map((item) => (
              <article
                key={item.id}
                className="group bg-surface-1 border border-border-subtle cursor-pointer
                           transition-all duration-500 hover:border-accent/50
                           hover:shadow-[0_18px_36px_-20px_rgba(168,136,74,0.35)]"
              >
                <div className="relative overflow-hidden aspect-[16/10] bg-surface-2">
                  <img
                    src={`https://picsum.photos/seed/${item.seed}/1200/750?grayscale`}
                    alt={item.title}
                    width={1200}
                    height={750}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    style={{ filter: 'sepia(0.18) contrast(0.96)' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(20,18,14,0.75)] via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 px-2 py-1 bg-background/85 border border-border-subtle">
                    <span
                      className="text-[9px] tracking-[0.3em] uppercase italic text-text-secondary"
                      style={enFont}
                    >
                      {item.type}
                    </span>
                  </div>
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <p
                      className="text-[10px] tracking-[0.3em] uppercase italic text-white/70 mb-1"
                      style={enFont}
                    >
                      {item.en}
                    </p>
                    <h3 className="font-serif text-xl tracking-[0.1em] mb-1">{item.title}</h3>
                    <p
                      className="text-[11px] italic text-white/70"
                      style={enFont}
                    >
                      by {item.author}
                    </p>
                  </div>
                </div>

                <div className="px-5 py-3 flex items-center justify-between border-t border-border-subtle">
                  <span
                    className="text-[10px] tracking-[0.3em] uppercase italic text-text-muted"
                    style={enFont}
                  >
                    ♡ {item.likes.toLocaleString()}
                  </span>
                  <span
                    className="text-[10px] tracking-[0.3em] uppercase italic text-text-muted
                               group-hover:text-accent transition-colors inline-flex items-center gap-1"
                    style={enFont}
                  >
                    Enter
                    <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* USER GALLERY */}
      <section className="px-6 md:px-12 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p
                className="text-[10px] tracking-[0.4em] uppercase italic text-accent mb-2"
                style={enFont}
              >
                User Gallery · UGC
              </p>
              <h2 className="font-serif text-2xl tracking-[0.15em] text-text-primary">用户创作</h2>
            </div>
            <button
              className="px-5 py-2.5 text-xs tracking-[0.25em] border border-accent text-accent
                         hover:bg-accent hover:text-background transition-colors"
            >
              上传作品
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-surface-1 border border-border-subtle relative overflow-hidden
                           hover:border-accent/50 transition-colors cursor-pointer group"
              >
                <img
                  src={`https://picsum.photos/seed/ugc-${i}/600/600?grayscale`}
                  alt={`用户作品 ${i + 1}`}
                  width={600}
                  height={600}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                  style={{ filter: 'sepia(0.18) contrast(0.96)' }}
                />
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <span
                    className="text-[9px] tracking-[0.3em] uppercase italic text-white/90 px-2 py-0.5 bg-[rgba(20,18,14,0.7)]"
                    style={enFont}
                  >
                    No.{String(i + 1).padStart(2, '0')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
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
