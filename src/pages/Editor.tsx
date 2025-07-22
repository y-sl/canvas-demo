import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HotspotCanvas } from '../components/HotspotCanvas';
import { PropertyPanel } from '../components/PropertyPanel';
import { HotspotList } from '../components/HotspotList';
import { Toolbar } from '../components/Toolbar';
import { useHotspotStore } from '../stores/hotspotStore';
import { Toaster } from 'sonner';
import { Globe } from 'lucide-react';

export const Editor: React.FC = () => {
  const { loadFromLocalStorage } = useHotspotStore();
  
  // 页面加载时从本地存储恢复数据
  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);
  
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
        {/* 画布区域 */}
        <div className="w-[750px] flex-shrink-0 p-4 overflow-y-auto">
          <HotspotCanvas className="" />
        </div>
        
        {/* 右侧面板区域 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 属性面板 */}
          <div className="w-80 flex-shrink-0">
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