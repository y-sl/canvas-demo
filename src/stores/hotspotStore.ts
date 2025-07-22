import { create } from 'zustand';
import { Hotspot, ExportConfig, HotspotType } from '../types/hotspot';

interface HotspotStore {
  // 状态
  hotspots: Hotspot[];
  selectedHotspotId: string | null;
  backgroundImageUrl: string | null;
  backgroundImageSize: { width: number; height: number } | null;
  canvasScale: number;
  
  // 操作方法
  addHotspot: (hotspot: Omit<Hotspot, 'id' | 'zIndex'>) => string;
  updateHotspot: (id: string, updates: Partial<Hotspot>) => void;
  deleteHotspot: (id: string) => void;
  selectHotspot: (id: string | null) => void;
  getSelectedHotspot: () => Hotspot | null;
  copyHotspot: (id: string) => string | null;
  deleteSelectedHotspot: () => void;
  copySelectedHotspot: () => string | null;
  
  // 图层操作
  moveHotspotToTop: (id: string) => void;
  moveHotspotToBottom: (id: string) => void;
  moveHotspotUp: (id: string) => void;
  moveHotspotDown: (id: string) => void;
  
  // 背景图片
  setBackgroundImage: (url: string, size: { width: number; height: number }) => void;
  clearBackgroundImage: () => void;
  
  // 画布缩放
  setCanvasScale: (scale: number) => void;
  
  // 数据操作
  clearAllHotspots: () => void;
  exportConfig: () => ExportConfig;
  importConfig: (config: ExportConfig) => void;
  
  // 本地存储
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
}

const STORAGE_KEY = 'hotspot-editor-data';

export const useHotspotStore = create<HotspotStore>((set, get) => ({
  // 初始状态
  hotspots: [],
  selectedHotspotId: null,
  backgroundImageUrl: null,
  backgroundImageSize: null,
  canvasScale: 1,
  
  // 添加热区
  addHotspot: (hotspot) => {
    const id = `hotspot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const maxZIndex = Math.max(0, ...get().hotspots.map(h => h.zIndex));
    const newHotspot: Hotspot = {
      ...hotspot,
      id,
      zIndex: maxZIndex + 1,
    };
    
    set((state) => ({
      hotspots: [...state.hotspots, newHotspot],
      selectedHotspotId: id,
    }));
    
    get().saveToLocalStorage();
    return id;
  },
  
  // 更新热区
  updateHotspot: (id, updates) => {
    set((state) => ({
      hotspots: state.hotspots.map(h => 
        h.id === id ? { ...h, ...updates } : h
      ),
      // 保持选中状态
      selectedHotspotId: state.selectedHotspotId,
    }));
    get().saveToLocalStorage();
  },
  
  // 删除热区
  deleteHotspot: (id) => {
    set((state) => ({
      hotspots: state.hotspots.filter(h => h.id !== id),
      selectedHotspotId: state.selectedHotspotId === id ? null : state.selectedHotspotId,
    }));
    get().saveToLocalStorage();
  },

  // 复制热区
  copyHotspot: (id) => {
    const { hotspots } = get();
    const hotspot = hotspots.find(h => h.id === id);
    if (!hotspot) return null;

    // 创建副本，稍微偏移位置
    const newId = `hotspot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const maxZIndex = Math.max(0, ...hotspots.map(h => h.zIndex));
    
    // 计算新位置（向右下偏移10px，转换为百分比）
    const leftPercent = parseFloat(hotspot.rect.left);
    const topPercent = parseFloat(hotspot.rect.top);
    const newLeft = Math.min(leftPercent + 2, 95); // 最多偏移到95%
    const newTop = Math.min(topPercent + 2, 95);
    
    const newHotspot: Hotspot = {
      ...hotspot,
      id: newId,
      name: hotspot.name ? `${hotspot.name} 副本` : undefined,
      rect: {
        ...hotspot.rect,
        left: `${newLeft.toFixed(2)}%`,
        top: `${newTop.toFixed(2)}%`,
      },
      zIndex: maxZIndex + 1,
    };

    set((state) => ({
      hotspots: [...state.hotspots, newHotspot],
      selectedHotspotId: newId,
    }));

    get().saveToLocalStorage();
    return newId;
  },

  // 删除选中的热区
  deleteSelectedHotspot: () => {
    const { selectedHotspotId } = get();
    if (selectedHotspotId) {
      get().deleteHotspot(selectedHotspotId);
    }
  },

  // 复制选中的热区
  copySelectedHotspot: () => {
    const { selectedHotspotId } = get();
    if (selectedHotspotId) {
      return get().copyHotspot(selectedHotspotId);
    }
    return null;
  },
  
  // 选择热区
  selectHotspot: (id) => {
    set({ selectedHotspotId: id });
  },
  
  // 获取选中的热区
  getSelectedHotspot: () => {
    const { hotspots, selectedHotspotId } = get();
    return hotspots.find(h => h.id === selectedHotspotId) || null;
  },
  
  // 图层操作
  moveHotspotToTop: (id) => {
    const { hotspots } = get();
    const maxZIndex = Math.max(...hotspots.map(h => h.zIndex));
    get().updateHotspot(id, { zIndex: maxZIndex + 1 });
  },
  
  moveHotspotToBottom: (id) => {
    const { hotspots } = get();
    const minZIndex = Math.min(...hotspots.map(h => h.zIndex));
    get().updateHotspot(id, { zIndex: minZIndex - 1 });
  },
  
  moveHotspotUp: (id) => {
    const { hotspots } = get();
    const hotspot = hotspots.find(h => h.id === id);
    if (!hotspot) return;
    
    const upperHotspots = hotspots.filter(h => h.zIndex > hotspot.zIndex);
    if (upperHotspots.length === 0) return;
    
    const nextZIndex = Math.min(...upperHotspots.map(h => h.zIndex));
    const targetHotspot = hotspots.find(h => h.zIndex === nextZIndex);
    
    if (targetHotspot) {
      get().updateHotspot(id, { zIndex: nextZIndex });
      get().updateHotspot(targetHotspot.id, { zIndex: hotspot.zIndex });
    }
  },
  
  moveHotspotDown: (id) => {
    const { hotspots } = get();
    const hotspot = hotspots.find(h => h.id === id);
    if (!hotspot) return;
    
    const lowerHotspots = hotspots.filter(h => h.zIndex < hotspot.zIndex);
    if (lowerHotspots.length === 0) return;
    
    const nextZIndex = Math.max(...lowerHotspots.map(h => h.zIndex));
    const targetHotspot = hotspots.find(h => h.zIndex === nextZIndex);
    
    if (targetHotspot) {
      get().updateHotspot(id, { zIndex: nextZIndex });
      get().updateHotspot(targetHotspot.id, { zIndex: hotspot.zIndex });
    }
  },
  
  // 背景图片操作
  setBackgroundImage: (url, size) => {
    console.log('Setting background image in store:', { url: url?.substring(0, 50) + '...', size });
    set({
      backgroundImageUrl: url,
      backgroundImageSize: size,
    });
    console.log('Background image state updated');
    get().saveToLocalStorage();
  },
  
  clearBackgroundImage: () => {
    console.log('Clearing background image from store');
    set({
      backgroundImageUrl: null,
      backgroundImageSize: null,
    });
    console.log('Background image cleared from state');
    get().saveToLocalStorage();
  },
  
  // 画布缩放
  setCanvasScale: (scale) => {
    set({ canvasScale: scale });
  },
  
  // 清空所有热区
  clearAllHotspots: () => {
    set({
      hotspots: [],
      selectedHotspotId: null,
    });
    get().saveToLocalStorage();
  },
  
  // 导出配置
  exportConfig: () => {
    const { hotspots, backgroundImageUrl } = get();
    return {
      backgroundImageUrl: backgroundImageUrl || '',
      modules: hotspots.map(h => ({
        type: h.type,
        name: h.name,
        rect: h.rect,
        action: h.action,
        data: h.data,
      })),
    };
  },
  
  // 导入配置
  importConfig: (config) => {
    const hotspots: Hotspot[] = config.modules.map((module, index) => ({
      id: `imported-${Date.now()}-${index}`,
      type: module.type,
      name: module.name,
      rect: module.rect,
      action: module.action,
      data: module.data,
      zIndex: index + 1,
    }));
    
    set({
      hotspots,
      backgroundImageUrl: config.backgroundImageUrl,
      selectedHotspotId: null,
    });
    get().saveToLocalStorage();
  },
  
  // 保存到本地存储
  saveToLocalStorage: () => {
    const { hotspots, backgroundImageUrl, backgroundImageSize } = get();
    const data = {
      hotspots,
      backgroundImageUrl,
      backgroundImageSize,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },
  
  // 从本地存储加载
  loadFromLocalStorage: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        set({
          hotspots: data.hotspots || [],
          backgroundImageUrl: data.backgroundImageUrl || null,
          backgroundImageSize: data.backgroundImageSize || null,
          selectedHotspotId: null,
        });
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
  },
}));