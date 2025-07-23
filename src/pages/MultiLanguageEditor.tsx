import React, { useState, useEffect } from 'react';
import { useMultiLanguageStore } from '../stores/multiLanguageStore';
import { useHotspotStore } from '../stores/hotspotStore';
import { MultiLanguageProjectManager } from '../components/MultiLanguageProjectManager';
import { LanguageSelector } from '../components/LanguageSelector';
import { MultiLanguageHotspotList } from '../components/MultiLanguageHotspotList';
import { HotspotCanvas } from '../components/HotspotCanvas';
import { PropertyPanel } from '../components/PropertyPanel';
import { Toolbar } from '../components/Toolbar';
import { Globe, Upload, Download, Settings, Eye, EyeOff } from 'lucide-react';

export const MultiLanguageEditor: React.FC = () => {
  const {
    currentProject,
    languageState,
    setCurrentLanguage,
    setBackgroundImage,
    exportSingleLanguageConfig,
    exportAllLanguagesConfig,
    importProjectConfig,
  } = useMultiLanguageStore();
  
  const { 
    selectedHotspotId,
    hotspots 
  } = useHotspotStore();
  
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [showPropertyPanel, setShowPropertyPanel] = useState(true);
  const [showHotspotList, setShowHotspotList] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  
  // 如果没有项目，显示项目管理器
  useEffect(() => {
    if (!currentProject) {
      setShowProjectManager(true);
    }
  }, [currentProject]);
  

  
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          setBackgroundImage(languageState.currentLanguage, result, {
            width: img.width,
            height: img.height
          });
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };
  
  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };
  
  const handleExportCurrent = () => {
    if (currentProject) {
      const config = exportSingleLanguageConfig(languageState.currentLanguage);
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentProject.name}_${languageState.currentLanguage}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };
  
  const handleExportAll = () => {
    if (currentProject) {
      const config = exportAllLanguagesConfig();
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentProject.name}_all_languages.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };
  
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string);
          importProjectConfig(config);
        } catch (error) {
          alert('导入失败：文件格式不正确');
        }
      };
      reader.readAsText(file);
    }
  };
  
  if (showProjectManager) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Globe className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">多语言热区编辑器</h1>
            </div>
            <p className="text-gray-600">
              创建和管理多语言热区配置，支持不同语言下的个性化内容设置
            </p>
          </div>
          
          <MultiLanguageProjectManager
            onProjectSelect={() => setShowProjectManager(false)}
          />
        </div>
      </div>
    );
  }
  
  if (!currentProject) {
    return null;
  }
  
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 语言选择器 */}
      <LanguageSelector />
      
      {/* 工具栏 */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowProjectManager(true)}
              className="flex items-center space-x-2 px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>项目管理</span>
            </button>
            
            <div className="h-4 w-px bg-gray-300"></div>
            

            
            <div className="h-4 w-px bg-gray-300"></div>
            
            <button
              onClick={handleExportCurrent}
              className="flex items-center space-x-2 px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>导出当前语言</span>
            </button>
            
            <button
              onClick={handleExportAll}
              className="flex items-center space-x-2 px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>导出所有语言</span>
            </button>
            
            <label className="flex items-center space-x-2 px-3 py-1 text-gray-600 hover:text-gray-800 cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span>导入配置</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowHotspotList(!showHotspotList)}
              className={`flex items-center space-x-1 px-3 py-1 rounded transition-colors ${
                showHotspotList
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {showHotspotList ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="text-sm">热区列表</span>
            </button>
            
            <button
              onClick={() => setShowPropertyPanel(!showPropertyPanel)}
              className={`flex items-center space-x-1 px-3 py-1 rounded transition-colors ${
                showPropertyPanel
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {showPropertyPanel ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="text-sm">属性面板</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* 主要内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧热区列表 */}
        {showHotspotList && (
          <div className="w-80 border-r border-gray-200 bg-white overflow-hidden">
            <MultiLanguageHotspotList className="h-full" />
          </div>
        )}
        
        {/* 中间画布区域 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 工具栏 */}
          <Toolbar isMultiLanguage={true} />
          
          {/* 画布 */}
          <div 
            className={`flex-1 relative overflow-auto ${
              dragOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {currentProject.backgroundImages[languageState.currentLanguage] ? (
              <HotspotCanvas isMultiLanguage={true} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Upload className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg mb-2">拖拽图片到此处或点击上传</p>
                  <p className="text-sm">支持 JPG、PNG、GIF 等格式</p>
                  <p className="text-sm mt-4 text-gray-400">请使用上方工具栏的上传按钮</p>
                </div>
              </div>
            )}
            
            {dragOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-90">
                <div className="text-center">
                  <Upload className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                  <p className="text-xl font-medium text-blue-700">释放以上传图片</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* 右侧属性面板 */}
        {showPropertyPanel && (
          <div className="w-80 border-l border-gray-200 bg-white overflow-hidden">
            <PropertyPanel isMultiLanguage={true} />
          </div>
        )}
      </div>
    </div>
  );
};