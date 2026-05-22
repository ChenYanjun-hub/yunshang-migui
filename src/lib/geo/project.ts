/**
 * 经纬度 → SVG viewBox 线性投影
 *
 * 855 km 米轨跨度小（约 2.55° 纬度 × 1.26° 经度），墨卡托畸变可忽略，
 * 直接用线性映射即可。如未来扩到全国/全球数据，再上 d3-geo。
 */

export type LonLat = readonly [number, number];

export interface Bounds {
  minLon: number;
  maxLon: number;
  minLat: number;
  maxLat: number;
}

export interface PaddingBox {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ProjectionOptions {
  /** 投影目标 viewBox 宽度（SVG 单位）。默认 100。 */
  width?: number;
  /** 投影目标 viewBox 高度。若不传，按 bounds 经纬比例自动算。 */
  height?: number;
  /**
   * 内边距（SVG 单位）。传 number 等于四周等边；传对象可单独设置上下左右，
   * 用于规避页面上 nav / 信息面板等覆盖层。默认 4。
   */
  padding?: number | Partial<PaddingBox>;
}

export interface Projection {
  width: number;
  height: number;
  padding: PaddingBox;
  bounds: Bounds;
  /** 经纬度坐标 → [x, y]（SVG 单位） */
  project: (point: LonLat) => [number, number];
  /** 经纬度数组 → SVG path "M x y L x y ..." */
  toPath: (points: readonly LonLat[]) => string;
}

function normalizePadding(p: ProjectionOptions['padding']): PaddingBox {
  if (typeof p === 'number') {
    return { top: p, right: p, bottom: p, left: p };
  }
  const fallback = 4;
  return {
    top: p?.top ?? fallback,
    right: p?.right ?? fallback,
    bottom: p?.bottom ?? fallback,
    left: p?.left ?? fallback,
  };
}

export function computeBounds(points: readonly LonLat[]): Bounds {
  if (points.length === 0) {
    throw new Error('computeBounds: points must not be empty');
  }
  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  for (const [lon, lat] of points) {
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
  return { minLon, maxLon, minLat, maxLat };
}

export function createProjection(
  bounds: Bounds,
  options: ProjectionOptions = {}
): Projection {
  const padding = normalizePadding(options.padding);
  const width = options.width ?? 100;

  const lonSpan = bounds.maxLon - bounds.minLon || 1e-9;
  const latSpan = bounds.maxLat - bounds.minLat || 1e-9;
  // 不传 height 时按地理比例算（南北 vs 东西）。1° 纬度 ≈ 1° 经度（小范围近似）。
  const height = options.height ?? width * (latSpan / lonSpan);

  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const project = ([lon, lat]: LonLat): [number, number] => {
    const x = padding.left + ((lon - bounds.minLon) / lonSpan) * innerW;
    // 纬度越大 SVG y 越小（北上南下）
    const y = padding.top + (1 - (lat - bounds.minLat) / latSpan) * innerH;
    return [x, y];
  };

  const toPath = (points: readonly LonLat[]): string =>
    points
      .map((p, i) => {
        const [x, y] = project(p);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(3)} ${y.toFixed(3)}`;
      })
      .join(' ');

  return { width, height, padding, bounds, project, toPath };
}

/**
 * Haversine distance (km) between two [lon, lat] points.
 * Used by snap-to-line: 把站点按累积里程比例映射到真实轨道上。
 */
function haversineKm(a: LonLat, b: LonLat): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const dLat = toRad(b[1] - a[1]);
  const dLon = toRad(b[0] - a[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Catmull-Rom 平滑曲线插值
 *
 * 给一组控制点（如 34 个站点），生成穿过它们的平滑曲线。
 * 每段（相邻两点之间）插入 segmentsPerSpan 个中间点，
 * 用于把"折线段"变成视觉上"自然弯曲的轨道"。
 *
 * 特性：曲线 **保证经过每一个控制点**，不像 Bezier 那样只是被控制点"吸引"。
 * 端点处用首尾点自身做虚拟邻居，避免曲线"飞出"。
 *
 * @param points 控制点（[lng, lat] 数组）
 * @param segmentsPerSpan 每段细分数，默认 10 → 34 点输入产 331 点输出
 */
export function catmullRomSpline(
  points: readonly LonLat[],
  segmentsPerSpan = 10
): LonLat[] {
  if (points.length < 2) return points.map((p) => [...p] as LonLat);
  const result: LonLat[] = [];
  const n = points.length;
  for (let i = 0; i < n - 1; i++) {
    const p0 = i === 0 ? points[0] : points[i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i + 2 < n ? points[i + 2] : points[n - 1];
    for (let j = 0; j < segmentsPerSpan; j++) {
      const t = j / segmentsPerSpan;
      const t2 = t * t;
      const t3 = t2 * t;
      const x =
        0.5 *
        (2 * p1[0] +
          (-p0[0] + p2[0]) * t +
          (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
          (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
      const y =
        0.5 *
        (2 * p1[1] +
          (-p0[1] + p2[1]) * t +
          (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
          (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
      result.push([x, y]);
    }
  }
  result.push([...points[n - 1]] as LonLat);
  return result;
}

/** 沿 LineString 计算累积里程（km）数组，长度同输入 */
export function cumulativeKm(line: readonly LonLat[]): readonly number[] {
  if (line.length === 0) return [];
  const cum: number[] = [0];
  for (let i = 1; i < line.length; i++) {
    cum.push(cum[i - 1] + haversineKm(line[i - 1], line[i]));
  }
  return cum;
}

/**
 * 把 station 按 "声明里程占总里程的比例" 映射到 LineString 上某点。
 *
 * 用途：用户提供的 34 站点坐标偏差 5-77km，但站点顺序 + kmFromKunming 是可信的。
 * 用比例映射把每个 station 投到 OSM 真实轨道的对应弧长位置，视觉上 100% 对齐。
 *
 * @param fraction  0..1，station 沿铁路的进度（如 220/420 = 52%）
 * @param line      OSM 主线点列
 * @param cum       cumulativeKm(line) 的结果（外部预算避免重复计算）
 */
export function snapByArclength(
  fraction: number,
  line: readonly LonLat[],
  cum: readonly number[]
): LonLat {
  if (line.length === 0) throw new Error('snapByArclength: empty line');
  const f = Math.max(0, Math.min(1, fraction));
  const target = f * cum[cum.length - 1];
  // 二分找到第一个 cum[i] >= target
  let lo = 0;
  let hi = cum.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  if (lo === 0) return line[0];
  const c0 = cum[lo - 1];
  const c1 = cum[lo];
  const t = c1 > c0 ? (target - c0) / (c1 - c0) : 0;
  const p0 = line[lo - 1];
  const p1 = line[lo];
  return [p0[0] + t * (p1[0] - p0[0]), p0[1] + t * (p1[1] - p0[1])];
}
