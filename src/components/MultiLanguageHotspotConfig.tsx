import React, { useState, useEffect } from 'react';
import { useMultiLanguageStore, SUPPORTED_LANGUAGES } from '../stores/multiLanguageStore';
import { useHotspotStore } from '../stores/hotspotStore';
import { LanguageCode, MultiLanguageText } from '../types/multiLanguage';
import { HotspotActionType } from '../types/hotspot';
import { Globe, Copy, RotateCcw, Save, AlertCircle, Check, X } from 'lucide-react';

interface MultiLanguageHotspotConfigProps {
  hotspotId: string;
  onClose?: () => void;
}

export const MultiLanguageHotspotConfig: React.FC<MultiLanguageHotspotConfigProps> = ({
  hotspotId,
  onClose
}) => {
  const {
    currentProject,
    languageState,
    getMultiLanguageHotspotConfig,
    updateMultiLanguageHotspotConfig,
    copyHotspotConfigBetweenLanguages,
    resetHotspotConfigToDefault,
  } = useMultiLanguageStore();
  
  const { hotspots } = useHotspotStore();
  
  const [localConfig, setLocalConfig] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<LanguageCode | 'template'>('template');
  const [copyFromLanguage, setCopyFromLanguage] = useState<LanguageCode | null>(null);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  
  const hotspot = hotspots.find(h => h.id === hotspotId);
  const config = getMultiLanguageHotspotConfig(hotspotId);
  
  useEffect(() => {
    if (config) {
      setLocalConfig(JSON.parse(JSON.stringify(config)));
    }
  }, [config]);
  
  useEffect(() => {
    if (currentProject && activeTab === 'template') {
      setActiveTab(currentProject.defaultLanguage);
    }
  }, [currentProject]);
  
  if (!currentProject || !hotspot || !config || !localConfig) {
    return null;
  }
  
  const handleTemplateChange = (field: string, value: any) => {
    setLocalConfig((prev: any) => ({
      ...prev,
      template: {
        ...prev.template,
        [field]: value
      }
    }));
    setHasChanges(true);
  };
  
  const handleLanguageConfigChange = (language: LanguageCode, field: string, value: any) => {
    setLocalConfig((prev: any) => ({
      ...prev,
      languageConfigs: {
        ...prev.languageConfigs,
        [language]: {
          ...prev.languageConfigs[language],
          [field]: value
        }
      }
    }));
    setHasChanges(true);
  };
  
  const handleSave = () => {
    updateMultiLanguageHotspotConfig(hotspotId, localConfig);
    setHasChanges(false);
  };
  
  const handleReset = () => {
    if (confirm('确定要重置所有更改吗？')) {
      setLocalConfig(JSON.parse(JSON.stringify(config)));
      setHasChanges(false);
    }
  };
  
  const handleCopyConfig = () => {
    if (copyFromLanguage && activeTab !== 'template' && activeTab !== copyFromLanguage) {
      copyHotspotConfigBetweenLanguages(hotspotId, copyFromLanguage, activeTab);
      setLocalConfig(JSON.parse(JSON.stringify(getMultiLanguageHotspotConfig(hotspotId))));
      setShowCopyDialog(false);
      setCopyFromLanguage(null);
    }
  };
  
  const handleResetToDefault = () => {
    if (activeTab !== 'template' && confirm('确定要重置为默认配置吗？')) {
      resetHotspotConfigToDefault(hotspotId, activeTab);
      setLocalConfig(JSON.parse(JSON.stringify(getMultiLanguageHotspotConfig(hotspotId))));
    }
  };
  
  const getCurrentConfig = () => {
    if (activeTab === 'template') {
      return localConfig.template;
    }
    return {
      ...localConfig.template,
      ...localConfig.languageConfigs[activeTab]
    };
  };
  
  const currentConfig = getCurrentConfig();
  const isTemplate = activeTab === 'template';
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Globe className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">多语言热区配置</h2>
              <p className="text-sm text-gray-600">
                热区ID: {hotspotId} • 位置: ({Math.round(parseFloat(hotspot.rect.left) || 0)}%, {Math.round(parseFloat(hotspot.rect.top) || 0)}%)
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {hasChanges && (
              <div className="flex items-center space-x-2 text-orange-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">有未保存的更改</span>
              </div>
            )}
            
            <button
              onClick={handleReset}
              disabled={!hasChanges}
              className="flex items-center space-x-1 px-3 py-1 text-gray-600 hover:text-gray-800 disabled:text-gray-400 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>重置</span>
            </button>
            
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>保存</span>
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex h-[calc(90vh-120px)]">
          {/* 语言标签页 */}
          <div className="w-64 border-r border-gray-200 bg-gray-50">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">配置语言</h3>
              
              <div className="space-y-1">
                {/* 模板配置 */}
                <button
                  onClick={() => setActiveTab('template')}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'template'
                      ? 'bg-blue-100 text-blue-900 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-xs font-mono">T</span>
                  </div>
                  <div>
                    <div className="font-medium">模板配置</div>
                    <div className="text-xs text-gray-500">默认属性</div>
                  </div>
                </button>
                
                {/* 语言配置 */}
                {currentProject.languages.map(languageCode => {
                  const langInfo = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
                  if (!langInfo) return null;
                  
                  const hasOverrides = localConfig.languageConfigs[languageCode] && 
                    Object.keys(localConfig.languageConfigs[languageCode]).length > 0;
                  
                  return (
                    <button
                      key={languageCode}
                      onClick={() => setActiveTab(languageCode)}
                      className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === languageCode
                          ? 'bg-blue-100 text-blue-900 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-lg">{langInfo.flag}</span>
                      <div className="flex-1">
                        <div className="font-medium">{langInfo.nativeName}</div>
                        <div className="text-xs text-gray-500">
                          {languageCode === currentProject.defaultLanguage && '默认 • '}
                          {hasOverrides ? '已自定义' : '使用模板'}
                        </div>
                      </div>
                      {hasOverrides && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* 操作按钮 */}
              {!isTemplate && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                  <button
                    onClick={() => setShowCopyDialog(true)}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span>复制配置</span>
                  </button>
                  
                  <button
                    onClick={handleResetToDefault}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>重置为默认</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* 配置表单 */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-2xl">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isTemplate ? '模板配置' : `${SUPPORTED_LANGUAGES.find(lang => lang.code === activeTab)?.nativeName} 配置`}
                </h3>
                <p className="text-sm text-gray-600">
                  {isTemplate 
                    ? '设置所有语言的默认属性，各语言可以覆盖这些设置'
                    : '设置此语言特有的属性，未设置的属性将使用模板配置'
                  }
                </p>
              </div>
              
              <div className="space-y-6">
                {/* 热区名称 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    热区名称
                  </label>
                  <input
                    type="text"
                    value={currentConfig.name || ''}
                    onChange={(e) => {
                      if (isTemplate) {
                        handleTemplateChange('name', e.target.value);
                      } else {
                        handleLanguageConfigChange(activeTab, 'name', e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={isTemplate ? '默认热区名称' : '此语言的热区名称'}
                  />
                  {!isTemplate && !localConfig.languageConfigs[activeTab]?.name && (
                    <p className="text-xs text-gray-500 mt-1">
                      当前使用模板配置: "{localConfig.template.name || '未设置'}"
                    </p>
                  )}
                </div>
                
                {/* 事件类型 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    事件类型
                  </label>
                  <select
                    value={currentConfig.action?.type || 'none'}
                    onChange={(e) => {
                      const newAction = { type: e.target.value as HotspotActionType, data: {} };
                      if (isTemplate) {
                        handleTemplateChange('action', newAction);
                      } else {
                        handleLanguageConfigChange(activeTab, 'action', newAction);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="none">无事件</option>
                    <option value="navigate">页面跳转</option>
                    <option value="popup">弹窗显示</option>
                    <option value="api">API调用</option>
                    <option value="custom">自定义事件</option>
                  </select>
                  {!isTemplate && !localConfig.languageConfigs[activeTab]?.action && (
                    <p className="text-xs text-gray-500 mt-1">
                      当前使用模板配置: "{localConfig.template.action?.type || 'none'}"
                    </p>
                  )}
                </div>
                
                {/* 事件数据 */}
                {currentConfig.action?.type && currentConfig.action.type !== 'none' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      事件数据
                    </label>
                    
                    {currentConfig.action.type === 'navigate' && (
                      <input
                        type="text"
                        value={currentConfig.action.data?.url || ''}
                        onChange={(e) => {
                          const newAction = {
                            ...currentConfig.action,
                            data: { ...currentConfig.action.data, url: e.target.value }
                          };
                          if (isTemplate) {
                            handleTemplateChange('action', newAction);
                          } else {
                            handleLanguageConfigChange(activeTab, 'action', newAction);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="跳转URL"
                      />
                    )}
                    
                    {currentConfig.action.type === 'popup' && (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={currentConfig.action.data?.title || ''}
                          onChange={(e) => {
                            const newAction = {
                              ...currentConfig.action,
                              data: { ...currentConfig.action.data, title: e.target.value }
                            };
                            if (isTemplate) {
                              handleTemplateChange('action', newAction);
                            } else {
                              handleLanguageConfigChange(activeTab, 'action', newAction);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="弹窗标题"
                        />
                        <textarea
                          value={currentConfig.action.data?.content || ''}
                          onChange={(e) => {
                            const newAction = {
                              ...currentConfig.action,
                              data: { ...currentConfig.action.data, content: e.target.value }
                            };
                            if (isTemplate) {
                              handleTemplateChange('action', newAction);
                            } else {
                              handleLanguageConfigChange(activeTab, 'action', newAction);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          placeholder="弹窗内容"
                        />
                      </div>
                    )}
                    
                    {(currentConfig.action.type === 'api' || currentConfig.action.type === 'custom') && (
                      <textarea
                        value={typeof currentConfig.action.data === 'string' 
                          ? currentConfig.action.data 
                          : JSON.stringify(currentConfig.action.data || {}, null, 2)
                        }
                        onChange={(e) => {
                          try {
                            const data = JSON.parse(e.target.value);
                            const newAction = { ...currentConfig.action, data };
                            if (isTemplate) {
                              handleTemplateChange('action', newAction);
                            } else {
                              handleLanguageConfigChange(activeTab, 'action', newAction);
                            }
                          } catch {
                            // 如果不是有效JSON，保存为字符串
                            const newAction = { ...currentConfig.action, data: e.target.value };
                            if (isTemplate) {
                              handleTemplateChange('action', newAction);
                            } else {
                              handleLanguageConfigChange(activeTab, 'action', newAction);
                            }
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        rows={4}
                        placeholder={currentConfig.action.type === 'api' ? 'API配置 (JSON格式)' : '自定义数据 (JSON格式)'}
                      />
                    )}
                  </div>
                )}
                
                {/* 描述 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    描述
                  </label>
                  <textarea
                    value={currentConfig.description || ''}
                    onChange={(e) => {
                      if (isTemplate) {
                        handleTemplateChange('description', e.target.value);
                      } else {
                        handleLanguageConfigChange(activeTab, 'description', e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder={isTemplate ? '默认描述' : '此语言的描述'}
                  />
                  {!isTemplate && !localConfig.languageConfigs[activeTab]?.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      当前使用模板配置: "{localConfig.template.description || '未设置'}"
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 复制配置弹窗 */}
      {showCopyDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">复制配置</h3>
              <button
                onClick={() => setShowCopyDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                从哪个语言复制配置？
              </label>
              <div className="space-y-2">
                {currentProject.languages
                  .filter(lang => lang !== activeTab)
                  .map(languageCode => {
                    const langInfo = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
                    if (!langInfo) return null;
                    
                    return (
                      <button
                        key={languageCode}
                        onClick={() => setCopyFromLanguage(languageCode)}
                        className={`w-full flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                          copyFromLanguage === languageCode
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-lg">{langInfo.flag}</span>
                        <span className="font-medium">{langInfo.nativeName}</span>
                        {copyFromLanguage === languageCode && (
                          <Check className="w-4 h-4 text-blue-600 ml-auto" />
                        )}
                      </button>
                    );
                  })
                }
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCopyDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCopyConfig}
                disabled={!copyFromLanguage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
              >
                复制
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};