import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import { useComponentStore } from '../stores/componentStore';
import { ComponentInstance } from '../types/component';

interface ComponentCanvasProps {
  className?: string;
}

export const ComponentCanvas: React.FC<ComponentCanvasProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    components,
    selectedComponentId,
    backgroundImageUrl,
    backgroundImageSize,
    canvasScale,
    selectComponent,
    updateComponent,
    deleteComponent,
    setCanvasScale
  } = useComponentStore();
  
  // 初始化画布
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true
    });
    
    fabricCanvasRef.current = canvas;
    
    // 监听对象选择事件
    canvas.on('selection:created', (e) => {
      const activeObject = e.selected?.[0];
      if (activeObject && 'componentId' in activeObject) {
        selectComponent((activeObject as any).componentId);
      }
    });
    
    canvas.on('selection:updated', (e) => {
      const activeObject = e.selected?.[0];
      if (activeObject && 'componentId' in activeObject) {
        selectComponent((activeObject as any).componentId);
      }
    });
    
    canvas.on('selection:cleared', () => {
      selectComponent(null);
    });
    
    // 监听对象修改事件
    canvas.on('object:modified', (e) => {
      const obj = e.target;
      if (obj && 'componentId' in obj) {
        const componentId = (obj as any).componentId;
        const component = components.find(c => c.id === componentId);
        if (component) {
          updateComponent(componentId, {
            ...component,
            position: {
              x: obj.left || 0,
              y: obj.top || 0
            },
            size: {
              width: (obj.width || 0) * (obj.scaleX || 1),
              height: (obj.height || 0) * (obj.scaleY || 1)
            }
          });
        }
      }
    });

    return () => {
      canvas.dispose();
    };
  }, [selectComponent, updateComponent, components]);

  return (
    <div ref={containerRef} className={className}>
      <canvas ref={canvasRef} />
    </div>
  );
};