import React, { useState } from 'react';
import { useMultiLanguageStore, SUPPORTED_LANGUAGES } from '../stores/multiLanguageStore';
import { LanguageCode } from '../types/multiLanguage';
import { Globe, Plus, X, Check, Eye, EyeOff, GitCompare } from 'lucide-react';

interface LanguageSelectorProps {
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '' }) => {
  const {
    currentProject,
    languageState,
    setCurrentLanguage,
    addLanguage,
    removeLanguage,
    setDefaultLanguage,
    toggleShowAllLanguages,
    toggleCompareMode,
    setCompareLanguages,
  } = useMultiLanguageStore();
  
  const [showAddLanguage, setShowAddLanguage] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  
  if (!currentProject) {
    return null;
  }
  
  const currentLanguageInfo = SUPPORTED_LANGUAGES.find(lang => lang.code === languageState.currentLanguage);
  const availableLanguages = SUPPORTED_LANGUAGES.filter(lang => 
    !currentProject.languages.includes(lang.code)
  );
  
  const handleAddLanguage = (languageCode: LanguageCode) => {
    addLanguage(languageCode);
    setShowAddLanguage(false);
  };
  
  const handleRemoveLanguage = (languageCode: LanguageCode) => {
    if (currentProject.languages.length > 1 && languageCode !== currentProject.defaultLanguage) {
      removeLanguage(languageCode);
    }
  };
  
  const handleSetDefaultLanguage = (languageCode: LanguageCode) => {
    setDefaultLanguage(languageCode);
  };
  
  const handleCompareLanguageToggle = (languageCode: LanguageCode) => {
    const { compareLanguages } = languageState;
    const newCompareLanguages = compareLanguages.includes(languageCode)
      ? compareLanguages.filter(lang => lang !== languageCode)
      : [...compareLanguages, languageCode];
    
    setCompareLanguages(newCompareLanguages);
  };
  
  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="flex items-center justify-between p-4">
        {/* 当前语言和切换 */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Globe className="w-4 h-4 text-blue-600" />
              <span className="text-lg">{currentLanguageInfo?.flag}</span>
              <span className="font-medium text-blue-900">{currentLanguageInfo?.nativeName}</span>
              <span className="text-sm text-blue-600">({currentLanguageInfo?.code})</span>
            </button>
            
            {showLanguageMenu && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 mb-2 px-2">选择语言</div>
                  {currentProject.languages.map(languageCode => {
                    const langInfo = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
                    if (!langInfo) return null;
                    
                    const isDefault = languageCode === currentProject.defaultLanguage;
                    const isCurrent = languageCode === languageState.currentLanguage;
                    
                    return (
                      <div key={languageCode} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                        <button
                          onClick={() => {
                            setCurrentLanguage(languageCode);
                            setShowLanguageMenu(false);
                          }}
                          className={`flex items-center space-x-2 flex-1 text-left ${
                            isCurrent ? 'text-blue-600 font-medium' : 'text-gray-700'
                          }`}
                        >
                          <span className="text-lg">{langInfo.flag}</span>
                          <span>{langInfo.nativeName}</span>
                          <span className="text-xs text-gray-500">({langInfo.code})</span>
                          {isDefault && (
                            <span className="text-xs bg-green-100 text-green-700 px-1 rounded">默认</span>
                          )}
                          {isCurrent && <Check className="w-4 h-4" />}
                        </button>
                        
                        <div className="flex items-center space-x-1">
                          {!isDefault && (
                            <button
                              onClick={() => handleSetDefaultLanguage(languageCode)}
                              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                              title="设为默认语言"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                          
                          {!isDefault && currentProject.languages.length > 1 && (
                            <button
                              onClick={() => handleRemoveLanguage(languageCode)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="删除语言"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {availableLanguages.length > 0 && (
                    <>
                      <div className="border-t border-gray-100 my-2"></div>
                      <button
                        onClick={() => setShowAddLanguage(true)}
                        className="flex items-center space-x-2 w-full p-2 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>添加语言</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* 项目信息 */}
          <div className="text-sm text-gray-600">
            <span className="font-medium">{currentProject.name}</span>
            <span className="mx-2">•</span>
            <span>{currentProject.languages.length} 种语言</span>
          </div>
        </div>
        
        {/* 视图控制 */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleShowAllLanguages}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-colors ${
              languageState.showAllLanguages
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={languageState.showAllLanguages ? '隐藏其他语言' : '显示所有语言'}
          >
            {languageState.showAllLanguages ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            <span className="text-sm">全部语言</span>
          </button>
          
          <button
            onClick={toggleCompareMode}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-colors ${
              languageState.compareMode
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={languageState.compareMode ? '退出对比模式' : '进入对比模式'}
          >
            <GitCompare className="w-4 h-4" />
            <span className="text-sm">对比</span>
          </button>
        </div>
      </div>
      
      {/* 对比模式语言选择 */}
      {languageState.compareMode && (
        <div className="px-4 pb-4">
          <div className="text-sm font-medium text-gray-700 mb-2">选择要对比的语言：</div>
          <div className="flex flex-wrap gap-2">
            {currentProject.languages.map(languageCode => {
              const langInfo = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
              if (!langInfo) return null;
              
              const isSelected = languageState.compareLanguages.includes(languageCode);
              
              return (
                <button
                  key={languageCode}
                  onClick={() => handleCompareLanguageToggle(languageCode)}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-md text-sm transition-colors ${
                    isSelected
                      ? 'bg-purple-100 text-purple-700 border border-purple-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  <span>{langInfo.flag}</span>
                  <span>{langInfo.nativeName}</span>
                  {isSelected && <Check className="w-3 h-3" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* 添加语言弹窗 */}
      {showAddLanguage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">添加语言</h3>
              <button
                onClick={() => setShowAddLanguage(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2">
              {availableLanguages.map(language => (
                <button
                  key={language.code}
                  onClick={() => handleAddLanguage(language.code)}
                  className="flex items-center space-x-3 w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="text-2xl">{language.flag}</span>
                  <div>
                    <div className="font-medium">{language.nativeName}</div>
                    <div className="text-sm text-gray-500">{language.name} ({language.code})</div>
                  </div>
                </button>
              ))}
            </div>
            
            {availableLanguages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                所有支持的语言都已添加
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};