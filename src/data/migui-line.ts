/**
 * 滇越铁路米轨 · 站点 + 主线数据（类型化 TS 镜像）
 *
 * 与 `public/data/migui-line.geojson` 内容一致。该 GeoJSON 文件留作演示数据
 * 的可读规约（外部工具 / 审阅用）；组件代码引用此 TS 文件以获得类型安全。
 *
 * MVP：6 站点占位，待 32 站点全量清单替换。坐标精度仅用于视觉演示。
 */

import type { LonLat } from '@/lib/geo/project';

export type StationStatus = 'active' | 'heritage' | 'border';

export interface Station {
  id: string;
  name: string;
  en: string;
  status: StationStatus;
  built: number;
  /** 距昆明里程（km），用于未来的"沿线进度"视觉 */
  kmFromKunming: number;
  /** 自北向南的顺序，1-based */
  order: number;
  /** [经度, 纬度] —— GeoJSON 约定 */
  coord: LonLat;
}

export const stations: readonly Station[] = [
  { id: 's1', name: '昆明北站', en: 'Kunming North', status: 'active', built: 1910, kmFromKunming: 0, order: 1, coord: [102.7173, 25.0469] },
  { id: 's2', name: '宜良站', en: 'Yiliang', status: 'active', built: 1910, kmFromKunming: 65, order: 2, coord: [103.1390, 24.9081] },
  { id: 's3', name: '开远站', en: 'Kaiyuan', status: 'active', built: 1910, kmFromKunming: 230, order: 3, coord: [103.2716, 23.7152] },
  { id: 's4', name: '碧色寨站', en: 'Bisezhai', status: 'heritage', built: 1909, kmFromKunming: 290, order: 4, coord: [103.4147, 23.4767] },
  { id: 's5', name: '蒙自站', en: 'Mengzi', status: 'active', built: 1909, kmFromKunming: 310, order: 5, coord: [103.4107, 23.3911] },
  { id: 's6', name: '河口口岸', en: 'Hekou', status: 'border', built: 1910, kmFromKunming: 469, order: 6, coord: [103.9573, 22.5008] },
];

/** 主线 LineString —— 当前直接走站点连线；未来可换成测绘级实际线路 */
export const mainLine: readonly LonLat[] = stations.map((s) => s.coord);

export const stationStatusLabel: Record<StationStatus, string> = {
  active: '运营中',
  heritage: '遗产站点',
  border: '口岸枢纽',
};

/** 站点简介——优先展示标志性站点；其余 placeholder（待文案接入） */
export const stationIntro: Partial<Record<string, string>> = {
  s1: '昆明北站为滇越铁路云南段起点，1910 年通车，是当时云南省第一座现代化火车站。',
  s4: '碧色寨车站融合了法国第三共和时期建筑语汇与本土砖石工艺，被誉为"东方小巴黎"。',
  s5: '蒙自南湖畔的法式车站，曾是云南海关、邮政、电报与外资银行的早期聚集地。',
  s6: '河口口岸跨过红河与越南老街相望，是中国与中南半岛连接的最早铁路口岸之一。',
};

export const PLACEHOLDER_INTRO =
  '该站点的详细介绍数据将在 GIS 系统对接后接入。';
