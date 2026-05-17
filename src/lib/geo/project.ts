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
