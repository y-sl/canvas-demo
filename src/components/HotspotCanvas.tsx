import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import { useHotspotStore } from '../stores/hotspotStore';
import { useMultiLanguageStore } from '../stores/multiLanguageStore';
import { useComponentStore } from '../stores/componentStore';
import { HotspotType } from '../types/hotspot';
import { ComponentInstance } from '../types/component';

interface HotspotCanvasProps {
  className?: string;
  isMultiLanguage?: boolean;
}

export const HotspotCanvas: React.FC<HotspotCanvasProps> = ({ className, isMultiLanguage = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingRect, setDrawingRect] = useState<fabric.Rect | null>(null);
  const isDrawingRef = useRef(false);
  const drawingRectRef = useRef<fabric.Rect | null>(null);
  
  // 同步状态到ref
  useEffect(() => {
    isDrawingRef.current = isDrawing;
  }, [isDrawing]);
  
  useEffect(() => {
    drawingRectRef.current = drawingRect;
  }, [drawingRect]);
  
  // 根据是否为多语言模式选择不同的store
  const hotspotStore = useHotspotStore();
  const multiLanguageStore = useMultiLanguageStore();
  const componentStore = useComponentStore();
  
  const {
    canvasScale,
    setCanvasScale,
  } = hotspotStore;
  
  // 组件相关状态
  const {
    components,
    selectedComponentId,
    addComponent,
    updateComponent,
    selectComponent,
    deleteComponent,
  } = componentStore;
  
  // 根据模式选择数据源
  const storeData = isMultiLanguage ? {
    selectedHotspotId: multiLanguageStore.selectedHotspotId,
    addHotspot: multiLanguageStore.addHotspot,
    updateHotspot: multiLanguageStore.updateHotspot,
    selectHotspot: multiLanguageStore.selectHotspot,
    deleteHotspot: multiLanguageStore.deleteHotspot,
    hotspots: multiLanguageStore.getAllMultiLanguageHotspots(),
    backgroundImageUrl: multiLanguageStore.currentProject?.backgroundImages[multiLanguageStore.languageState.currentLanguage]?.url,
    backgroundImageSize: multiLanguageStore.currentProject?.backgroundImages[multiLanguageStore.languageState.currentLanguage]?.size,
  } : {
    selectedHotspotId: hotspotStore.selectedHotspotId,
    addHotspot: hotspotStore.addHotspot,
    updateHotspot: hotspotStore.updateHotspot,
    selectHotspot: hotspotStore.selectHotspot,
    deleteHotspot: hotspotStore.deleteHotspot,
    hotspots: hotspotStore.hotspots,
    backgroundImageUrl: hotspotStore.backgroundImageUrl,
    backgroundImageSize: hotspotStore.backgroundImageSize,
  };
  
  const {
    selectedHotspotId,
    addHotspot,
    updateHotspot,
    selectHotspot,
    deleteHotspot,
    hotspots,
    backgroundImageUrl,
    backgroundImageSize,
  } = storeData;
  
  // 获取当前语言（仅在多语言模式下需要）
  const currentLanguage = isMultiLanguage ? multiLanguageStore.languageState.currentLanguage : 'zh-CN';

  // 获取当前项目数据
  const currentProject = isMultiLanguage ? multiLanguageStore.currentProject : null;
  
  console.log('=== HotspotCanvas Debug Start ===');
  console.log('Current Language:', currentLanguage);
  console.log('Current Project exists:', !!currentProject);
  console.log('Background Images object:', currentProject?.backgroundImages);
  console.log('Background Image URL:', backgroundImageUrl);
  console.log('Background Image Size:', backgroundImageSize);
  console.log('Hotspots array:', currentProject?.hotspots);
  console.log('Has Background Image URL:', !!backgroundImageUrl);
  console.log('Canvas ref current:', !!canvasRef.current);
  console.log('=== HotspotCanvas Debug End ===');
  
  // 调试：监听状态变化
  useEffect(() => {
    console.log('HotspotCanvas state changed:', {
      hasBackgroundImageUrl: !!backgroundImageUrl,
      backgroundImageUrl: backgroundImageUrl?.substring(0, 100) + '...',
      backgroundImageSize,
      hotspotsCount: hotspots.length,
      currentProject: !!currentProject,
      currentLanguage: currentLanguage,
      availableLanguages: currentProject?.languages || []
    });
  }, [backgroundImageUrl, backgroundImageSize, hotspots.length, currentProject, currentLanguage]);



  // 更新热区位置
  const updateHotspotPosition = useCallback((hotspotId: string, obj: fabric.Object) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const left = ((obj.left || 0) / canvas.width!) * 100;
    const top = ((obj.top || 0) / canvas.height!) * 100;
    const width = ((obj.width! * (obj.scaleX || 1)) / canvas.width!) * 100;
    const height = ((obj.height! * (obj.scaleY || 1)) / canvas.height!) * 100;

    updateHotspot(hotspotId, {
      rect: {
        left: `${left.toFixed(2)}%`,
        top: `${top.toFixed(2)}%`,
        width: `${width.toFixed(2)}%`,
        height: `${height.toFixed(2)}%`,
      },
    });
  }, [updateHotspot]);
  
  // 更新组件位置和大小
  const updateComponentPosition = useCallback((componentId: string, obj: fabric.Object) => {
    if (!fabricCanvasRef.current) return;

    const left = obj.left || 0;
    const top = obj.top || 0;
    const width = (obj.width! * (obj.scaleX || 1));
    const height = (obj.height! * (obj.scaleY || 1));

    updateComponent(componentId, {
      position: { x: left, y: top },
      size: { width, height },
    });
  }, [updateComponent]);

  // 鼠标按下事件
  const handleMouseDown = useCallback((e: fabric.TEvent) => {
    console.log('Mouse down event triggered:', e);
    
    if (!fabricCanvasRef.current || !e.e) {
      console.log('Early return: canvas or event missing');
      return;
    }
    
    // 获取画布元素的边界矩形
    let canvasElement;
    try {
      canvasElement = fabricCanvasRef.current.getElement();
    } catch (error) {
      console.log('Error getting canvas element:', error);
      return;
    }
    
    if (!canvasElement) {
      console.log('Canvas element not available, skipping mouse down');
      return;
    }
    const rect = canvasElement.getBoundingClientRect();
    
    console.log('Canvas rect:', rect);
    
    // 计算相对于画布的坐标，考虑滚动偏移
    const clientX = (e.e as MouseEvent).clientX;
    const clientY = (e.e as MouseEvent).clientY;
    const pointer = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
    
    console.log('Client coordinates:', { clientX, clientY });
    console.log('Calculated pointer:', pointer);
    
    // 检查点击的对象，排除背景图片
    const target = fabricCanvasRef.current.findTarget(e.e, false);
    console.log('Target found:', target?.name || 'none');
    
    // 如果点击的是组件，选中组件而不是热区
    if (target && target.name && target.name.startsWith('component-')) {
      const componentId = (target as any).componentId;
      if (componentId) {
        selectComponent(componentId);
        console.log('Selected component:', componentId);
      }
      return;
    }
    
    // 如果点击的是热区，按原有逻辑处理
    if (target && target.name && target.name.startsWith('hotspot-')) {
      console.log('Clicked on hotspot, not drawing');
      return;
    }
    
    // 如果点击的是背景图片，不绘制热区
    if (target && target.name === 'background') {
      console.log('Clicked on background, not drawing');
      return;
    }
    
    // 清除组件选择
    selectComponent(null);
    
    setIsDrawing(true);
    console.log('Starting to draw hotspot at:', pointer);
    
    // 创建临时绘制矩形
    const drawRect = new fabric.Rect({
      left: pointer.x,
      top: pointer.y,
      width: 0,
      height: 0,
      fill: 'rgba(255, 0, 0, 0.3)',
      stroke: 'rgba(255, 0, 0, 1)',
      strokeWidth: 2,
      selectable: false,
      evented: false,
      name: 'temp-hotspot',
    });
    
    fabricCanvasRef.current.add(drawRect);
    setDrawingRect(drawRect);
    console.log('Drawing rect created and added');
  }, [selectComponent]);
  
  // 鼠标移动事件
  const handleMouseMove = useCallback((e: fabric.TEvent) => {
    const currentIsDrawing = isDrawingRef.current;
    const currentDrawingRect = drawingRectRef.current;
    
    console.log('Mouse move event triggered', { isDrawing: currentIsDrawing, hasDrawingRect: !!currentDrawingRect });
    
    if (!currentIsDrawing || !currentDrawingRect || !e.e || !fabricCanvasRef.current) {
      console.log('Mouse move early return:', { isDrawing: currentIsDrawing, hasDrawingRect: !!currentDrawingRect, hasEvent: !!e.e, hasCanvas: !!fabricCanvasRef.current });
      return;
    }

    // 获取画布元素的边界矩形
    let canvasElement;
    try {
      canvasElement = fabricCanvasRef.current.getElement();
    } catch (error) {
      console.log('Error getting canvas element:', error);
      return;
    }
    
    if (!canvasElement) {
      console.log('Canvas element not available, skipping mouse move');
      return;
    }
    const rect = canvasElement.getBoundingClientRect();
    
    // 计算相对于画布的坐标，考虑滚动偏移
    const clientX = (e.e as MouseEvent).clientX;
    const clientY = (e.e as MouseEvent).clientY;
    const pointer = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
    
    console.log('Mouse move coordinates:', { clientX, clientY, pointer });
    
    const startX = currentDrawingRect.left || 0;
    const startY = currentDrawingRect.top || 0;
    
    const width = Math.abs(pointer.x - startX);
    const height = Math.abs(pointer.y - startY);
    const left = Math.min(pointer.x, startX);
    const top = Math.min(pointer.y, startY);
    
    console.log('Updating rect:', { left, top, width, height });
    
    currentDrawingRect.set({ left, top, width, height });
    fabricCanvasRef.current.renderAll();
  }, []);
  
  // 鼠标抬起事件
  const handleMouseUp = useCallback(() => {
    const currentIsDrawing = isDrawingRef.current;
    const currentDrawingRect = drawingRectRef.current;
    
    console.log('Mouse up event triggered');
    
    if (!currentIsDrawing || !currentDrawingRect || !fabricCanvasRef.current) {
      console.log('Mouse up early return:', { isDrawing: currentIsDrawing, hasDrawingRect: !!currentDrawingRect });
      return;
    }
    
    setIsDrawing(false);
    console.log('Drawing finished, rect size:', { width: currentDrawingRect.width, height: currentDrawingRect.height });
    
    // 如果矩形太小，删除它
    if ((currentDrawingRect.width || 0) < 10 || (currentDrawingRect.height || 0) < 10) {
      console.log('Rect too small, removing');
      fabricCanvasRef.current.remove(currentDrawingRect);
      setDrawingRect(null);
      return;
    }
    
    // 创建新热区
    const canvas = fabricCanvasRef.current;
    const left = ((currentDrawingRect.left || 0) / canvas.width!) * 100;
    const top = ((currentDrawingRect.top || 0) / canvas.height!) * 100;
    const width = ((currentDrawingRect.width || 0) / canvas.width!) * 100;
    const height = ((currentDrawingRect.height || 0) / canvas.height!) * 100;
    
    console.log('Creating hotspot with percentages:', { left, top, width, height });
    
    const hotspotId = addHotspot({
      type: 'HOTSPOT',
      rect: {
        left: `${left.toFixed(2)}%`,
        top: `${top.toFixed(2)}%`,
        width: `${width.toFixed(2)}%`,
        height: `${height.toFixed(2)}%`,
      },
      name: {
        [currentLanguage]: '新热区'
      },
      action: {
        type: 'NONE',
        data: {}
      },
      data: {}
    });
    
    console.log('Hotspot created with ID:', hotspotId);
    
    // 移除临时矩形
    canvas.remove(currentDrawingRect);
    setDrawingRect(null);
  }, [addHotspot]);











  // 初始化画布
  useEffect(() => {
    console.log('=== Canvas Initialization Debug Start ===');
    console.log('Canvas ref exists:', !!canvasRef.current);
    console.log('Container ref exists:', !!containerRef.current);
    
    if (!canvasRef.current || !containerRef.current) {
      console.log('Canvas initialization early return - missing refs');
      return;
    }
    
    console.log('Creating fabric canvas...');
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 750,
      height: 600,
      selection: true,
      preserveObjectStacking: true,
      backgroundColor: '#f8f9fa',
    });
    
    fabricCanvasRef.current = canvas;
    console.log('Fabric canvas created and stored in ref');
    console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
    
    // 监听对象选择事件
    canvas.on('selection:created', (e) => {
      const activeObject = e.selected?.[0];
      if (activeObject && 'hotspotId' in activeObject) {
        selectHotspot((activeObject as { hotspotId: string }).hotspotId);
      }
    });
    
    canvas.on('selection:updated', (e) => {
      const activeObject = e.selected?.[0];
      if (activeObject && 'hotspotId' in activeObject) {
        selectHotspot((activeObject as { hotspotId: string }).hotspotId);
      }
    });
    
    canvas.on('selection:cleared', () => {
      selectHotspot(null);
    });
    
    // 监听对象修改事件
    canvas.on('object:modified', (e) => {
      const obj = e.target;
      if (obj && 'hotspotId' in obj) {
        updateHotspotPosition((obj as { hotspotId: string }).hotspotId, obj);
      } else if (obj && 'componentId' in obj) {
        updateComponentPosition((obj as { componentId: string }).componentId, obj);
      }
    });
    
    // 监听鼠标事件用于绘制热区
    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);
    
    // 添加全局鼠标事件监听，确保在画布外也能响应
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDrawingRef.current) {
        handleMouseMove({ e } as fabric.TEvent);
      }
    };
    
    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (isDrawingRef.current) {
        handleMouseUp();
      }
    };
    
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    
    // 初始化画布尺寸
    resizeCanvas();

    return () => {
      console.log('Disposing fabric canvas and removing event listeners');
      canvas.dispose();
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [selectHotspot, updateHotspotPosition, updateComponentPosition]);
  
  // 处理画布尺寸调整
  const resizeCanvas = useCallback(() => {
    if (!fabricCanvasRef.current || !containerRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    
    if (!backgroundImageSize) {
      // 默认尺寸，固定750px宽度
      const defaultWidth = 750;
      const defaultHeight = 600;
      
      try {
        // 检查canvas的内部属性是否已经初始化
        if (!canvas.lowerCanvasEl || !canvas.upperCanvasEl) {
          console.error('Canvas DOM elements not ready in resizeCanvas');
          return;
        }
        
        // 使用更安全的方式设置尺寸
        canvas.setWidth(defaultWidth);
        canvas.setHeight(defaultHeight);
        setCanvasScale(1);
        canvas.renderAll();
      } catch (error) {
        console.error('Error in resizeCanvas:', error);
      }
    }
  }, [backgroundImageSize, setCanvasScale]);
  
  // 监听窗口尺寸变化
  useEffect(() => {
    const handleResize = () => {
      setTimeout(resizeCanvas, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [backgroundImageSize, resizeCanvas]);
  

  
  // 监听背景图片变化
  useEffect(() => {
    console.log('=== Background Image useEffect Debug Start ===');
    console.log('Fabric canvas exists:', !!fabricCanvasRef.current);
    console.log('Background image URL:', backgroundImageUrl);
    
    if (!fabricCanvasRef.current) {
      console.log('Background image useEffect early return - no fabric canvas');
      return;
    }
    
    const canvas = fabricCanvasRef.current;
    
    if (backgroundImageUrl) {
      console.log('Loading background image...');
      // 创建图片元素
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        console.log('Background image loaded successfully');
        console.log('Image dimensions:', img.width, 'x', img.height);
        
        // 使用重试机制等待canvas完全初始化
        const setupBackgroundImage = (retryCount = 0) => {
          const maxRetries = 10;
          
          // 确保canvas完全初始化
          if (!canvas) {
            console.error('Canvas object is undefined, skipping background image setup');
            return;
          }
          
          try {
            // 检查canvas的基本方法是否存在
            if (typeof canvas.setWidth !== 'function' || typeof canvas.add !== 'function') {
              if (retryCount < maxRetries) {
                console.log(`Canvas methods not ready, retrying... (${retryCount + 1}/${maxRetries})`);
                setTimeout(() => setupBackgroundImage(retryCount + 1), 50);
                return;
              } else {
                console.error('Canvas methods not available after retries, skipping background image setup');
                return;
              }
            }
            
            // 检查canvas的内部属性是否已经初始化
            if (!canvas.lowerCanvasEl || !canvas.upperCanvasEl) {
              if (retryCount < maxRetries) {
                console.log(`Canvas DOM elements not ready, retrying... (${retryCount + 1}/${maxRetries})`);
                setTimeout(() => setupBackgroundImage(retryCount + 1), 50);
                return;
              } else {
                console.log('Canvas DOM elements not ready after retries, proceeding anyway');
              }
            }
          } catch (error) {
            if (retryCount < maxRetries) {
              console.log(`Error checking canvas initialization, retrying... (${retryCount + 1}/${maxRetries}):`, error);
              setTimeout(() => setupBackgroundImage(retryCount + 1), 50);
              return;
            } else {
              console.error('Error checking canvas initialization after retries:', error);
              return;
            }
          }
          
          // 先设置画布尺寸
          const aspectRatio = img.height / img.width;
          // 固定画布宽度为750px
          const canvasWidth = 750;
          const canvasHeight = canvasWidth * aspectRatio;
          
          // 保持原始比例，不限制高度，让容器滚动
          const finalWidth = canvasWidth; // 始终保持750px宽度
          const finalHeight = canvasHeight; // 保持原始比例的高度
          
          console.log('Setting canvas dimensions:', finalWidth, 'x', finalHeight);
          
          try {
            // 使用更安全的方式设置尺寸
            canvas.setWidth(finalWidth);
            canvas.setHeight(finalHeight);
          } catch (error) {
            console.error('Error setting canvas dimensions:', error);
            return;
          }
        
           // 移除之前的背景图片
           const existingBg = canvas.getObjects().find(obj => obj.name === 'background');
           if (existingBg) {
             console.log('Removing existing background image');
             canvas.remove(existingBg);
           }
           
           // 创建 Fabric 图片对象
           const fabricImg = new fabric.Image(img, {
             name: 'background',
             selectable: false,
             evented: false,
             left: 0,
             top: 0,
             scaleX: finalWidth / img.width,
             scaleY: finalHeight / img.height,
           });
           
           console.log('Adding fabric image to canvas');
           canvas.add(fabricImg);
           canvas.sendObjectToBack(fabricImg);
           canvas.renderAll();
           console.log('Background image rendered to canvas');
           
           // 更新缩放比例
           setCanvasScale(finalWidth / img.width);
           console.log('Canvas scale updated:', finalWidth / img.width);
           
           // 强制重新渲染
           setTimeout(() => {
             canvas.renderAll();
             console.log('Canvas force re-rendered');
           }, 100);
         };
         
         // 开始设置背景图片
         setupBackgroundImage();
      };
      
      img.onerror = (error) => {
        console.error('Failed to load background image:', error);
      };
      
      img.src = backgroundImageUrl;
      console.log('Image src set, loading...');
    } else {
      console.log('No background image URL, clearing existing background');
      // 清空背景图片
      const existingBg = canvas.getObjects().find(obj => obj.name === 'background');
      if (existingBg) {
        console.log('Removing existing background image');
        canvas.remove(existingBg);
        canvas.renderAll();
      }
    }
    console.log('=== Background Image useEffect Debug End ===');
  }, [backgroundImageUrl, setCanvasScale]);
  
  // 同步热区到画布
  const syncHotspotsToCanvas = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    
    // 保存当前选中的对象ID
    const activeObject = canvas.getActiveObject();
    const selectedHotspotId = activeObject && 'hotspotId' in activeObject ? 
      (activeObject as { hotspotId: string }).hotspotId : null;
    
    // 清除现有的热区对象（保留背景图片和组件）
    const objects = canvas.getObjects();
    objects.forEach(obj => {
      if (obj.name && obj.name.startsWith('hotspot-')) {
        canvas.remove(obj);
      }
    });
    
    // 添加新的热区
    let objectToSelect: fabric.Object | null = null;
    hotspots.forEach(hotspot => {
      const rect = createHotspotRect(hotspot);
      if (rect) {
        canvas.add(rect);
        // 如果这个热区之前被选中，记录它以便重新选中
        if (selectedHotspotId === hotspot.id) {
          objectToSelect = rect;
        }
      }
    });
    
    canvas.renderAll();
    
    // 恢复选中状态
    if (objectToSelect) {
      canvas.setActiveObject(objectToSelect);
      canvas.renderAll();
    }
  }, [hotspots, canvasScale]);
  
  // 同步组件到画布
  const syncComponentsToCanvas = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    
    // 保存当前选中的组件ID
    const activeObject = canvas.getActiveObject();
    const selectedCompId = activeObject && 'componentId' in activeObject ? 
      (activeObject as { componentId: string }).componentId : null;
    
    // 清除现有的组件对象（保留背景图片和热区）
    const objects = canvas.getObjects();
    objects.forEach(obj => {
      if (obj.name && obj.name.startsWith('component-')) {
        canvas.remove(obj);
      }
    });
    
    // 添加新的组件
    let objectToSelect: fabric.Object | null = null;
    components.forEach(component => {
      const fabricObj = createComponentObject(component);
      if (fabricObj) {
        canvas.add(fabricObj);
        // 如果这个组件之前被选中，记录它以便重新选中
        if (selectedCompId === component.id) {
          objectToSelect = fabricObj;
        }
      }
    });
    
    canvas.renderAll();
    
    // 恢复选中状态
    if (objectToSelect) {
      canvas.setActiveObject(objectToSelect);
      canvas.renderAll();
    }
  }, [components]);

  useEffect(() => {
    syncHotspotsToCanvas();
  }, [syncHotspotsToCanvas]);
  
  useEffect(() => {
    syncComponentsToCanvas();
  }, [syncComponentsToCanvas]);

  // 监听选中热区ID变化，同步画布选中状态
  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    
    if (selectedHotspotId) {
      // 查找对应的画布对象
      const targetObject = canvas.getObjects().find(obj => 
        'hotspotId' in obj && (obj as { hotspotId: string }).hotspotId === selectedHotspotId
      );
      
      if (targetObject) {
        canvas.setActiveObject(targetObject);
        canvas.renderAll();
      }
    } else {
      // 清除选中状态
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  }, [selectedHotspotId]);
  
  // 监听选中组件ID变化，同步画布选中状态
  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    
    if (selectedComponentId) {
      // 查找对应的画布对象
      const targetObject = canvas.getObjects().find(obj => 
        'componentId' in obj && (obj as { componentId: string }).componentId === selectedComponentId
      );
      
      if (targetObject) {
        canvas.setActiveObject(targetObject);
        canvas.renderAll();
      }
    } else {
      // 清除选中状态
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  }, [selectedComponentId]);

  // 键盘事件监听
  useEffect(() => {
    let copiedHotspot: any = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 检查是否在输入框中，如果是则不处理快捷键
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return;
      }

      // Del键删除选中的热区或组件
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (selectedHotspotId) {
          deleteHotspot(selectedHotspotId);
        } else if (selectedComponentId) {
          deleteComponent(selectedComponentId);
        }
        return;
      }

      // Ctrl+C 复制选中的热区
      if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        const selectedHotspot = hotspots.find(h => h.id === selectedHotspotId);
        if (selectedHotspot) {
          copiedHotspot = { ...selectedHotspot };
          console.log('热区已复制到剪贴板');
        }
        return;
      }

      // Ctrl+V 粘贴热区
      if (e.ctrlKey && e.key === 'v') {
        e.preventDefault();
        if (copiedHotspot) {
          // 创建新的热区，稍微偏移位置
          const currentLang = currentLanguage;
          const originalName = copiedHotspot.name?.[currentLang] || '热区';
          
          const newHotspot = {
            ...copiedHotspot,
            name: {
              ...copiedHotspot.name,
              [currentLang]: `${originalName} 副本`
            },
            rect: {
              left: `${Math.min(98, parseFloat(copiedHotspot.rect.left) + 2)}%`,
              top: `${Math.min(98, parseFloat(copiedHotspot.rect.top) + 2)}%`,
              width: copiedHotspot.rect.width,
              height: copiedHotspot.rect.height,
            },
          };
          
          // 移除id字段，让addHotspot自动生成新的id
          delete newHotspot.id;
          delete newHotspot.zIndex;
          
          addHotspot(newHotspot);
          console.log('热区已粘贴');
        }
        return;
      }
    };

    // 添加键盘事件监听
    document.addEventListener('keydown', handleKeyDown);

    return () => {
       document.removeEventListener('keydown', handleKeyDown);
     };
   }, [selectedHotspotId, selectedComponentId, deleteHotspot, deleteComponent, hotspots, addHotspot, currentLanguage]);
  
  // 创建热区矩形对象
  const createHotspotRect = (hotspot: any) => {
    // 多语言热区默认为红色热区样式
    const defaultColor = 'rgba(255, 0, 0, 0.3)';
    
    // 将百分比坐标转换为像素坐标
    const canvas = fabricCanvasRef.current;
    if (!canvas) return null;
    
    const left = (parseFloat(hotspot.rect.left) / 100) * canvas.width!;
    const top = (parseFloat(hotspot.rect.top) / 100) * canvas.height!;
    const width = (parseFloat(hotspot.rect.width) / 100) * canvas.width!;
    const height = (parseFloat(hotspot.rect.height) / 100) * canvas.height!;
    
    const rect = new fabric.Rect({
      left,
      top,
      width,
      height,
      fill: defaultColor,
      stroke: defaultColor.replace('0.3', '1'),
      strokeWidth: 2,
      selectable: true,
      evented: true,
      name: `hotspot-${hotspot.id}`,
      hotspotId: hotspot.id,
    });
    
    return rect;
  };
  
  // 创建组件对象
  const createComponentObject = useCallback((component: ComponentInstance) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return null;
    
    switch (component.type) {
      case 'button': {
        const button = new fabric.Rect({
          left: 0,
          top: 0,
          width: component.size.width,
          height: component.size.height,
          fill: component.style.backgroundColor || '#3B82F6',
          stroke: component.style.border || 'none',
          strokeWidth: 1,
          rx: parseInt(component.style.borderRadius) || 6,
          ry: parseInt(component.style.borderRadius) || 6,
          selectable: true,
          evented: true,
          name: `component-${component.id}`,
          componentId: component.id,
        });
        
        // 添加按钮文字
        const text = new fabric.Text(component.props.text || '按钮', {
          left: component.size.width / 2,
          top: component.size.height / 2,
          fontSize: component.style.fontSize || 14,
          fill: component.style.color || '#FFFFFF',
          textAlign: 'center',
          originX: 'center',
          originY: 'center',
          selectable: false,
          evented: false,
          name: `component-text-${component.id}`,
        });
        
        // 创建组合对象
        const group = new fabric.Group([button, text], {
          left: component.position.x,
          top: component.position.y,
          selectable: true,
          evented: true,
          name: `component-${component.id}`,
          componentId: component.id,
        });
        
        return group;
      }
      
      default:
        return null;
    }
  }, []);
  

  

  
  return (
    <div ref={containerRef} className={`${className}`} style={{ width: '750px' }}>
      <canvas ref={canvasRef} className="border border-gray-300 rounded-lg" style={{ display: 'block' }} />
      {/* Debug info */}
      <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
        <div>Canvas: {canvasRef.current ? '✓' : '✗'}</div>
        <div>Fabric Canvas: {fabricCanvasRef.current ? '✓' : '✗'}</div>
        <div>Background URL: {backgroundImageUrl ? '✓' : '✗'}</div>
        <div>Hotspots: {hotspots.length}</div>
      </div>
    </div>
  );
};