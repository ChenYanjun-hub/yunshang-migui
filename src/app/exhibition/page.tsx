import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { createClient } from '@/lib/supabase/server';
import {
  ExhibitionWall,
  ExhibitionGridFallback,
  type WallItem,
} from '@/components/exhibition/ExhibitionWall';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

const CATEGORY_LABEL: Record<string, string> = {
  photo: '老照片',
  document: '文献',
  map: '手绘地图',
  blueprint: '工程图纸',
  newspaper: '报刊剪报',
  oral_history: '口述史',
};
const ERA_LABEL: Record<string, string> = {
  construction: '修建期',
  operation: '运营期',
  republic: '民国时期',
  prc: '建国后',
  heritage: '遗产保护',
};

export default async function ExhibitionPage() {
  const supabase = await createClient();

  // 主展墙：优先取「老照片」「手绘地图」类，按年份升序，最多 12 件
  const { data: archiveRows } = await supabase
    .from('archives')
    .select('id, title, category, era, year, source, cover_url, image_urls')
    .eq('status', 'published')
    .in('category', ['photo', 'map'])
    .order('year', { ascending: true })
    .limit(12);

  const wallItems: WallItem[] = (archiveRows ?? [])
    .map((r): WallItem | null => {
      const cover =
        r.cover_url ??
        (Array.isArray(r.image_urls) && r.image_urls.length > 0 ? r.image_urls[0] : null);
      if (!cover) return null;
      return {
        id: r.id,
        title: r.title,
        year: r.year ?? null,
        category: CATEGORY_LABEL[r.category] ?? r.category,
        era: ERA_LABEL[r.era] ?? r.era,
        source: r.source ?? null,
        coverUrl: cover,
      };
    })
    .filter((x): x is WallItem => x !== null);

  // 用户作品 gallery（按发布倒序，最多 8 张）
  const { data: galleryRows } = await supabase
    .from('gallery_photos')
    .select('id, title, author, photo_url, taken_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(8);

  const galleryPhotos = galleryRows ?? [];

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
            横向滚动穿越 {wallItems.length || '—'} 件官方馆藏，下方汇集摄影爱好者的米轨创作。
          </p>
        </div>
      </section>

      {/* 主展墙 —— md+ 横向 pin scroll，sm 降级为 2 列 grid */}
      <ExhibitionWall items={wallItems} />
      <ExhibitionGridFallback items={wallItems} />

      {/* USER GALLERY —— 真 UGC 数据 */}
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
              type="button"
              disabled
              title="演示期由管理员代为录入；正式版上线后开放上传"
              className="px-5 py-2.5 text-xs tracking-[0.25em] border border-border-hard text-text-muted cursor-not-allowed"
            >
              上传作品 [soon]
            </button>
          </div>

          {galleryPhotos.length === 0 ? (
            <div className="border border-dashed border-border-subtle py-20 text-center">
              <p
                className="text-[10px] tracking-[0.4em] uppercase italic text-text-muted mb-3"
                style={enFont}
              >
                Awaiting first submissions
              </p>
              <p className="text-sm text-text-secondary">
                等待第一批用户创作 · 管理员可在{' '}
                <Link href="/admin/gallery" className="text-accent hover:underline">
                  /admin/gallery
                </Link>{' '}
                录入
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {galleryPhotos.map((p, i) => (
                <article
                  key={p.id}
                  className="aspect-square bg-surface-1 border border-border-subtle relative overflow-hidden
                             hover:border-accent/50 transition-colors group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.photo_url}
                    alt={p.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                    style={{ filter: 'sepia(0.18) contrast(0.96)' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(20,18,14,0.85)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-2 left-2">
                    <span
                      className="text-[9px] tracking-[0.3em] uppercase italic text-white/90 px-2 py-0.5 bg-[rgba(20,18,14,0.7)]"
                      style={enFont}
                    >
                      No.{String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="font-serif text-xs text-white tracking-[0.08em] leading-tight">
                      {p.title}
                    </p>
                    {p.author && (
                      <p
                        className="text-[10px] italic text-white/75 mt-0.5"
                        style={enFont}
                      >
                        by {p.author}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
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
