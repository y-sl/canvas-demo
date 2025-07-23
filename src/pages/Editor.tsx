import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HotspotCanvas } from '../components/HotspotCanvas';
import { PropertyPanel } from '../components/PropertyPanel';
import { HotspotList } from '../components/HotspotList';
import { ComponentLibrary } from '../components/ComponentLibrary';
import { Toolbar } from '../components/Toolbar';
import { useHotspotStore } from '../stores/hotspotStore';
import { useComponentStore } from '../stores/componentStore';
import { Toaster } from 'sonner';
import { Globe } from 'lucide-react';

export const Editor: React.FC = () => {
  const { loadFromLocalStorage } = useHotspotStore();
  const { loadFromLocalStorage: loadComponentsFromLocalStorage } = useComponentStore();
  
  // 页面加载时从本地存储恢复数据
  useEffect(() => {
    loadFromLocalStorage();
    loadComponentsFromLocalStorage();
  }, [loadFromLocalStorage, loadComponentsFromLocalStorage]);
  
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">热区编辑器</h1>
          <Link
            to="/multi-language"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span>多语言编辑器</span>
          </Link>
        </div>
      </div>
      
      {/* 工具栏 */}
      <Toolbar />
      
      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧组件库面板 - 超级明显的样式 */}
        <div className="w-64 flex-shrink-0 bg-yellow-300 border-r-8 border-red-600" style={{minWidth: '256px'}}>
          <div className="h-full bg-green-200">
            <div className="p-4 bg-purple-400 text-white text-center font-bold text-xl">
              组件库在这里！
            </div>
            <ComponentLibrary className="h-full" />
          </div>
        </div>
        
        {/* 画布区域 */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-100">
          <div className="max-w-[750px] mx-auto">
            <HotspotCanvas className="" />
          </div>
        </div>
        
        {/* 右侧面板区域 */}
        <div className="w-96 flex-shrink-0 flex flex-col overflow-hidden">
          {/* 属性面板 */}
          <div className="flex-1 border-b border-gray-200">
            <PropertyPanel className="h-full" />
          </div>
          
          {/* 热区列表面板 */}
          <div className="flex-1">
            <HotspotList className="h-full" />
          </div>
        </div>
      </div>
      
      {/* Toast 通知 */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
            border: 'none',
          },
        }}
      />
    </div>
  );
};