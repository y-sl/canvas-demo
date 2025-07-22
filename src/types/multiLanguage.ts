// 多语言配置类型定义

// 支持的语言类型
export type LanguageCode = 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR' | 'es-ES' | 'fr-FR' | 'de-DE';

// 语言信息
export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string; // emoji flag
}

// 多语言文本配置
export interface MultiLanguageText {
  [key: string]: string; // key为语言代码，value为对应语言的文本
}

// 多语言热区配置
export interface MultiLanguageHotspotConfig {
  // 基础配置（所有语言共享）
  id: string;
  type: HotspotType;
  rect: HotspotRect; // 位置信息在所有语言中保持一致
  zIndex: number;
  
  // 多语言特定配置
  name?: MultiLanguageText; // 热区名称的多语言版本
  action?: {
    type: ActionType;
    data?: {
      url?: MultiLanguageText; // 跳转URL的多语言版本
      text?: MultiLanguageText; // 提示文本的多语言版本
    };
  };
  data?: {
    textContent?: MultiLanguageText; // 文本内容的多语言版本
    imageUrl?: MultiLanguageText; // 图片URL的多语言版本
    videoUrl?: MultiLanguageText; // 视频URL的多语言版本
    gifUrl?: MultiLanguageText; // GIF URL的多语言版本
    fontSize?: number;
    color?: string;
    fontWeight?: 'normal' | 'bold';
    textAlign?: 'left' | 'center' | 'right';
  };
}

// 多语言项目配置
export interface MultiLanguageProject {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  
  // 支持的语言列表
  languages: LanguageCode[];
  
  // 默认语言
  defaultLanguage: LanguageCode;
  
  // 每个语言的背景图片
  backgroundImages: {
    [key in LanguageCode]?: {
      url: string;
      size: { width: number; height: number };
    };
  };
  
  // 热区配置（多语言）
  hotspots: MultiLanguageHotspotConfig[];
}

// 导出配置（单语言）
export interface SingleLanguageExportConfig {
  language: LanguageCode;
  backgroundImageUrl: string;
  modules: Array<{
    type: HotspotType;
    name?: string;
    rect: HotspotRect;
    action?: HotspotAction;
    data?: ReplaceableData;
  }>;
}

// 批量编辑操作类型
export type BatchEditOperation = 
  | 'UPDATE_NAME'
  | 'UPDATE_ACTION_TYPE'
  | 'UPDATE_ACTION_URL'
  | 'UPDATE_ACTION_TEXT'
  | 'UPDATE_TEXT_CONTENT'
  | 'UPDATE_IMAGE_URL'
  | 'UPDATE_VIDEO_URL'
  | 'UPDATE_GIF_URL';

// 批量编辑配置
export interface BatchEditConfig {
  operation: BatchEditOperation;
  targetLanguages: LanguageCode[];
  value: string;
  applyToAll?: boolean; // 是否应用到所有热区
  selectedHotspotIds?: string[]; // 指定的热区ID列表
}

// 语言配置状态
export interface LanguageConfigState {
  currentLanguage: LanguageCode;
  showAllLanguages: boolean; // 是否显示所有语言的配置
  compareMode: boolean; // 是否开启对比模式
  compareLanguages: LanguageCode[]; // 对比的语言列表
}

// 导入相关类型
import { HotspotType, HotspotRect, ActionType, HotspotAction, ReplaceableData } from './hotspot';