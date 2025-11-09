export interface MindMapNode {
  id: string;
  name: string;
  children: MindMapNode[];
  depth: number;
  // Layout properties
  x: number;
  y: number;
  width: number;
  height: number;
  // Interaction properties
  isCollapsed?: boolean;
}
