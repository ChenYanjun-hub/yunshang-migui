/**
 * 云上米轨 - 数据接口模型
 * Data Interfaces for Yunshang Migui Platform
 */

// ============================================
// 用户与权限相关
// ============================================

/** 用户角色枚举 */
export enum UserRole {
  GUEST = 'guest',
  USER = 'user',
  VIP = 'vip',
  CREATOR = 'creator',
  BUSINESS = 'business',
  ADMIN = 'admin',
}

/** 用户基础信息 */
export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

/** VIP会员状态 */
export interface VIPMembership {
  userId: string;
  level: 'basic' | 'premium' | 'ultimate';
  expiresAt: string;
  benefits: string[];
}

// ============================================
// 史料档案相关
// ============================================

/** 史料时期分类 */
export enum ArchivePeriod {
  CONSTRUCTION = 'construction',     // 修建期 (1903-1910)
  OPERATION = 'operation',           // 通车运营期 (1910-1940)
  REPUBLIC = 'republic',             // 民国时期 (1912-1949)
  PRC = 'prc',                       // 建国后 (1949-2000)
  HERITAGE = 'heritage',             // 遗产保护期 (2000-至今)
}

/** 史料类型 */
export enum ArchiveType {
  PHOTO = 'photo',                   // 老照片
  DOCUMENT = 'document',             // 文献
  MAP = 'map',                       // 手绘地图
  BLUEPRINT = 'blueprint',           // 工程图纸
  NEWSPAPER = 'newspaper',           // 报刊剪报
  ORAL_HISTORY = 'oral_history',     // 口述历史
}

/** 史料档案项 */
export interface ArchiveItem {
  id: string;
  title: string;
  description: string;
  period: ArchivePeriod;
  type: ArchiveType;
  year?: number;
  /** 原始老照片 URL */
  oldPhotoUrl?: string;
  /** 现代对比照片 URL */
  newPhotoUrl?: string;
  /** 高清原图 URL (会员专享) */
  hdUrl?: string;
  /** 关联站点 ID */
  stationId?: string;
  /** 标签列表 */
  tags: string[];
  /** 来源信息 */
  source?: {
    author?: string;
    publisher?: string;
    archive?: string;
  };
  /** 版权信息 */
  copyright?: {
    holder: string;
    license: string;
  };
  /** 浏览/收藏统计 */
  stats: {
    views: number;
    likes: number;
    collects: number;
  };
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

/** 史料筛选参数 */
export interface ArchiveFilter {
  period?: ArchivePeriod[];
  type?: ArchiveType[];
  yearRange?: [number, number];
  stationId?: string;
  tags?: string[];
  keyword?: string;
}

// ============================================
// 站点与地图相关
// ============================================

/** 站点分类 */
export enum StationCategory {
  STATION = 'station',               // 火车站
  BRIDGE = 'bridge',                 // 桥梁
  TUNNEL = 'tunnel',                 // 隧道
  WATER_TOWER = 'water_tower',       // 水塔
  WORKSHOP = 'workshop',             // 机修厂
  RESIDENCE = 'residence',           // 历史建筑
  MEMORIAL = 'memorial',             // 纪念碑/博物馆
  SCENIC = 'scenic',                 // 景观点
}

/** 地理坐标 */
export interface GeoPoint {
  longitude: number;
  latitude: number;
  altitude?: number;
}

/** 站点信息 */
export interface StationPoint {
  id: string;
  name: string;
  nameFR?: string;                   // 法语原名
  nameVietnamese?: string;           // 越南语名
  location: GeoPoint;
  category: StationCategory;
  description: string;
  /** 建造年份 */
  builtYear?: number;
  /** 现存状态 */
  status: 'intact' | 'partial' | 'ruin' | 'demolished';
  /** VR 全景 URL */
  vrPanoramaUrl?: string;
  /** 语音讲解 URL */
  audioGuideUrl?: string;
  /** 关联史料 ID 列表 */
  archiveIds: string[];
  /** 打卡统计 */
  checkInCount: number;
  /** 遗存点位 (L2 视图) */
  heritagePoints?: HeritagePoint[];
  isVerified: boolean;
}

/** 遗存点位 (L2 局部视图) */
export interface HeritagePoint {
  id: string;
  name: string;
  location: GeoPoint;
  type: string;
  description: string;
  /** 720° VR 全景 URL */
  vrUrl?: string;
  /** 热点信息 */
  hotspots?: VRHotspot[];
}

/** VR 全景热点 */
export interface VRHotspot {
  id: string;
  position: { yaw: number; pitch: number };
  type: 'info' | 'photo' | 'audio' | 'link';
  title: string;
  content?: string;
  mediaUrl?: string;
  targetVrId?: string;
}

// ============================================
// 社区与 UGC 相关
// ============================================

/** UGC 内容类型 */
export enum UGCType {
  PHOTO = 'photo',
  VIDEO = 'video',
  AUDIO = 'audio',
  ARTICLE = 'article',
}

/** 用户创作内容 */
export interface UGCContent {
  id: string;
  authorId: string;
  author: User;
  type: UGCType;
  title: string;
  description?: string;
  mediaUrls: string[];
  /** 关联站点 */
  stationId?: string;
  /** 关联史料 */
  archiveId?: string;
  tags: string[];
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
  isFeatured: boolean;
  createdAt: string;
}

/** 社区话题 */
export interface CommunityTopic {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  postCount: number;
  followers: number;
  createdAt: string;
}

// ============================================
// 电商与订单相关
// ============================================

/** 商品类型 */
export enum ProductType {
  PHYSICAL = 'physical',             // 实体文创
  DIGITAL = 'digital',               // 数字藏品
  EXPERIENCE = 'experience',         // 研学体验
}

/** 商品信息 */
export interface Product {
  id: string;
  name: string;
  description: string;
  type: ProductType;
  price: number;
  originalPrice?: number;
  images: string[];
  /** 会员折扣 */
  vipDiscount?: number;
  /** 线下自提点 */
  pickupStations?: string[];
  stock: number;
  isAvailable: boolean;
}

/** 订单状态 */
export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  SHIPPED = 'shipped',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/** 订单信息 */
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  paidAt?: string;
  completedAt?: string;
}

/** 订单项 */
export interface OrderItem {
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

// ============================================
// 打卡与游戏化相关
// ============================================

/** 打卡记录 */
export interface CheckInRecord {
  id: string;
  userId: string;
  stationId: string;
  station: StationPoint;
  location: GeoPoint;
  /** 打卡时间 */
  checkedAt: string;
  /** 获得印章 */
  stampEarned?: DigitalStamp;
  /** 用户备注 */
  note?: string;
  photos?: string[];
}

/** 电子印章 */
export interface DigitalStamp {
  id: string;
  name: string;
  imageUrl: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
  /** 获取条件 */
  unlockCondition: string;
}

// ============================================
// 导航与路由相关
// ============================================

/** 导航节点 (首页 3D 小火车) */
export interface NavigationNode {
  id: string;
  label: string;
  labelEn: string;
  route: string;
  description: string;
  /** 3D 模型位置 */
  position3D: { x: number; y: number; z: number };
  icon?: string;
}

/** 面包屑导航项 */
export interface BreadcrumbItem {
  label: string;
  href: string;
}
