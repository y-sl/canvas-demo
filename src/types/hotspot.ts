// 热区类型定义
export type HotspotType = 'HOTSPOT' | 'REPLACEABLE' | 'VIDEO' | 'GIF';

// 交互行为类型
export type ActionType = 'JUMP_URL' | 'OPEN_VIP_PAGE' | 'SHOW_TOAST';

// 热区矩形位置信息
export interface HotspotRect {
  left: string; // 百分比字符串，如 "10.5%"
  top: string;
  width: string;
  height: string;
}

// 交互行为配置
export interface HotspotAction {
  type: ActionType;
  data?: {
    url?: string; // JUMP_URL 时使用
    text?: string; // SHOW_TOAST 时使用
  };
}

// 可替换元素数据
export interface ReplaceableData {
  textContent?: string;
  fontSize?: number;
  color?: string;
  fontWeight?: 'normal' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  imageUrl?: string;
  videoUrl?: string;
  gifUrl?: string;
}

// 热区配置
export interface Hotspot {
  id: string;
  name?: string; // 热区名称/属性名
  type: HotspotType;
  rect: HotspotRect;
  action?: HotspotAction; // HOTSPOT 类型时使用
  data?: ReplaceableData; // REPLACEABLE、VIDEO、GIF 类型时使用
  zIndex: number; // 图层层级
}

// 导出配置格式
export interface ExportConfig {
  backgroundImageUrl: string;
  modules: Array<{
    type: HotspotType;
    name?: string;
    rect: HotspotRect;
    action?: HotspotAction;
    data?: ReplaceableData;
  }>;
}

// Fabric.js 对象扩展属性
export interface FabricHotspotObject extends fabric.Object {
  hotspotId?: string;
  hotspotType?: HotspotType;
}