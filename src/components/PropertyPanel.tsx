import React from 'react';
import { useHotspotStore } from '../stores/hotspotStore';
import { HotspotType, ActionType } from '../types/hotspot';
import { Trash2 } from 'lucide-react';

interface PropertyPanelProps {
  className?: string;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({ className }) => {
  const {
    getSelectedHotspot,
    updateHotspot,
    deleteHotspot,
  } = useHotspotStore();
  
  const selectedHotspot = getSelectedHotspot();
  
  if (!selectedHotspot) {
    return (
      <div className={`p-4 bg-white border-l border-gray-200 ${className}`}>
        <div className="text-center text-gray-500 mt-8">
          <p className="text-lg font-medium mb-2">未选中热区</p>
          <p className="text-sm">请在左侧画布中拖拽创建或选择一个热区</p>
        </div>
      </div>
    );
  }
  
  const handleTypeChange = (type: HotspotType) => {
    updateHotspot(selectedHotspot.id, { 
      type,
      // 保留现有的action和data属性
      ...(selectedHotspot.action && { action: selectedHotspot.action }),
      ...(selectedHotspot.data && { data: selectedHotspot.data })
    });
  };
  
  const handleActionTypeChange = (actionType: ActionType) => {
    updateHotspot(selectedHotspot.id, {
      action: {
        type: actionType,
        data: {},
      },
    });
  };
  
  const handleActionDataChange = (key: string, value: string) => {
    updateHotspot(selectedHotspot.id, {
      action: {
        ...selectedHotspot.action!,
        data: {
          ...selectedHotspot.action?.data,
          [key]: value,
        },
      },
    });
  };
  
  const handleDataChange = (key: string, value: any) => {
    updateHotspot(selectedHotspot.id, {
      data: {
        ...selectedHotspot.data,
        [key]: value,
      },
    });
  };
  
  const handleNameChange = (name: string) => {
    updateHotspot(selectedHotspot.id, {
      name: name.trim() || undefined,
    });
  };
  
  const handleDelete = () => {
    if (confirm('确定要删除这个热区吗？')) {
      deleteHotspot(selectedHotspot.id);
    }
  };
  
  return (
    <div className={`p-4 bg-white border-l border-gray-200 overflow-y-auto ${className}`}>
      <div className="space-y-6">
        {/* 标题 */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">热区属性</h3>
          <button
            onClick={handleDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="删除热区"
          >
            <Trash2 size={16} />
          </button>
        </div>
        
        {/* 基本信息 */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              热区ID
            </label>
            <input
              type="text"
              value={selectedHotspot.id}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              热区名称
            </label>
            <input
              type="text"
              value={selectedHotspot.name || ''}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="请输入热区名称或属性名"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              热区类型
            </label>
            <select
              value={selectedHotspot.type}
              onChange={(e) => handleTypeChange(e.target.value as HotspotType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="HOTSPOT">可点击热区</option>
              <option value="REPLACEABLE">可替换元素</option>
              <option value="VIDEO">视频区域</option>
              <option value="GIF">动图区域</option>
            </select>
          </div>
        </div>
        
        {/* 位置信息 */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">位置信息</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">左边距</label>
              <input
                type="text"
                value={selectedHotspot.rect.left}
                disabled
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">上边距</label>
              <input
                type="text"
                value={selectedHotspot.rect.top}
                disabled
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">宽度</label>
              <input
                type="text"
                value={selectedHotspot.rect.width}
                disabled
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">高度</label>
              <input
                type="text"
                value={selectedHotspot.rect.height}
                disabled
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50"
              />
            </div>
          </div>
        </div>
        
        {/* 热区类型特定配置 */}
        {selectedHotspot.type === 'HOTSPOT' && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">交互行为</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                事件类型
              </label>
              <select
                value={selectedHotspot.action?.type || 'JUMP_URL'}
                onChange={(e) => handleActionTypeChange(e.target.value as ActionType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="JUMP_URL">跳转链接</option>
                <option value="OPEN_VIP_PAGE">打开VIP页面</option>
                <option value="SHOW_TOAST">显示提示</option>
              </select>
            </div>
            
            {selectedHotspot.action?.type === 'JUMP_URL' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  跳转链接
                </label>
                <input
                  type="url"
                  value={selectedHotspot.action.data?.url || ''}
                  onChange={(e) => handleActionDataChange('url', e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
            
            {selectedHotspot.action?.type === 'SHOW_TOAST' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  提示文字
                </label>
                <input
                  type="text"
                  value={selectedHotspot.action.data?.text || ''}
                  onChange={(e) => handleActionDataChange('text', e.target.value)}
                  placeholder="请输入提示文字"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
            
            {selectedHotspot.action?.type === 'OPEN_VIP_PAGE' && (
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                点击时将打开VIP页面，无需额外配置。
              </div>
            )}
          </div>
        )}
        
        {selectedHotspot.type === 'REPLACEABLE' && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">元素替换</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                文本内容
              </label>
              <textarea
                value={selectedHotspot.data?.textContent || ''}
                onChange={(e) => handleDataChange('textContent', e.target.value)}
                placeholder="请输入文本内容"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  字号
                </label>
                <input
                  type="number"
                  value={selectedHotspot.data?.fontSize || 14}
                  onChange={(e) => handleDataChange('fontSize', parseInt(e.target.value))}
                  min="8"
                  max="72"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  文字颜色
                </label>
                <input
                  type="color"
                  value={selectedHotspot.data?.color || '#000000'}
                  onChange={(e) => handleDataChange('color', e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  字重
                </label>
                <select
                  value={selectedHotspot.data?.fontWeight || 'normal'}
                  onChange={(e) => handleDataChange('fontWeight', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="normal">正常</option>
                  <option value="bold">粗体</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  对齐方式
                </label>
                <select
                  value={selectedHotspot.data?.textAlign || 'left'}
                  onChange={(e) => handleDataChange('textAlign', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="left">左对齐</option>
                  <option value="center">居中</option>
                  <option value="right">右对齐</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                图片链接
              </label>
              <input
                type="url"
                value={selectedHotspot.data?.imageUrl || ''}
                onChange={(e) => handleDataChange('imageUrl', e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}
        
        {selectedHotspot.type === 'VIDEO' && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">视频配置</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                视频链接
              </label>
              <input
                type="url"
                value={selectedHotspot.data?.videoUrl || ''}
                onChange={(e) => handleDataChange('videoUrl', e.target.value)}
                placeholder="https://example.com/video.mp4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}
        
        {selectedHotspot.type === 'GIF' && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">GIF配置</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GIF链接
              </label>
              <input
                type="url"
                value={selectedHotspot.data?.gifUrl || ''}
                onChange={(e) => handleDataChange('gifUrl', e.target.value)}
                placeholder="https://example.com/animation.gif"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}
        
        {/* 图层信息 */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">图层信息</h4>
          <div>
            <label className="block text-xs text-gray-600 mb-1">层级</label>
            <input
              type="number"
              value={selectedHotspot.zIndex}
              disabled
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50"
            />
          </div>
        </div>
      </div>
    </div>
  );
};