import { create } from 'zustand';
import { ComponentInstance, ComponentLibraryItem } from '../types/component';

interface ComponentStore {
  // 画布上的组件实例
  components: ComponentInstance[];
  // 当前选中的组件ID
  selectedComponentId: string | null;
  // 画布背景图片
  backgroundImageUrl: string | null;
  backgroundImageSize: { width: number; height: number } | null;
  // 画布缩放比例
  canvasScale: number;
  
  // 组件库数据
  componentLibrary: ComponentLibraryItem[];
  
  // 操作方法
  addComponent: (component: Omit<ComponentInstance, 'id' | 'zIndex'>) => string;
  updateComponent: (id: string, updates: Partial<ComponentInstance>) => void;
  deleteComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
  getSelectedComponent: () => ComponentInstance | null;
  
  // 背景图片操作
  setBackgroundImage: (url: string, size: { width: number; height: number }) => void;
  clearBackgroundImage: () => void;
  
  // 画布操作
  setCanvasScale: (scale: number) => void;
  
  // 层级操作
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  
  // 本地存储
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  clearAll: () => void;
}

// 默认组件库数据
const defaultComponentLibrary: ComponentLibraryItem[] = [
  {
    id: 'button-default',
    name: '按钮',
    type: 'button',
    icon: 'Square',
    category: '基础组件',
    defaultProps: {
      text: '按钮',
      onClick: null
    },
    defaultStyle: {
      width: 100,
      height: 40,
      backgroundColor: '#3B82F6',
      color: '#FFFFFF',
      fontSize: 14,
      padding: '8px 16px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer'
    }
  }
];

export const useComponentStore = create<ComponentStore>((set, get) => ({
  components: [],
  selectedComponentId: null,
  backgroundImageUrl: null,
  backgroundImageSize: null,
  canvasScale: 1,
  componentLibrary: defaultComponentLibrary,
  
  addComponent: (component) => {
    const id = `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const maxZIndex = Math.max(0, ...get().components.map(c => c.zIndex));
    
    const newComponent: ComponentInstance = {
      ...component,
      id,
      zIndex: maxZIndex + 1
    };
    
    set(state => ({
      components: [...state.components, newComponent],
      selectedComponentId: id
    }));
    
    get().saveToLocalStorage();
    return id;
  },
  
  updateComponent: (id, updates) => {
    set(state => ({
      components: state.components.map(component =>
        component.id === id ? { ...component, ...updates } : component
      )
    }));
    get().saveToLocalStorage();
  },
  
  deleteComponent: (id) => {
    set(state => ({
      components: state.components.filter(component => component.id !== id),
      selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId
    }));
    get().saveToLocalStorage();
  },
  
  selectComponent: (id) => {
    set({ selectedComponentId: id });
  },
  
  getSelectedComponent: () => {
    const { components, selectedComponentId } = get();
    return components.find(component => component.id === selectedComponentId) || null;
  },
  
  setBackgroundImage: (url, size) => {
    set({ backgroundImageUrl: url, backgroundImageSize: size });
    get().saveToLocalStorage();
  },
  
  clearBackgroundImage: () => {
    set({ backgroundImageUrl: null, backgroundImageSize: null });
    get().saveToLocalStorage();
  },
  
  setCanvasScale: (scale) => {
    set({ canvasScale: scale });
  },
  
  bringToFront: (id) => {
    const { components } = get();
    const maxZIndex = Math.max(...components.map(c => c.zIndex));
    get().updateComponent(id, { zIndex: maxZIndex + 1 });
  },
  
  sendToBack: (id) => {
    const { components } = get();
    const minZIndex = Math.min(...components.map(c => c.zIndex));
    get().updateComponent(id, { zIndex: minZIndex - 1 });
  },
  
  saveToLocalStorage: () => {
    const { components, backgroundImageUrl, backgroundImageSize } = get();
    const data = {
      components,
      backgroundImageUrl,
      backgroundImageSize,
      timestamp: Date.now()
    };
    localStorage.setItem('component-editor-data', JSON.stringify(data));
  },
  
  loadFromLocalStorage: () => {
    try {
      const data = localStorage.getItem('component-editor-data');
      if (data) {
        const parsed = JSON.parse(data);
        set({
          components: parsed.components || [],
          backgroundImageUrl: parsed.backgroundImageUrl || null,
          backgroundImageSize: parsed.backgroundImageSize || null
        });
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
  },
  
  clearAll: () => {
    set({
      components: [],
      selectedComponentId: null,
      backgroundImageUrl: null,
      backgroundImageSize: null
    });
    localStorage.removeItem('component-editor-data');
  }
}));