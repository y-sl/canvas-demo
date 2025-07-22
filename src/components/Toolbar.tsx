import React, { useRef } from 'react';
import { useHotspotStore } from '../stores/hotspotStore';
import { useMultiLanguageStore } from '../stores/multiLanguageStore';
import {
  Upload,
  Eye,
  Download,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
} from 'lucide-react';
import { toast } from 'sonner';

interface ToolbarProps {
  className?: string;
  isMultiLanguage?: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({ className, isMultiLanguage = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    getSelectedHotspot,
    setBackgroundImage,
    clearBackgroundImage,
    clearAllHotspots,
    exportConfig,
    moveHotspotToTop,
    moveHotspotToBottom,
    moveHotspotUp,
    moveHotspotDown,
  } = useHotspotStore();
  
  // 多语言编辑器的存储
  const multiLanguageState = isMultiLanguage ? useMultiLanguageStore() : null;
  
  const selectedHotspot = getSelectedHotspot();
  
  // 处理文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('File upload started:', { file: file?.name, type: file?.type, size: file?.size });
    
    if (!file) {
      console.log('No file selected');
      return;
    }
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      console.log('Invalid file type:', file.type);
      toast.error('请选择图片文件');
      return;
    }
    
    console.log('Starting to read file...');
    // 读取文件
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      console.log('File read successfully, data URL length:', imageUrl?.length);
      
      // 创建图片对象获取尺寸
      const img = new Image();
      img.onload = () => {
        console.log('Image loaded, dimensions:', { width: img.width, height: img.height });
        
        if (isMultiLanguage && multiLanguageState) {
          // 多语言模式：使用当前语言设置背景图片
          console.log('Setting background image in multi-language mode for language:', multiLanguageState.languageState.currentLanguage);
          multiLanguageState.setBackgroundImage(multiLanguageState.languageState.currentLanguage, imageUrl, {
            width: img.width,
            height: img.height,
          });
        } else {
          // 单语言模式：使用hotspotStore
          console.log('Setting background image in single-language mode');
          setBackgroundImage(imageUrl, {
            width: img.width,
            height: img.height,
          });
        }
        
        console.log('Background image set in store');
        toast.success('背景图片上传成功');
      };
      img.onerror = (error) => {
        console.error('Failed to load image:', error);
        toast.error('图片加载失败');
      };
      img.src = imageUrl;
    };
    reader.onerror = (error) => {
      console.error('Failed to read file:', error);
      toast.error('文件读取失败');
    };
    reader.readAsDataURL(file);
    
    // 清空input值，允许重复选择同一文件
    event.target.value = '';
  };
  
  // 生成预览
  const handlePreview = () => {
    const config = exportConfig();
    
    if (!config.backgroundImageUrl) {
      toast.error('请先上传背景图片');
      return;
    }
    
    // 创建预览页面HTML
    const previewHtml = generatePreviewHtml(config);
    
    // 在新标签页打开预览
    const blob = new Blob([previewHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    
    // 清理URL对象
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    
    toast.success('预览页面已打开');
  };
  
  // 导出配置
  const handleExport = () => {
    const config = exportConfig();
    
    if (config.modules.length === 0) {
      toast.error('没有热区可导出');
      return;
    }
    
    // 下载JSON文件
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hotspot-config-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('配置文件已导出');
  };
  
  // 清空画布
  const handleClear = () => {
    clearAllHotspots();
    clearBackgroundImage();
    toast.success('画布已清空');
  };
  
  // 生成预览页面HTML
  const generatePreviewHtml = (config: ReturnType<typeof exportConfig>) => {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>热区预览</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f5f5f5;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    
    .preview-container {
      position: relative;
      max-width: 100%;
      max-height: 100vh;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    .background-image {
      display: block;
      max-width: 100%;
      max-height: 100vh;
      width: auto;
      height: auto;
    }
    
    .hotspot {
      position: absolute;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .hotspot:hover {
      background-color: rgba(59, 130, 246, 0.2);
      border: 2px solid #3b82f6;
    }
    
    .replaceable {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    
    .replaceable img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .replaceable video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .toast {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #333;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      z-index: 1000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    }
    
    .toast.show {
      transform: translateX(0);
    }
  </style>
</head>
<body>
  <div class="preview-container">
    <img src="${config.backgroundImageUrl}" alt="Background" class="background-image" id="backgroundImage">
    ${config.modules.map((module, index: number) => {
      const { rect, type, action, data } = module;
      
      if (type === 'HOTSPOT') {
        return `
          <div 
            class="hotspot" 
            style="
              left: ${rect.left};
              top: ${rect.top};
              width: ${rect.width};
              height: ${rect.height};
              z-index: ${index + 1};
            "
            onclick="handleHotspotClick('${action?.type}', ${JSON.stringify(action?.data || {}).replace(/"/g, '&quot;')})"
          ></div>
        `;
      } else if (type === 'REPLACEABLE') {
        let content = '';
        if (data?.imageUrl) {
          content = `<img src="${data.imageUrl}" alt="Replaced Image">`;
        } else if (data?.textContent) {
          content = `
            <div style="
              font-size: ${data.fontSize || 14}px;
              color: ${data.color || '#000000'};
              font-weight: ${data.fontWeight || 'normal'};
              text-align: ${data.textAlign || 'left'};
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: ${data.textAlign === 'center' ? 'center' : data.textAlign === 'right' ? 'flex-end' : 'flex-start'};
              padding: 8px;
              word-break: break-word;
            ">
              ${data.textContent}
            </div>
          `;
        }
        
        return `
          <div 
            class="replaceable" 
            style="
              left: ${rect.left};
              top: ${rect.top};
              width: ${rect.width};
              height: ${rect.height};
              z-index: ${index + 1};
            "
          >
            ${content}
          </div>
        `;
      } else if (type === 'VIDEO' && data?.videoUrl) {
        return `
          <div 
            class="replaceable" 
            style="
              left: ${rect.left};
              top: ${rect.top};
              width: ${rect.width};
              height: ${rect.height};
              z-index: ${index + 1};
            "
          >
            <video controls autoplay muted>
              <source src="${data.videoUrl}" type="video/mp4">
              您的浏览器不支持视频播放。
            </video>
          </div>
        `;
      } else if (type === 'GIF' && data?.gifUrl) {
        return `
          <div 
            class="replaceable" 
            style="
              left: ${rect.left};
              top: ${rect.top};
              width: ${rect.width};
              height: ${rect.height};
              z-index: ${index + 1};
            "
          >
            <img src="${data.gifUrl}" alt="GIF Animation">
          </div>
        `;
      }
      
      return '';
    }).join('')}
  </div>
  
  <div id="toast" class="toast"></div>
  
  <script>
    function handleHotspotClick(actionType, actionData) {
      switch (actionType) {
        case 'JUMP_URL':
          if (actionData.url) {
            window.open(actionData.url, '_blank');
          } else {
            showToast('未配置跳转链接');
          }
          break;
        case 'OPEN_VIP_PAGE':
          showToast('打开VIP页面功能');
          break;
        case 'SHOW_TOAST':
          showToast(actionData.text || '默认提示信息');
          break;
        default:
          showToast('未知操作类型');
      }
    }
    
    function showToast(message) {
      const toast = document.getElementById('toast');
      toast.textContent = message;
      toast.classList.add('show');
      
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    }
    
    // 响应式调整
    function adjustLayout() {
      const container = document.querySelector('.preview-container');
      const img = document.getElementById('backgroundImage');
      
      if (img && container) {
        // 确保图片加载完成后调整布局
        img.onload = () => {
          const rect = img.getBoundingClientRect();
          container.style.width = rect.width + 'px';
          container.style.height = rect.height + 'px';
        };
      }
    }
    
    window.addEventListener('load', adjustLayout);
    window.addEventListener('resize', adjustLayout);
  </script>
</body>
</html>
    `;
  };
  
  return (
    <div className={`bg-white border-b border-gray-200 px-4 py-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* 上传背景图 */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload size={16} />
            <span>上传UI稿</span>
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          {/* 预览 */}
          <button
            onClick={handlePreview}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Eye size={16} />
            <span>预览</span>
          </button>
          
          {/* 导出 */}
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Download size={16} />
            <span>导出JSON</span>
          </button>
          
          {/* 清空 */}
          <button
            onClick={handleClear}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 size={16} />
            <span>清空画布</span>
          </button>
        </div>
        
        {/* 图层控制 */}
        {selectedHotspot && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">图层控制:</span>
            
            <button
              onClick={() => moveHotspotToTop(selectedHotspot.id)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="置顶"
            >
              <ChevronsUp size={16} />
            </button>
            
            <button
              onClick={() => moveHotspotUp(selectedHotspot.id)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="上移一层"
            >
              <ChevronUp size={16} />
            </button>
            
            <button
              onClick={() => moveHotspotDown(selectedHotspot.id)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="下移一层"
            >
              <ChevronDown size={16} />
            </button>
            
            <button
              onClick={() => moveHotspotToBottom(selectedHotspot.id)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="置底"
            >
              <ChevronsDown size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};