'use client';

/**
 * 滇越铁路云游导览地图 · Leaflet + 高德底图实现
 *
 * 数据完整性原则（5/21 决策 · 经用户与论文配图核实）：
 *   1. 站点位置：完全使用用户清单的 WGS84 原始坐标，不做任何 snap / 投影变形
 *   2. 主线轨道：OSM 测绘级 "昆河线" 数据，522 点真实弯道展线
 *      （走向跟历史研究论文一致 —— 昆明→宜良→弥勒→开远→碧色寨→河口 东路）
 *   3. ⚠️ 已知数据冲突：用户清单 29/34 站点 coord 跟 OSM 真实轨道偏差 5-77km，
 *      视觉上 marker 不完全贴线 —— 这是历史清单坐标精度问题的诚实呈现，
 *      不做强制 snap 对齐。Phase 3 替换站点 coord 为 OSM railway=station 节点。
 *
 * 技术细节：
 *   - 用户/OSM 数据都是 WGS84
 *   - 高德地图瓦片基于 GCJ-02 国测局加密坐标
 *   - 渲染前需把所有坐标通过 wgs84ToGcj02 转换，否则有 ~500m 偏移
 *   - Leaflet 用 [lat, lng] 顺序（跟 GeoJSON 的 [lng, lat] 相反），用 helper 一次性处理
 */

import { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { stations, mainLine } from '@/data/migui-line';
import { wgs84ToLeafletGcj02 } from '@/lib/geo/coordinate';

// 主线坐标 WGS84 → GCJ-02 转换 + 顺序调整（Leaflet 用 [lat, lng]）
const mainLinePositions: [number, number][] = mainLine.map(wgs84ToLeafletGcj02);

// 站点坐标转换（一次性，模块加载时）
const stationPositions = stations.map((s) => ({
  ...s,
  position: wgs84ToLeafletGcj02(s.coord),
}));

// 计算 bounds，让初始视图正好框住整条铁路
const lats = mainLinePositions.map((p) => p[0]).concat(stationPositions.map((s) => s.position[0]));
const lngs = mainLinePositions.map((p) => p[1]).concat(stationPositions.map((s) => s.position[1]));
const bounds: L.LatLngBoundsLiteral = [
  [Math.min(...lats), Math.min(...lngs)],
  [Math.max(...lats), Math.max(...lngs)],
];

interface MiguiLeafletMapProps {
  activeStationId: string;
  onSelectStation: (id: string) => void;
}

/**
 * 自定义 station 印章图标（朱砂方块 + 编号，呼应原 SVG 设计语言）
 */
function makeStationIcon(order: number, isActive: boolean): L.DivIcon {
  const bg = isActive ? '#C2402F' : 'rgba(194, 64, 47, 0.18)';
  const border = isActive ? '#C2402F' : 'rgba(194, 64, 47, 0.6)';
  const color = isActive ? '#f8f5ee' : '#C2402F';
  const scale = isActive ? 1.15 : 1;
  return L.divIcon({
    className: 'migui-station-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    html: `<div style="
      width: 24px; height: 24px;
      background: ${bg};
      border: 1px solid ${border};
      display: flex; align-items: center; justify-content: center;
      font-family: 'Special Elite', monospace;
      font-size: 10px; color: ${color};
      transform: scale(${scale});
      transition: transform 200ms;
      box-shadow: ${isActive ? '0 0 0 3px rgba(194, 64, 47, 0.25)' : 'none'};
    ">${String(order).padStart(2, '0')}</div>`,
  });
}

/** 当 activeStationId 变化时，把地图平滑 pan 到该站 */
function PanToActive({ activeId }: { activeId: string }) {
  const map = useMap();
  useEffect(() => {
    const st = stationPositions.find((s) => s.id === activeId);
    if (st) map.panTo(st.position, { animate: true, duration: 0.6 });
  }, [activeId, map]);
  return null;
}

export function MiguiLeafletMap({ activeStationId, onSelectStation }: MiguiLeafletMapProps) {
  return (
    <MapContainer
      bounds={bounds}
      boundsOptions={{ padding: [40, 40] }}
      scrollWheelZoom
      className="absolute inset-0 w-full h-full"
      style={{ background: 'var(--background)' }}
      attributionControl={false}
    >
      {/* 高德地图 style=7 是简洁灰白底，搭配项目朱砂主线视觉对比好 */}
      <TileLayer
        url="https://wprd0{s}.is.autonavi.com/appmaptile?style=7&x={x}&y={y}&z={z}"
        subdomains={['1', '2', '3', '4']}
        maxZoom={18}
        minZoom={6}
        // CSS 滤镜让现代瓦片靠近项目 cinematic editorial 美学（sepia + 降饱和）
        // 想要更鲜活底图可以去掉这一行
        className="migui-tile-sepia"
        attribution='© <a href="https://amap.com">高德地图</a>'
      />

      {/* 朱砂主线 —— OSM 522 点真实轨道（GCJ-02 转换后） */}
      <Polyline
        positions={mainLinePositions}
        pathOptions={{
          color: '#C2402F',
          weight: 3,
          opacity: 0.85,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />

      {/* 主线虚影叠加 —— 手绘感纹理 */}
      <Polyline
        positions={mainLinePositions}
        pathOptions={{
          color: '#C2402F',
          weight: 1,
          opacity: 0.4,
          dashArray: '2 3',
        }}
      />

      {/* 站点印章 */}
      {stationPositions.map((s) => (
        <Marker
          key={s.id}
          position={s.position}
          icon={makeStationIcon(s.order, s.id === activeStationId)}
          eventHandlers={{ click: () => onSelectStation(s.id) }}
          keyboard
          title={`${s.name} · ${s.en}`}
        />
      ))}

      <PanToActive activeId={activeStationId} />
    </MapContainer>
  );
}
