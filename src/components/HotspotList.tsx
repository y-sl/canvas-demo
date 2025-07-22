import React from 'react';
import { useHotspotStore } from '../stores/hotspotStore';
import { HotspotType } from '../types/hotspot';
import { Eye, MousePointer, Square } from 'lucide-react';

interface HotspotListProps {
  className?: string;
}

const getHotspotTypeLabel = (type: HotspotType): string => {
  switch (type) {
    case 'HOTSPOT':
      return '热区';
    case 'REPLACEABLE':
      return '可替换区域';
    default:
      return '未知类型';
  }
};

const getHotspotIcon = (type: HotspotType) => {
  switch (type) {
    case 'HOTSPOT':
      return <MousePointer className="w-4 h-4" />;
    case 'REPLACEABLE':
      return <Square className="w-4 h-4" />;
    default:
      return <Eye className="w-4 h-4" />;
  }
};

export const HotspotList: React.FC<HotspotListProps> = ({ className = '' }) => {
  const { hotspots, selectedHotspotId, selectHotspot } = useHotspotStore();

  const handleHotspotClick = (hotspotId: string) => {
    selectHotspot(hotspotId);
  };

  return (
    <div className={`bg-white border-l border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">热区列表</h3>
        <p className="text-sm text-gray-500 mt-1">共 {hotspots.length} 个热区</p>
      </div>
      
      <div className="overflow-y-auto">
        {hotspots.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>暂无热区</p>
            <p className="text-xs mt-1">在画布上创建热区后将显示在这里</p>
          </div>
        ) : (
          <div className="p-2">
            {hotspots.map((hotspot) => {
              const isSelected = selectedHotspotId === hotspot.id;
              const displayName = hotspot.name || `热区 ${hotspot.id.slice(-4)}`;
              const typeLabel = getHotspotTypeLabel(hotspot.type);
              
              return (
                <div
                  key={hotspot.id}
                  onClick={() => handleHotspotClick(hotspot.id)}
                  className={`
                    p-3 mb-2 rounded-lg cursor-pointer transition-all duration-200
                    border-2 hover:shadow-md
                    ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`
                      p-2 rounded-md
                      ${
                        isSelected
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600'
                      }
                    `}>
                      {getHotspotIcon(hotspot.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className={`
                          font-medium truncate
                          ${
                            isSelected
                              ? 'text-blue-900'
                              : 'text-gray-900'
                          }
                        `}>
                          {displayName}
                        </h4>
                        <span className={`
                          px-2 py-1 text-xs rounded-full
                          ${
                            isSelected
                              ? 'bg-blue-200 text-blue-800'
                              : 'bg-gray-200 text-gray-700'
                          }
                        `}>
                          {typeLabel}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span>位置: ({Math.round(parseFloat(hotspot.rect.left) || 0)}%, {Math.round(parseFloat(hotspot.rect.top) || 0)}%)</span>
                        <span>大小: {Math.round(parseFloat(hotspot.rect.width) || 0)}%×{Math.round(parseFloat(hotspot.rect.height) || 0)}%</span>
                      </div>
                      
                      {hotspot.action && (
                        <div className="mt-1 text-xs text-gray-500">
                          事件: {hotspot.action.type}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};