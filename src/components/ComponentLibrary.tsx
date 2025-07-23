import React from 'react';
import { Square } from 'lucide-react';
import { useComponentStore } from '../stores/componentStore';
import { ComponentLibraryItem } from '../types/component';

interface ComponentLibraryProps {
  className?: string;
}

export const ComponentLibrary: React.FC<ComponentLibraryProps> = ({ className = '' }) => {
  const { componentLibrary, addComponent } = useComponentStore();
  
  const handleComponentClick = (libraryItem: ComponentLibraryItem) => {
    // 在画布中心位置添加组件
    const centerX = 300; // 画布中心X坐标
    const centerY = 200; // 画布中心Y坐标
    
    addComponent({
      type: libraryItem.type,
      name: libraryItem.name,
      position: {
        x: centerX - libraryItem.defaultStyle.width / 2,
        y: centerY - libraryItem.defaultStyle.height / 2
      },
      size: {
        width: libraryItem.defaultStyle.width,
        height: libraryItem.defaultStyle.height
      },
      props: { ...libraryItem.defaultProps },
      style: { ...libraryItem.defaultStyle }
    });
  };
  
  const renderComponentIcon = (type: string) => {
    switch (type) {
      case 'button':
        return <Square className="w-6 h-6" />;
      default:
        return <Square className="w-6 h-6" />;
    }
  };
  
  return (
    <div className={`bg-white border-r-2 border-blue-300 ${className}`} style={{minWidth: '256px'}}>
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">组件库</h2>
        <p className="text-sm text-gray-500 mt-1">点击组件添加到画布</p>
        <p className="text-xs text-blue-600 mt-1">当前组件数量: {componentLibrary.length}</p>
      </div>
      
      <div className="p-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 mb-3">基础组件</h3>
          
          {componentLibrary.map((item) => (
            <div
              key={item.id}
              onClick={() => handleComponentClick(item)}
              className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200 group"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                {renderComponentIcon(item.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {item.category}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {/* 调试信息 */}
        {componentLibrary.length === 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">⚠️ 组件库为空</p>
          </div>
        )}
        
        {/* 使用说明 */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-xs font-medium text-gray-700 mb-2">使用说明</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• 点击组件添加到画布中心</li>
            <li>• 在画布中拖拽调整位置</li>
            <li>• 选中组件编辑属性</li>
          </ul>
        </div>
      </div>
    </div>
  );
};