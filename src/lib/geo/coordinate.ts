/**
 * 坐标系转换 · WGS84 ↔ GCJ-02
 *
 * 背景：
 * - WGS84：全球标准 GPS 坐标系，OpenStreetMap、Google Earth、用户的源数据用此
 * - GCJ-02：国测局加密偏移坐标（"火星坐标"），高德/腾讯地图瓦片基于此
 * - BD09：百度地图在 GCJ-02 上再加密一次的私有坐标系（暂未使用）
 *
 * 用途：用户提供的 WGS84 站点坐标 + OSM 提取的 WGS84 轨道，要叠加在高德瓦片上时，
 * 必须先把所有 WGS84 经纬度通过 wgs84ToGcj02 转换，否则有 ~500m 偏移。
 *
 * 算法来源：公开的国测局加密算法（详见 https://wiki.openstreetmap.org/wiki/GCJ-02）。
 */

const PI = Math.PI;
/** Krasovsky 1940 长半轴（米） */
const A = 6378245.0;
/** 偏心率平方 */
const EE = 0.00669342162296594323;

/** 国境外不加偏移，直接返回原坐标 */
function outOfChina(lng: number, lat: number): boolean {
  return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
}

function transformLat(x: number, y: number): number {
  let ret =
    -100.0 +
    2.0 * x +
    3.0 * y +
    0.2 * y * y +
    0.1 * x * y +
    0.2 * Math.sqrt(Math.abs(x));
  ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(y * PI) + 40.0 * Math.sin((y / 3.0) * PI)) * 2.0) / 3.0;
  ret +=
    ((160.0 * Math.sin((y / 12.0) * PI) + 320 * Math.sin((y * PI) / 30.0)) * 2.0) / 3.0;
  return ret;
}

function transformLng(x: number, y: number): number {
  let ret =
    300.0 +
    x +
    2.0 * y +
    0.1 * x * x +
    0.1 * x * y +
    0.1 * Math.sqrt(Math.abs(x));
  ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(x * PI) + 40.0 * Math.sin((x / 3.0) * PI)) * 2.0) / 3.0;
  ret +=
    ((150.0 * Math.sin((x / 12.0) * PI) + 300.0 * Math.sin((x / 30.0) * PI)) * 2.0) / 3.0;
  return ret;
}

/**
 * WGS84 → GCJ-02
 * @returns [lng, lat] in GCJ-02
 */
export function wgs84ToGcj02(lng: number, lat: number): [number, number] {
  if (outOfChina(lng, lat)) return [lng, lat];
  let dLat = transformLat(lng - 105.0, lat - 35.0);
  let dLng = transformLng(lng - 105.0, lat - 35.0);
  const radLat = (lat / 180.0) * PI;
  let magic = Math.sin(radLat);
  magic = 1 - EE * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180.0) / (((A * (1 - EE)) / (magic * sqrtMagic)) * PI);
  dLng = (dLng * 180.0) / ((A / sqrtMagic) * Math.cos(radLat) * PI);
  return [lng + dLng, lat + dLat];
}

/**
 * Leaflet 用 [lat, lng] 顺序（跟 GeoJSON 的 [lng, lat] 相反）。
 * 这个 helper 同时做转换 + 顺序调整，方便组件直接传给 Leaflet API。
 */
export function wgs84ToLeafletGcj02(lngLat: readonly [number, number]): [number, number] {
  const [gcjLng, gcjLat] = wgs84ToGcj02(lngLat[0], lngLat[1]);
  return [gcjLat, gcjLng];
}
