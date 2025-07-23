import React from 'react';
import { useHotspotStore } from '../stores/hotspotStore';
import { useMultiLanguageStore } from '../stores/multiLanguageStore';
import { useComponentStore } from '../stores/componentStore';
import { HotspotType, ActionType } from '../types/hotspot';
import { Trash2 } from 'lucide-react';

interface PropertyPanelProps {
  className?: string;
  isMultiLanguage?: boolean;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({ className, isMultiLanguage = false }) => {
  // 根据是否为多语言模式选择不同的store
  const hotspotStore = useHotspotStore();
  const multiLanguageStore = useMultiLanguageStore();
  const componentStore = useComponentStore();
  
  const {
    getSelectedHotspot,
    updateHotspot,
    deleteHotspot,
  } = isMultiLanguage ? {
    getSelectedHotspot: multiLanguageStore.getSelectedHotspot,
    updateHotspot: multiLanguageStore.updateHotspot,
    deleteHotspot: multiLanguageStore.deleteHotspot,
  } : hotspotStore;
  
  const {
    selectedComponentId,
    getSelectedComponent,
    updateComponent,
    deleteComponent,
  } = componentStore;
  
  const selectedHotspot = getSelectedHotspot();
  const selectedComponent = getSelectedComponent();
  
  // 如果既没有选中热区也没有选中组件
  if (!selectedHotspot && !selectedComponent) {
    return (
      <div className={`p-4 bg-white border-l border-gray-200 ${className}`}>
        <div className="text-center text-gray-500 mt-8">
          <p className="text-lg font-medium mb-2">未选中对象</p>
          <p className="text-sm">请在画布中选择一个热区或组件</p>
        </div>
      </div>
    );
  }
  
  // 如果选中的是组件，显示组件属性面板
  if (selectedComponent) {
    return (
      <div className={`p-4 bg-white border-l border-gray-200 overflow-y-auto ${className}`}>
        <ComponentPropertyPanel 
          component={selectedComponent}
          updateComponent={updateComponent}
          deleteComponent={deleteComponent}
        />
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
        data: isMultiLanguage ? {} : {},
      },
    });
  };
  
  const handleActionDataChange = (key: string, value: string) => {
    if (isMultiLanguage) {
      // 在多语言模式下，需要构建多语言对象
      const currentLanguage = multiLanguageStore.languageState.currentLanguage;
      const existingValue = selectedHotspot.action?.data?.[key];
      
      let newValue;
      if (typeof existingValue === 'object' && existingValue !== null) {
        // 如果已经是多语言对象，更新当前语言的值
        newValue = {
          ...existingValue,
          [currentLanguage]: value,
        };
      } else {
        // 如果不是多语言对象，创建新的多语言对象
        newValue = {
          [currentLanguage]: value,
        };
      }
      
      updateHotspot(selectedHotspot.id, {
        action: {
          ...selectedHotspot.action!,
          data: {
            ...selectedHotspot.action?.data,
            [key]: newValue,
          },
        },
      });
    } else {
      // 非多语言模式，直接设置值
      updateHotspot(selectedHotspot.id, {
        action: {
          ...selectedHotspot.action!,
          data: {
            ...selectedHotspot.action?.data,
            [key]: value,
          },
        },
      });
    }
  };
  
  const handleDataChange = (key: string, value: any) => {
    if (isMultiLanguage) {
      // 在多语言模式下，需要构建多语言对象
      const currentLanguage = multiLanguageStore.languageState.currentLanguage;
      const existingValue = selectedHotspot.data?.[key];
      
      let newValue;
      if (typeof existingValue === 'object' && existingValue !== null) {
        // 如果已经是多语言对象，更新当前语言的值
        newValue = {
          ...existingValue,
          [currentLanguage]: value,
        };
      } else {
        // 如果不是多语言对象，创建新的多语言对象
        newValue = {
          [currentLanguage]: value,
        };
      }
      
      updateHotspot(selectedHotspot.id, {
        data: {
          ...selectedHotspot.data,
          [key]: newValue,
        },
      });
    } else {
      // 非多语言模式，直接设置值
      updateHotspot(selectedHotspot.id, {
        data: {
          ...selectedHotspot.data,
          [key]: value,
        },
      });
    }
  };
  
  // 获取当前语言的值（用于多语言模式）
  const getCurrentLanguageValue = (value: any): string => {
    if (!isMultiLanguage || typeof value === 'string' || value === undefined || value === null) {
      return value || '';
    }
    // 如果是多语言对象，获取当前语言的值
    const currentLanguage = multiLanguageStore.languageState.currentLanguage;
    return value[currentLanguage] || '';
  };
  
  const handleNameChange = (name: string) => {
    if (isMultiLanguage) {
      // 在多语言模式下，需要构建多语言对象
      const currentLanguage = multiLanguageStore.languageState.currentLanguage;
      const existingName = selectedHotspot.name;
      
      let newName;
      if (typeof existingName === 'object' && existingName !== null) {
        // 如果已经是多语言对象，更新当前语言的值
        newName = {
          ...existingName,
          [currentLanguage]: name.trim() || '',
        };
      } else {
        // 如果不是多语言对象，创建新的多语言对象
        newName = {
          [currentLanguage]: name.trim() || '',
        };
      }
      
      updateHotspot(selectedHotspot.id, {
        name: newName,
      });
    } else {
      // 非多语言模式，直接设置值
      updateHotspot(selectedHotspot.id, {
        name: name.trim() || undefined,
      });
    }
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
              value={getCurrentLanguageValue(selectedHotspot.name)}
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
                  value={getCurrentLanguageValue(selectedHotspot.action.data?.url)}
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
                  value={getCurrentLanguageValue(selectedHotspot.action.data?.text)}
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
                value={getCurrentLanguageValue(selectedHotspot.data?.textContent)}
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
                value={getCurrentLanguageValue(selectedHotspot.data?.imageUrl)}
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
                value={getCurrentLanguageValue(selectedHotspot.data?.videoUrl)}
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
                value={getCurrentLanguageValue(selectedHotspot.data?.gifUrl)}
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

// 组件属性面板
interface ComponentPropertyPanelProps {
  component: any;
  updateComponent: (id: string, updates: any) => void;
  deleteComponent: (id: string) => void;
}

const ComponentPropertyPanel: React.FC<ComponentPropertyPanelProps> = ({
  component,
  updateComponent,
  deleteComponent,
}) => {
  const handleDelete = () => {
    if (confirm('确定要删除这个组件吗？')) {
      deleteComponent(component.id);
    }
  };

  const handlePropsChange = (key: string, value: any) => {
    updateComponent(component.id, {
      props: {
        ...component.props,
        [key]: value,
      },
    });
  };

  const handleStyleChange = (key: string, value: any) => {
    updateComponent(component.id, {
      style: {
        ...component.style,
        [key]: value,
      },
    });
  };

  const handlePositionChange = (key: string, value: number) => {
    updateComponent(component.id, {
      position: {
        ...component.position,
        [key]: value,
      },
    });
  };

  const handleSizeChange = (key: string, value: number) => {
    updateComponent(component.id, {
      size: {
        ...component.size,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">组件属性</h3>
        <button
          onClick={handleDelete}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="删除组件"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* 基本信息 */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            组件ID
          </label>
          <input
            type="text"
            value={component.id}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            组件名称
          </label>
          <input
            type="text"
            value={component.name}
            onChange={(e) => updateComponent(component.id, { name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            组件类型
          </label>
          <input
            type="text"
            value={component.type}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 text-sm"
          />
        </div>
      </div>

      {/* 位置和大小 */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">位置和大小</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">X坐标</label>
            <input
              type="number"
              value={Math.round(component.position.x)}
              onChange={(e) => handlePositionChange('x', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Y坐标</label>
            <input
              type="number"
              value={Math.round(component.position.y)}
              onChange={(e) => handlePositionChange('y', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">宽度</label>
            <input
              type="number"
              value={Math.round(component.size.width)}
              onChange={(e) => handleSizeChange('width', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">高度</label>
            <input
              type="number"
              value={Math.round(component.size.height)}
              onChange={(e) => handleSizeChange('height', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>
      </div>

      {/* 按钮组件特定属性 */}
      {component.type === 'button' && (
        <>
          {/* 内容属性 */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">内容属性</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                按钮文字
              </label>
              <input
                type="text"
                value={component.props.text || ''}
                onChange={(e) => handlePropsChange('text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* 样式属性 */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">样式属性</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  背景颜色
                </label>
                <input
                  type="color"
                  value={component.style.backgroundColor || '#3B82F6'}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  文字颜色
                </label>
                <input
                  type="color"
                  value={component.style.color || '#FFFFFF'}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  字体大小
                </label>
                <input
                  type="number"
                  value={component.style.fontSize || 14}
                  onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value) || 14)}
                  min="8"
                  max="72"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  圆角大小
                </label>
                <input
                  type="number"
                  value={parseInt(component.style.borderRadius) || 6}
                  onChange={(e) => handleStyleChange('borderRadius', `${e.target.value}px`)}
                  min="0"
                  max="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* 图层信息 */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">图层信息</h4>
        <div>
          <label className="block text-xs text-gray-600 mb-1">层级</label>
          <input
            type="number"
            value={component.zIndex}
            disabled
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50"
          />
        </div>
      </div>
    </div>
  );
};