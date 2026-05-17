'use client';

import { stations, mainLine } from '@/data/migui-line';
import { computeBounds, createProjection } from '@/lib/geo/project';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;
const twFont = { fontFamily: 'var(--font-typewriter)' } as const;

// 数据是静态的，模块加载时投影一次即可。
// 非对称 padding 用于规避页面覆盖层：
//   top: 30  ← 让出 fixed Navigation（z-50, ~70px）+ 标题块（top-28 起，h~120px）
//   right: 22 ← 让出 L1/L2/L3 层级面板（top-28 right-12, w~200px）
//   bottom: 14 ← station info card 在 md+ 是左下角，右下空，留少许即可
//   left: 12 ← 标题块下方留出空间，但避免站点贴边
const bounds = computeBounds(stations.map((s) => s.coord));
const projection = createProjection(bounds, {
  width: 100,
  height: 100,
  padding: { top: 30, right: 22, bottom: 14, left: 12 },
});

const projectedStations = stations.map((s) => {
  const [x, y] = projection.project(s.coord);
  return { ...s, xPct: x, yPct: y };
});

const linePath = projection.toPath(mainLine);

interface MiguiMapProps {
  activeStationId: string;
  onSelectStation: (id: string) => void;
}

export function MiguiMap({ activeStationId, onSelectStation }: MiguiMapProps) {
  return (
    <div className="absolute inset-0">
      {/* 底图：滇越铁路全图（sepia + 对比度处理，营造档案/老地图气质） */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/overall-map.png"
          alt=""
          aria-hidden
          className="w-full h-full object-cover"
          style={{ filter: 'sepia(0.45) contrast(0.9) opacity(0.55)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/40" />
      </div>

      {/* 朱砂主线（SVG —— preserveAspectRatio="none" 让线随容器伸缩；
          vector-effect=non-scaling-stroke 让线宽以 CSS 像素计，不被拉伸） */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* 主线实体 */}
        <path
          d={linePath}
          fill="none"
          stroke="var(--cinnabar)"
          strokeOpacity="0.78"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          style={{ strokeWidth: 2 }}
        />
        {/* 主线虚影叠加（手绘感纹理） */}
        <path
          d={linePath}
          fill="none"
          stroke="var(--cinnabar)"
          strokeOpacity="0.4"
          strokeDasharray="2 3"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ strokeWidth: 1 }}
        />
      </svg>

      {/* 站点印章 + 标签（HTML 层，方块不被 SVG 拉伸） */}
      <div className="absolute inset-0">
        {projectedStations.map((s) => {
          const isActive = s.id === activeStationId;
          // 标签默认放右侧；靠近右边缘则改放左侧
          const labelOnLeft = s.xPct > 68;

          return (
            <button
              key={s.id}
              onClick={() => onSelectStation(s.id)}
              className="absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              style={{ left: `${s.xPct}%`, top: `${s.yPct}%` }}
              aria-label={`${s.name} ${s.en}`}
              aria-pressed={isActive}
            >
              {/* 印章方块 —— 呼应首页车厢卡 No.0X 的角标语言 */}
              <span
                className={`relative block w-6 h-6 border transition-all duration-200
                  ${isActive
                    ? 'bg-cinnabar border-cinnabar scale-110 shadow-[0_0_0_3px_var(--cinnabar-soft)]'
                    : 'bg-cinnabar-soft border-cinnabar/60 group-hover:scale-110 group-hover:bg-cinnabar/30'}`}
              >
                <span
                  className={`absolute inset-0 flex items-center justify-center text-[10px] leading-none tracking-tight transition-colors
                    ${isActive ? 'text-[#f8f5ee]' : 'text-cinnabar'}`}
                  style={twFont}
                >
                  {String(s.order).padStart(2, '0')}
                </span>
              </span>

              {/* 英文站名标签 */}
              <span
                className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] tracking-[0.25em] italic transition-opacity duration-200
                  ${labelOnLeft ? 'right-8 text-right' : 'left-8'}
                  ${isActive
                    ? 'text-cinnabar opacity-100'
                    : 'text-text-secondary opacity-70 group-hover:opacity-100'}`}
                style={enFont}
              >
                {s.en}
              </span>
            </button>
          );
        })}
      </div>

      {/* 手作美学小注（仅 md+ 显示，避免在移动端与底部 station 卡片打架） */}
      <p
        className="hidden md:block absolute right-6 text-[9px] tracking-[0.4em] uppercase italic text-text-muted opacity-60 pointer-events-none"
        style={{ ...enFont, bottom: '1.5rem' }}
      >
        Cartography by Hand · 仿 1910 滇越铁路全图
      </p>
    </div>
  );
}
