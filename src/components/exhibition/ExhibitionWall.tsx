import Link from 'next/link';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;
const twFont = { fontFamily: 'var(--font-typewriter)' } as const;

export type WallItem = {
  id: string;
  title: string;
  year: number | null;
  category: string;       // 老照片 / 手绘地图 等中文 label
  era: string;            // 修建期 / 运营期 等中文 label
  source: string | null;
  coverUrl: string;
};

type Props = {
  items: WallItem[];
};

/**
 * Exhibition β · 横向画卷展墙
 *
 * 设计原则：垂直滚动归页面，横向滚动归画卷 —— 各管各，不劫持。
 *
 * - md+ 启用；sm 屏由 ExhibitionGridFallback 接管（父组件用 hidden md:hidden 切换）
 * - 容器 `overflow-x-auto`，scroll-snap-x 让卡片"咔哒"对齐
 * - 朱砂细滚动条 + 首屏 wiggle 提示 + 左右朱砂渐变边线（"画卷"边界）
 * - 点击卡片 → /archive?open=<id> 复用既有 Lightbox
 *
 * 不需要 'use client' —— 全 CSS / HTML，无 JS 状态。
 */
export function ExhibitionWall({ items }: Props) {
  if (items.length === 0) {
    return (
      <section className="hidden md:flex h-[60vh] items-center justify-center border-y border-border-subtle">
        <div className="text-center">
          <p
            className="text-[10px] tracking-[0.5em] uppercase italic text-text-muted mb-3"
            style={enFont}
          >
            Exhibition Wall
          </p>
          <p className="font-serif text-base text-text-secondary">
            等待录入第一批展品 · 请前往 /admin/archives 添加
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="hidden md:block relative h-[88vh] bg-surface-1 border-y border-border-subtle overflow-hidden"
      aria-label="Exhibition horizontal wall"
    >
      {/* 横向滚动容器 —— 自然滚动 + scroll-snap */}
      <div
        className="exhibition-scroll absolute inset-0 overflow-x-auto overflow-y-hidden"
        style={{
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
        }}
      >
        <div className="exhibition-hint flex items-center h-full" style={{ perspective: '1400px' }}>
          {/* 左侧"画卷起始"留白 */}
          <div className="shrink-0 w-[8vw]" />

          {items.map((item, i) => (
            <ExhibitionPanel key={item.id} item={item} index={i} total={items.length} />
          ))}

          {/* 右侧"画卷收束"留白 */}
          <div className="shrink-0 w-[8vw]" />
        </div>
      </div>

      {/* 左右朱砂渐变边线 —— 画卷边界，不拦点击 */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-cinnabar/15 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-cinnabar/15 to-transparent z-10" />

      {/* 滚动提示 —— 右下角 */}
      <div
        className="pointer-events-none absolute bottom-6 right-8 z-20 flex items-center gap-3 text-[10px] tracking-[0.4em] uppercase italic text-text-muted bg-background/70 px-3 py-2 backdrop-blur-sm"
        style={enFont}
      >
        <span>Swipe to traverse</span>
        <span className="inline-block w-8 h-px bg-cinnabar" />
        <span>{items.length} works</span>
      </div>
    </section>
  );
}

/**
 * 移动端 fallback —— sm 屏由父组件用 `md:hidden` 切换。
 * 同样吃 WallItem[]，渲染成 2 列竖排卡片网格。
 */
export function ExhibitionGridFallback({ items }: { items: WallItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="md:hidden px-6 py-12 border-y border-border-subtle">
      <div className="grid grid-cols-2 gap-3">
        {items.map((item, i) => (
          <Link
            key={item.id}
            href={`/archive?open=${item.id}`}
            className="group relative block aspect-[3/4] bg-background border border-border-subtle overflow-hidden"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.coverUrl}
              alt={item.title}
              className="w-full h-full object-cover"
              style={{ filter: 'sepia(0.18) contrast(0.96)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(20,18,14,0.85)] via-transparent to-transparent" />

            <div className="absolute top-2 left-2 w-8 h-8 border border-cinnabar bg-cinnabar-soft flex items-center justify-center">
              <span className="text-cinnabar text-[10px]" style={twFont}>
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
              <h3 className="font-serif text-sm tracking-[0.08em] leading-tight">{item.title}</h3>
              {item.year !== null && (
                <p className="text-[9px] italic text-white/70 mt-0.5" style={enFont}>
                  {item.year} · {item.era}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ExhibitionPanel({
  item,
  index,
  total,
}: {
  item: WallItem;
  index: number;
  total: number;
}) {
  // 卡片基于位置的轻微 rotateY（"画卷展开"的透视错觉），不依赖滚动状态
  const tilt = (index / Math.max(total - 1, 1) - 0.5) * 5;

  return (
    <div
      className="shrink-0 w-[62vw] lg:w-[52vw] h-full flex items-center justify-center px-6 lg:px-10"
      style={{ scrollSnapAlign: 'center' }}
    >
      <Link
        href={`/archive?open=${item.id}`}
        className="group relative block w-full max-h-[78vh] aspect-[4/5] bg-background border border-border-subtle
                   transition-all duration-500
                   hover:border-cinnabar/60
                   hover:shadow-[0_24px_60px_-25px_rgba(139,46,31,0.55)]"
        style={{
          transform: `rotateY(${tilt}deg)`,
          transformStyle: 'preserve-3d',
        }}
        aria-label={`${item.title} · ${item.year ?? ''}`}
      >
        {/* 主图 */}
        <div className="absolute inset-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.coverUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            style={{ filter: 'sepia(0.18) contrast(0.96)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(20,18,14,0.85)] via-[rgba(20,18,14,0.15)] to-transparent" />
        </div>

        {/* 朱砂 No.0X 印章 —— 左上角，呼应车厢卡 / 米轨站点 */}
        <div className="absolute top-5 left-5 z-10 w-12 h-12 border border-cinnabar bg-cinnabar-soft flex items-center justify-center backdrop-blur-sm">
          <span
            className="text-cinnabar text-sm tracking-tight"
            style={twFont}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        {/* 类型 / 年份 chip —— 右上角 */}
        <div className="absolute top-5 right-5 z-10 flex flex-col items-end gap-1.5">
          <span
            className="px-2 py-1 bg-background/85 border border-border-subtle text-[9px] tracking-[0.3em] uppercase italic text-text-secondary"
            style={enFont}
          >
            {item.category}
          </span>
          {item.year !== null && (
            <span
              className="text-[10px] tracking-[0.3em] italic text-white/80 px-2 py-0.5 bg-[rgba(20,18,14,0.55)]"
              style={enFont}
            >
              {item.year}
            </span>
          )}
        </div>

        {/* 底部信息栏 */}
        <div className="absolute bottom-0 left-0 right-0 p-7 z-10 text-white">
          <p
            className="text-[10px] tracking-[0.4em] uppercase italic text-white/70 mb-2"
            style={enFont}
          >
            {item.era}
          </p>
          <h3 className="font-serif text-2xl lg:text-3xl tracking-[0.08em] leading-tight mb-3">
            {item.title}
          </h3>
          {item.source && (
            <p
              className="text-[11px] italic text-white/65 truncate"
              style={enFont}
            >
              source · {item.source}
            </p>
          )}
          <div className="mt-5 flex items-center gap-2 text-[10px] tracking-[0.35em] uppercase italic text-cinnabar opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span style={enFont}>Open archive</span>
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
