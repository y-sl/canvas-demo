import { create } from 'zustand';
import { 
  MultiLanguageProject, 
  MultiLanguageHotspotConfig, 
  LanguageCode, 
  Language,
  SingleLanguageExportConfig,
  BatchEditConfig,
  LanguageConfigState,
  MultiLanguageText
} from '../types/multiLanguage';
import { HotspotType, HotspotRect } from '../types/hotspot';

// 支持的语言列表
export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'en-US', name: 'English (US)', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'es-ES', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
];

interface MultiLanguageStore {
  // 项目列表
  projects: MultiLanguageProject[];
  
  // 当前项目
  currentProject: MultiLanguageProject | null;
  
  // 语言配置状态
  languageState: LanguageConfigState;
  
  // 选中的热区ID
  selectedHotspotId: string | null;
  
  // 项目管理
  createProject: (config: { name: string; languages: LanguageCode[]; defaultLanguage: LanguageCode }) => string;
  loadProject: (projectId: string) => void;
  deleteProject: (projectId: string) => void;
  updateProjectName: (projectId: string, name: string) => void;
  updateProjectInfo: (updates: Partial<Pick<MultiLanguageProject, 'name' | 'description'>>) => void;
  
  // 语言管理
  addLanguage: (languageCode: LanguageCode) => void;
  removeLanguage: (languageCode: LanguageCode) => void;
  setCurrentLanguage: (languageCode: LanguageCode) => void;
  setDefaultLanguage: (languageCode: LanguageCode) => void;
  
  // 背景图片管理
  setBackgroundImage: (languageCode: LanguageCode, url: string, size: { width: number; height: number }) => void;
  removeBackgroundImage: (languageCode: LanguageCode) => void;
  
  // 热区管理
  addHotspot: (hotspot: Omit<MultiLanguageHotspotConfig, 'id' | 'zIndex'>) => string;
  updateHotspot: (id: string, updates: Partial<MultiLanguageHotspotConfig>) => void;
  deleteHotspot: (id: string) => void;
  selectHotspot: (id: string | null) => void;
  getSelectedHotspot: () => MultiLanguageHotspotConfig | null;
  getMultiLanguageHotspotConfig: (hotspotId: string) => any;
  updateMultiLanguageHotspotConfig: (hotspotId: string, config: any) => void;
  copyHotspotConfigBetweenLanguages: (hotspotId: string, fromLang: LanguageCode, toLang: LanguageCode) => void;
  resetHotspotConfigToDefault: (hotspotId: string, languageCode: LanguageCode) => void;
  getAllMultiLanguageHotspots: () => any[];
  deleteMultiLanguageHotspot: (hotspotId: string) => void;
  
  // 多语言文本管理
  updateHotspotText: (hotspotId: string, field: string, languageCode: LanguageCode, value: string) => void;
  copyTextToLanguages: (hotspotId: string, field: string, sourceLanguage: LanguageCode, targetLanguages: LanguageCode[]) => void;
  
  // 批量编辑
  batchEdit: (config: BatchEditConfig) => void;
  
  // 视图状态管理
  toggleShowAllLanguages: () => void;
  toggleCompareMode: () => void;
  setCompareLanguages: (languages: LanguageCode[]) => void;
  
  // 导出功能
  exportSingleLanguageConfig: (languageCode: LanguageCode) => SingleLanguageExportConfig | null;
  exportAllLanguagesConfig: () => { [key in LanguageCode]?: SingleLanguageExportConfig };
  importProjectConfig: (config: any) => void;
  
  // 本地存储
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
}

const STORAGE_KEY = 'multi-language-editor-data';

export const useMultiLanguageStore = create<MultiLanguageStore>((set, get) => ({
  // 初始状态
  projects: [],
  currentProject: null,
  languageState: {
    currentLanguage: 'zh-CN',
    showAllLanguages: false,
    compareMode: false,
    compareLanguages: [],
  },
  selectedHotspotId: null,
  
  // 创建项目
  createProject: (config) => {
    const id = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const project: MultiLanguageProject = {
      id,
      name: config.name,
      description: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      languages: config.languages,
      defaultLanguage: config.defaultLanguage,
      backgroundImages: {},
      hotspots: [],
    };
    
    set({
      projects: [...get().projects, project],
      currentProject: project,
      languageState: {
        ...get().languageState,
        currentLanguage: config.defaultLanguage,
      },
      selectedHotspotId: null,
    });
    
    get().saveToLocalStorage();
    return id;
  },
  
  // 加载项目
  loadProject: (projectId) => {
    const { projects } = get();
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    set({
      currentProject: project,
      languageState: {
        ...get().languageState,
        currentLanguage: project.defaultLanguage,
      },
      selectedHotspotId: null,
    });
  },
  
  // 删除项目
  deleteProject: (projectId) => {
    const { projects, currentProject } = get();
    const updatedProjects = projects.filter(p => p.id !== projectId);
    
    set({
      projects: updatedProjects,
      currentProject: currentProject?.id === projectId ? null : currentProject,
    });
    
    get().saveToLocalStorage();
  },
  
  // 更新项目名称
  updateProjectName: (projectId, name) => {
    const { projects, currentProject } = get();
    const updatedProjects = projects.map(p => 
      p.id === projectId ? { ...p, name, updatedAt: Date.now() } : p
    );
    
    set({
      projects: updatedProjects,
      currentProject: currentProject?.id === projectId 
        ? { ...currentProject, name, updatedAt: Date.now() }
        : currentProject,
    });
    
    get().saveToLocalStorage();
  },
  
  // 更新项目信息
  updateProjectInfo: (updates) => {
    const { currentProject } = get();
    if (!currentProject) return;
    
    set({
      currentProject: {
        ...currentProject,
        ...updates,
        updatedAt: Date.now(),
      },
    });
    get().saveToLocalStorage();
  },
  
  // 添加语言
  addLanguage: (languageCode) => {
    const { currentProject } = get();
    if (!currentProject || currentProject.languages.includes(languageCode)) return;
    
    set({
      currentProject: {
        ...currentProject,
        languages: [...currentProject.languages, languageCode],
        updatedAt: Date.now(),
      },
    });
    get().saveToLocalStorage();
  },
  
  // 移除语言
  removeLanguage: (languageCode) => {
    const { currentProject } = get();
    if (!currentProject || currentProject.languages.length <= 1) return;
    
    // 不能删除默认语言
    if (languageCode === currentProject.defaultLanguage) return;
    
    // 从所有热区中移除该语言的配置
    const updatedHotspots = currentProject.hotspots.map(hotspot => {
      const updatedHotspot = { ...hotspot };
      
      // 移除名称中的该语言
      if (updatedHotspot.name) {
        delete updatedHotspot.name[languageCode];
      }
      
      // 移除动作数据中的该语言
      if (updatedHotspot.action?.data) {
        if (updatedHotspot.action.data.url) {
          delete updatedHotspot.action.data.url[languageCode];
        }
        if (updatedHotspot.action.data.text) {
          delete updatedHotspot.action.data.text[languageCode];
        }
      }
      
      // 移除数据中的该语言
      if (updatedHotspot.data) {
        if (updatedHotspot.data.textContent) {
          delete updatedHotspot.data.textContent[languageCode];
        }
        if (updatedHotspot.data.imageUrl) {
          delete updatedHotspot.data.imageUrl[languageCode];
        }
        if (updatedHotspot.data.videoUrl) {
          delete updatedHotspot.data.videoUrl[languageCode];
        }
        if (updatedHotspot.data.gifUrl) {
          delete updatedHotspot.data.gifUrl[languageCode];
        }
      }
      
      return updatedHotspot;
    });
    
    // 移除背景图片
    const updatedBackgroundImages = { ...currentProject.backgroundImages };
    delete updatedBackgroundImages[languageCode];
    
    set({
      currentProject: {
        ...currentProject,
        languages: currentProject.languages.filter(lang => lang !== languageCode),
        backgroundImages: updatedBackgroundImages,
        hotspots: updatedHotspots,
        updatedAt: Date.now(),
      },
    });
    
    // 如果当前语言被删除，切换到默认语言
    if (get().languageState.currentLanguage === languageCode) {
      get().setCurrentLanguage(currentProject.defaultLanguage);
    }
    
    get().saveToLocalStorage();
  },
  
  // 设置当前语言
  setCurrentLanguage: (languageCode) => {
    set({
      languageState: {
        ...get().languageState,
        currentLanguage: languageCode,
      },
    });
  },
  
  // 设置默认语言
  setDefaultLanguage: (languageCode) => {
    const { currentProject } = get();
    if (!currentProject || !currentProject.languages.includes(languageCode)) return;
    
    set({
      currentProject: {
        ...currentProject,
        defaultLanguage: languageCode,
        updatedAt: Date.now(),
      },
    });
    get().saveToLocalStorage();
  },
  
  // 设置背景图片
  setBackgroundImage: (languageCode, url, size) => {
    const { currentProject } = get();
    console.log('=== setBackgroundImage Debug Start ===');
    console.log('Language:', languageCode);
    console.log('URL:', url?.substring(0, 100) + '...');
    console.log('Size:', size);
    console.log('Current Project before update:', currentProject);
    
    if (!currentProject) {
      console.log('No current project, returning');
      console.error('setBackgroundImage: No current project');
      return;
    }

    console.log('setBackgroundImage called:', {
      languageCode,
      url: url.substring(0, 100) + '...',
      size,
      currentProjectId: currentProject.id
    });

    const updatedProject = {
      ...currentProject,
      backgroundImages: {
        ...currentProject.backgroundImages,
        [languageCode]: { url, size },
      },
      updatedAt: Date.now(),
    };
    
    console.log('Updated project:', updatedProject);
    console.log('Background images after update:', updatedProject.backgroundImages);
    
    set({
      currentProject: updatedProject,
    });
    
    console.log('Store updated, new state:', get().currentProject);

    console.log('setBackgroundImage completed:', {
      languageCode,
      hasBackgroundImage: !!updatedProject.backgroundImages[languageCode],
      backgroundImageUrl: updatedProject.backgroundImages[languageCode]?.url?.substring(0, 100) + '...'
    });
    console.log('=== setBackgroundImage Debug End ===');

    get().saveToLocalStorage();
  },
  
  // 移除背景图片
  removeBackgroundImage: (languageCode) => {
    const { currentProject } = get();
    if (!currentProject) return;
    
    const updatedBackgroundImages = { ...currentProject.backgroundImages };
    delete updatedBackgroundImages[languageCode];
    
    set({
      currentProject: {
        ...currentProject,
        backgroundImages: updatedBackgroundImages,
        updatedAt: Date.now(),
      },
    });
    get().saveToLocalStorage();
  },
  
  // 添加热区
  addHotspot: (hotspot) => {
    const { currentProject } = get();
    if (!currentProject) return '';
    
    const id = `hotspot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const maxZIndex = Math.max(0, ...currentProject.hotspots.map(h => h.zIndex));
    
    const newHotspot: MultiLanguageHotspotConfig = {
      ...hotspot,
      id,
      zIndex: maxZIndex + 1,
    };
    
    set({
      currentProject: {
        ...currentProject,
        hotspots: [...currentProject.hotspots, newHotspot],
        updatedAt: Date.now(),
      },
      selectedHotspotId: id,
    });
    
    get().saveToLocalStorage();
    return id;
  },
  
  // 更新热区
  updateHotspot: (id, updates) => {
    const { currentProject } = get();
    if (!currentProject) return;
    
    set({
      currentProject: {
        ...currentProject,
        hotspots: currentProject.hotspots.map(h => 
          h.id === id ? { ...h, ...updates } : h
        ),
        updatedAt: Date.now(),
      },
    });
    get().saveToLocalStorage();
  },
  
  // 删除热区
  deleteHotspot: (id) => {
    const { currentProject, selectedHotspotId } = get();
    if (!currentProject) return;
    
    set({
      currentProject: {
        ...currentProject,
        hotspots: currentProject.hotspots.filter(h => h.id !== id),
        updatedAt: Date.now(),
      },
      selectedHotspotId: selectedHotspotId === id ? null : selectedHotspotId,
    });
    get().saveToLocalStorage();
  },
  
  // 选择热区
  selectHotspot: (id) => {
    set({ selectedHotspotId: id });
  },
  
  // 获取选中的热区
  getSelectedHotspot: () => {
    const { currentProject, selectedHotspotId } = get();
    if (!currentProject || !selectedHotspotId) return null;
    return currentProject.hotspots.find(h => h.id === selectedHotspotId) || null;
  },
  
  // 获取多语言热区配置
  getMultiLanguageHotspotConfig: (hotspotId) => {
    const { currentProject } = get();
    if (!currentProject) return null;
    return currentProject.hotspots.find(h => h.id === hotspotId) || null;
  },
  
  // 更新多语言热区配置
  updateMultiLanguageHotspotConfig: (hotspotId, config) => {
    get().updateHotspot(hotspotId, config);
  },
  
  // 在语言间复制热区配置
  copyHotspotConfigBetweenLanguages: (hotspotId, fromLang, toLang) => {
    const { currentProject } = get();
    if (!currentProject) return;
    
    const hotspot = currentProject.hotspots.find(h => h.id === hotspotId);
    if (!hotspot) return;
    
    // 复制名称
    if (hotspot.name && hotspot.name[fromLang]) {
      get().updateHotspotText(hotspotId, 'name', toLang, hotspot.name[fromLang]);
    }
    
    // 复制动作数据
    if (hotspot.action?.data) {
      if (hotspot.action.data.url && hotspot.action.data.url[fromLang]) {
        get().updateHotspotText(hotspotId, 'action.url', toLang, hotspot.action.data.url[fromLang]);
      }
      if (hotspot.action.data.text && hotspot.action.data.text[fromLang]) {
        get().updateHotspotText(hotspotId, 'action.text', toLang, hotspot.action.data.text[fromLang]);
      }
    }
    
    // 复制数据
    if (hotspot.data) {
      if (hotspot.data.textContent && hotspot.data.textContent[fromLang]) {
        get().updateHotspotText(hotspotId, 'data.textContent', toLang, hotspot.data.textContent[fromLang]);
      }
      if (hotspot.data.imageUrl && hotspot.data.imageUrl[fromLang]) {
        get().updateHotspotText(hotspotId, 'data.imageUrl', toLang, hotspot.data.imageUrl[fromLang]);
      }
      if (hotspot.data.videoUrl && hotspot.data.videoUrl[fromLang]) {
        get().updateHotspotText(hotspotId, 'data.videoUrl', toLang, hotspot.data.videoUrl[fromLang]);
      }
      if (hotspot.data.gifUrl && hotspot.data.gifUrl[fromLang]) {
        get().updateHotspotText(hotspotId, 'data.gifUrl', toLang, hotspot.data.gifUrl[fromLang]);
      }
    }
  },
  
  // 重置热区配置为默认值
  resetHotspotConfigToDefault: (hotspotId, languageCode) => {
    const { currentProject } = get();
    if (!currentProject) return;
    
    const defaultLang = currentProject.defaultLanguage;
    if (defaultLang === languageCode) return;
    
    get().copyHotspotConfigBetweenLanguages(hotspotId, defaultLang, languageCode);
  },
  
  // 获取所有多语言热区
  getAllMultiLanguageHotspots: () => {
    const { currentProject } = get();
    if (!currentProject) return [];
    return currentProject.hotspots;
  },
  
  // 删除多语言热区
  deleteMultiLanguageHotspot: (hotspotId) => {
    get().deleteHotspot(hotspotId);
  },
  
  // 更新热区文本
  updateHotspotText: (hotspotId, field, languageCode, value) => {
    const { currentProject } = get();
    if (!currentProject) return;
    
    const hotspot = currentProject.hotspots.find(h => h.id === hotspotId);
    if (!hotspot) return;
    
    const updatedHotspot = { ...hotspot };
    
    // 根据字段类型更新对应的多语言文本
    if (field === 'name') {
      if (!updatedHotspot.name) updatedHotspot.name = {};
      updatedHotspot.name[languageCode] = value;
    } else if (field.startsWith('action.')) {
      const actionField = field.replace('action.', '');
      if (!updatedHotspot.action) return;
      if (!updatedHotspot.action.data) updatedHotspot.action.data = {};
      
      if (actionField === 'url') {
        if (!updatedHotspot.action.data.url) updatedHotspot.action.data.url = {};
        updatedHotspot.action.data.url[languageCode] = value;
      } else if (actionField === 'text') {
        if (!updatedHotspot.action.data.text) updatedHotspot.action.data.text = {};
        updatedHotspot.action.data.text[languageCode] = value;
      }
    } else if (field.startsWith('data.')) {
      const dataField = field.replace('data.', '');
      if (!updatedHotspot.data) updatedHotspot.data = {};
      
      if (dataField === 'textContent') {
        if (!updatedHotspot.data.textContent) updatedHotspot.data.textContent = {};
        updatedHotspot.data.textContent[languageCode] = value;
      } else if (dataField === 'imageUrl') {
        if (!updatedHotspot.data.imageUrl) updatedHotspot.data.imageUrl = {};
        updatedHotspot.data.imageUrl[languageCode] = value;
      } else if (dataField === 'videoUrl') {
        if (!updatedHotspot.data.videoUrl) updatedHotspot.data.videoUrl = {};
        updatedHotspot.data.videoUrl[languageCode] = value;
      } else if (dataField === 'gifUrl') {
        if (!updatedHotspot.data.gifUrl) updatedHotspot.data.gifUrl = {};
        updatedHotspot.data.gifUrl[languageCode] = value;
      }
    }
    
    get().updateHotspot(hotspotId, updatedHotspot);
  },
  
  // 复制文本到其他语言
  copyTextToLanguages: (hotspotId, field, sourceLanguage, targetLanguages) => {
    const { currentProject } = get();
    if (!currentProject) return;
    
    const hotspot = currentProject.hotspots.find(h => h.id === hotspotId);
    if (!hotspot) return;
    
    // 获取源语言的文本
    let sourceText = '';
    if (field === 'name' && hotspot.name) {
      sourceText = hotspot.name[sourceLanguage] || '';
    } else if (field.startsWith('action.') && hotspot.action?.data) {
      const actionField = field.replace('action.', '');
      if (actionField === 'url' && hotspot.action.data.url) {
        sourceText = hotspot.action.data.url[sourceLanguage] || '';
      } else if (actionField === 'text' && hotspot.action.data.text) {
        sourceText = hotspot.action.data.text[sourceLanguage] || '';
      }
    } else if (field.startsWith('data.') && hotspot.data) {
      const dataField = field.replace('data.', '');
      if (dataField === 'textContent' && hotspot.data.textContent) {
        sourceText = hotspot.data.textContent[sourceLanguage] || '';
      } else if (dataField === 'imageUrl' && hotspot.data.imageUrl) {
        sourceText = hotspot.data.imageUrl[sourceLanguage] || '';
      } else if (dataField === 'videoUrl' && hotspot.data.videoUrl) {
        sourceText = hotspot.data.videoUrl[sourceLanguage] || '';
      } else if (dataField === 'gifUrl' && hotspot.data.gifUrl) {
        sourceText = hotspot.data.gifUrl[sourceLanguage] || '';
      }
    }
    
    // 复制到目标语言
    targetLanguages.forEach(targetLanguage => {
      get().updateHotspotText(hotspotId, field, targetLanguage, sourceText);
    });
  },
  
  // 批量编辑
  batchEdit: (config) => {
    const { currentProject } = get();
    if (!currentProject) return;
    
    const targetHotspots = config.applyToAll 
      ? currentProject.hotspots 
      : currentProject.hotspots.filter(h => config.selectedHotspotIds?.includes(h.id));
    
    targetHotspots.forEach(hotspot => {
      config.targetLanguages.forEach(languageCode => {
        let field = '';
        
        switch (config.operation) {
          case 'UPDATE_NAME':
            field = 'name';
            break;
          case 'UPDATE_ACTION_URL':
            field = 'action.url';
            break;
          case 'UPDATE_ACTION_TEXT':
            field = 'action.text';
            break;
          case 'UPDATE_TEXT_CONTENT':
            field = 'data.textContent';
            break;
          case 'UPDATE_IMAGE_URL':
            field = 'data.imageUrl';
            break;
          case 'UPDATE_VIDEO_URL':
            field = 'data.videoUrl';
            break;
          case 'UPDATE_GIF_URL':
            field = 'data.gifUrl';
            break;
        }
        
        if (field) {
          get().updateHotspotText(hotspot.id, field, languageCode, config.value);
        }
      });
    });
  },
  
  // 切换显示所有语言
  toggleShowAllLanguages: () => {
    set({
      languageState: {
        ...get().languageState,
        showAllLanguages: !get().languageState.showAllLanguages,
      },
    });
  },
  
  // 切换对比模式
  toggleCompareMode: () => {
    set({
      languageState: {
        ...get().languageState,
        compareMode: !get().languageState.compareMode,
      },
    });
  },
  
  // 设置对比语言
  setCompareLanguages: (languages) => {
    set({
      languageState: {
        ...get().languageState,
        compareLanguages: languages,
      },
    });
  },
  
  // 导出单语言配置
  exportSingleLanguageConfig: (languageCode) => {
    const { currentProject } = get();
    if (!currentProject) return null;
    
    const backgroundImage = currentProject.backgroundImages[languageCode];
    if (!backgroundImage) return null;
    
    const modules = currentProject.hotspots.map(hotspot => {
      const module: any = {
        type: hotspot.type,
        rect: hotspot.rect,
      };
      
      // 添加名称
      if (hotspot.name && hotspot.name[languageCode]) {
        module.name = hotspot.name[languageCode];
      }
      
      // 添加动作
      if (hotspot.action) {
        module.action = {
          type: hotspot.action.type,
          data: {},
        };
        
        if (hotspot.action.data?.url && hotspot.action.data.url[languageCode]) {
          module.action.data.url = hotspot.action.data.url[languageCode];
        }
        
        if (hotspot.action.data?.text && hotspot.action.data.text[languageCode]) {
          module.action.data.text = hotspot.action.data.text[languageCode];
        }
      }
      
      // 添加数据
      if (hotspot.data) {
        module.data = { ...hotspot.data };
        
        if (hotspot.data.textContent && hotspot.data.textContent[languageCode]) {
          module.data.textContent = hotspot.data.textContent[languageCode];
        }
        
        if (hotspot.data.imageUrl && hotspot.data.imageUrl[languageCode]) {
          module.data.imageUrl = hotspot.data.imageUrl[languageCode];
        }
        
        if (hotspot.data.videoUrl && hotspot.data.videoUrl[languageCode]) {
          module.data.videoUrl = hotspot.data.videoUrl[languageCode];
        }
        
        if (hotspot.data.gifUrl && hotspot.data.gifUrl[languageCode]) {
          module.data.gifUrl = hotspot.data.gifUrl[languageCode];
        }
      }
      
      return module;
    });
    
    return {
      language: languageCode,
      backgroundImageUrl: backgroundImage.url,
      modules,
    };
  },
  
  // 导出所有语言配置
  exportAllLanguagesConfig: () => {
    const { currentProject } = get();
    if (!currentProject) return {};
    
    const result: { [key in LanguageCode]?: SingleLanguageExportConfig } = {};
    
    currentProject.languages.forEach(languageCode => {
      const config = get().exportSingleLanguageConfig(languageCode);
      if (config) {
        result[languageCode] = config;
      }
    });
    
    return result;
  },
  
  // 导入项目配置
  importProjectConfig: (config) => {
    try {
      if (config.currentProject) {
        const project = config.currentProject;
        set({
          projects: [...get().projects.filter(p => p.id !== project.id), project],
          currentProject: project,
          languageState: {
            ...get().languageState,
            currentLanguage: project.defaultLanguage,
          },
          selectedHotspotId: null,
        });
        get().saveToLocalStorage();
      }
    } catch (error) {
      console.error('Failed to import project config:', error);
    }
  },
  
  // 保存到本地存储
  saveToLocalStorage: () => {
    const { projects, currentProject } = get();
    
    const data = {
      projects,
      currentProjectId: currentProject?.id || null,
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
        if (data.projects) {
          set({ projects: data.projects });
          
          if (data.currentProjectId) {
            get().loadProject(data.currentProjectId);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
  },
}));