import React, { useState } from 'react';
import { useMultiLanguageStore, SUPPORTED_LANGUAGES } from '../stores/multiLanguageStore';
import { useHotspotStore } from '../stores/hotspotStore';
import { LanguageCode } from '../types/multiLanguage';
import { MultiLanguageHotspotConfig } from './MultiLanguageHotspotConfig';
import { 
  Globe, 
  Settings, 
  Eye, 
  EyeOff, 
  Copy, 
  Trash2, 
  Plus,
  GitCompare,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface MultiLanguageHotspotListProps {
  className?: string;
}

export const MultiLanguageHotspotList: React.FC<MultiLanguageHotspotListProps> = ({ 
  className = '' 
}) => {
  const {
    currentProject,
    languageState,
    getMultiLanguageHotspotConfig,
    getAllMultiLanguageHotspots,
    deleteMultiLanguageHotspot,
  } = useMultiLanguageStore();
  
  const { 
    hotspots, 
    selectedHotspotId, 
    selectHotspot
  } = useHotspotStore();
  
  const [configHotspotId, setConfigHotspotId] = useState<string | null>(null);
  const [expandedHotspots, setExpandedHotspots] = useState<Set<string>>(new Set());
  const [showOnlyVisible, setShowOnlyVisible] = useState(false);
  
  if (!currentProject) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <Globe className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p>请先创建或选择多语言项目</p>
        </div>
      </div>
    );
  }
  
  const multiLanguageHotspots = getAllMultiLanguageHotspots();
  const filteredHotspots = multiLanguageHotspots;
  
  const toggleExpanded = (hotspotId: string) => {
    const newExpanded = new Set(expandedHotspots);
    if (newExpanded.has(hotspotId)) {
      newExpanded.delete(hotspotId);
    } else {
      newExpanded.add(hotspotId);
    }
    setExpandedHotspots(newExpanded);
  };
  
  const handleHotspotSelect = (hotspotId: string) => {
    selectHotspot(hotspotId);
  };
  
  const handleDeleteHotspot = (hotspotId: string) => {
    if (confirm('确定要删除这个热区吗？此操作将删除所有语言的配置。')) {
      deleteMultiLanguageHotspot(hotspotId);
    }
  };
  
  const getHotspotDisplayName = (hotspotId: string, languageCode?: LanguageCode) => {
    const config = getMultiLanguageHotspotConfig(hotspotId);
    if (!config) return '未命名热区';
    
    if (languageCode) {
      const langConfig = config.languageConfigs[languageCode];
      if (langConfig?.name) return langConfig.name;
    }
    
    return config.template.name || '未命名热区';
  };
  
  const getHotspotActionType = (hotspotId: string, languageCode?: LanguageCode) => {
    const config = getMultiLanguageHotspotConfig(hotspotId);
    if (!config) return 'none';
    
    if (languageCode) {
      const langConfig = config.languageConfigs[languageCode];
      if (langConfig?.action) return langConfig.action.type;
    }
    
    return config.template.action?.type || 'none';
  };
  
  const getActionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'none': '无事件',
      'navigate': '页面跳转',
      'popup': '弹窗显示',
      'api': 'API调用',
      'custom': '自定义事件'
    };
    return labels[type] || type;
  };
  
  const hasLanguageOverrides = (hotspotId: string, languageCode: LanguageCode) => {
    const config = getMultiLanguageHotspotConfig(hotspotId);
    if (!config) return false;
    
    const langConfig = config.languageConfigs[languageCode];
    return langConfig && Object.keys(langConfig).length > 0;
  };
  
  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* 头部 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-gray-900">多语言热区</h3>
            <span className="text-sm text-gray-500">({filteredHotspots.length})</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowOnlyVisible(!showOnlyVisible)}
              className={`p-1 rounded transition-colors ${
                showOnlyVisible
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title={showOnlyVisible ? '显示所有热区' : '只显示可见热区'}
            >
              {showOnlyVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        {/* 当前语言信息 */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>当前语言:</span>
          {(() => {
            const langInfo = SUPPORTED_LANGUAGES.find(lang => lang.code === languageState.currentLanguage);
            return langInfo ? (
              <div className="flex items-center space-x-1">
                <span>{langInfo.flag}</span>
                <span className="font-medium">{langInfo.nativeName}</span>
              </div>
            ) : null;
          })()}
          
          {languageState.compareMode && (
            <>
              <span className="mx-2">•</span>
              <div className="flex items-center space-x-1">
                <GitCompare className="w-3 h-3" />
                <span>对比模式</span>
                <span className="text-xs bg-purple-100 text-purple-700 px-1 rounded">
                  {languageState.compareLanguages.length} 种语言
                </span>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* 热区列表 */}
      <div className="max-h-96 overflow-y-auto">
        {filteredHotspots.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Plus className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>还没有热区</p>
            <p className="text-sm">在画布上绘制热区来开始配置</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredHotspots.map(config => {
              const hotspot = hotspots.find(h => h.id === config.hotspotId);
              if (!hotspot) return null;
              
              const isSelected = selectedHotspotId === config.hotspotId;
              const isExpanded = expandedHotspots.has(config.hotspotId);
              const isVisible = true; // 暂时设为true，后续可以添加可见性控制
              
              return (
                <div key={config.hotspotId} className="p-3">
                  {/* 热区基本信息 */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleExpanded(config.hotspotId)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleHotspotSelect(config.hotspotId)}
                      className={`flex-1 text-left p-2 rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className={`font-medium ${
                              isSelected ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                              {getHotspotDisplayName(config.hotspotId, languageState.currentLanguage)}
                            </span>
                            <span className={`text-xs px-1 rounded ${
                              isSelected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {getActionTypeLabel(getHotspotActionType(config.hotspotId, languageState.currentLanguage))}
                            </span>
                            {!isVisible && (
                              <EyeOff className="w-3 h-3 text-gray-400" />
                            )}
                          </div>
                          
                          <div className="text-xs text-gray-500 mt-1">
                            位置: ({Math.round(parseFloat(hotspot.rect.left) || 0)}%, {Math.round(parseFloat(hotspot.rect.top) || 0)}%) • 
                            大小: {Math.round(parseFloat(hotspot.rect.width) || 0)}% × {Math.round(parseFloat(hotspot.rect.height) || 0)}%
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          {/* 语言覆盖指示器 */}
                          <div className="flex space-x-1">
                            {currentProject.languages.map(langCode => {
                              const hasOverrides = hasLanguageOverrides(config.hotspotId, langCode);
                              const langInfo = SUPPORTED_LANGUAGES.find(lang => lang.code === langCode);
                              
                              return langInfo ? (
                                <div
                                  key={langCode}
                                  className={`w-2 h-2 rounded-full ${
                                    hasOverrides ? 'bg-blue-500' : 'bg-gray-200'
                                  }`}
                                  title={`${langInfo.nativeName}: ${hasOverrides ? '已自定义' : '使用模板'}`}
                                />
                              ) : null;
                            })}
                          </div>
                        </div>
                      </div>
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {/* 可见性控制暂时移除，后续可以添加 */}
                      
                      <button
                        onClick={() => setConfigHotspotId(config.hotspotId)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="配置热区"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteHotspot(config.hotspotId)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="删除热区"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* 展开的语言详情 */}
                  {isExpanded && (
                    <div className="mt-3 ml-6 space-y-2">
                      {languageState.compareMode && languageState.compareLanguages.length > 0 ? (
                        // 对比模式
                        <div className="grid grid-cols-1 gap-2">
                          {languageState.compareLanguages.map(langCode => {
                            const langInfo = SUPPORTED_LANGUAGES.find(lang => lang.code === langCode);
                            if (!langInfo) return null;
                            
                            const hasOverrides = hasLanguageOverrides(config.hotspotId, langCode);
                            const displayName = getHotspotDisplayName(config.hotspotId, langCode);
                            const actionType = getHotspotActionType(config.hotspotId, langCode);
                            
                            return (
                              <div key={langCode} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center space-x-2">
                                  <span className="text-lg">{langInfo.flag}</span>
                                  <span className="text-sm font-medium">{langInfo.nativeName}</span>
                                  {hasOverrides && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">自定义</span>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium">{displayName}</div>
                                  <div className="text-xs text-gray-500">{getActionTypeLabel(actionType)}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        // 普通模式 - 显示所有语言
                        <div className="space-y-1">
                          {currentProject.languages.map(langCode => {
                            const langInfo = SUPPORTED_LANGUAGES.find(lang => lang.code === langCode);
                            if (!langInfo) return null;
                            
                            const hasOverrides = hasLanguageOverrides(config.hotspotId, langCode);
                            const displayName = getHotspotDisplayName(config.hotspotId, langCode);
                            const actionType = getHotspotActionType(config.hotspotId, langCode);
                            const isCurrent = langCode === languageState.currentLanguage;
                            
                            return (
                              <div 
                                key={langCode} 
                                className={`flex items-center justify-between p-2 rounded text-sm ${
                                  isCurrent ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <span>{langInfo.flag}</span>
                                  <span className="font-medium">{langInfo.nativeName}</span>
                                  {langCode === currentProject.defaultLanguage && (
                                    <span className="text-xs bg-green-100 text-green-700 px-1 rounded">默认</span>
                                  )}
                                  {hasOverrides && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">自定义</span>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">{displayName}</div>
                                  <div className="text-xs text-gray-500">{getActionTypeLabel(actionType)}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* 多语言热区配置弹窗 */}
      {configHotspotId && (
        <MultiLanguageHotspotConfig
          hotspotId={configHotspotId}
          onClose={() => setConfigHotspotId(null)}
        />
      )}
    </div>
  );
};