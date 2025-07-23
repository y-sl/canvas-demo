export interface ComponentType {
  id: string;
  name: string;
  type: 'button' | 'image' | 'text' | 'input';
  icon: string;
  defaultProps: Record<string, any>;
}

export interface ComponentInstance {
  id: string;
  type: string;
  name: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  props: Record<string, any>;
  style: Record<string, any>;
  zIndex: number;
}

export interface ComponentLibraryItem {
  id: string;
  name: string;
  type: 'button' | 'image' | 'text' | 'input';
  icon: string;
  category: string;
  defaultProps: {
    text?: string;
    src?: string;
    placeholder?: string;
    [key: string]: any;
  };
  defaultStyle: {
    width: number;
    height: number;
    backgroundColor?: string;
    color?: string;
    fontSize?: number;
    padding?: string;
    borderRadius?: string;
    border?: string;
    [key: string]: any;
  };
}