import type { MindMapNode } from '@/types';
import { NODE_WIDTH } from '@/lib/layout-utils';

interface MindMapLinkProps {
  source: MindMapNode;
  target: MindMapNode;
}

export default function MindMapLink({ source, target }: MindMapLinkProps) {
  const startX = source.x + NODE_WIDTH / 2;
  const startY = source.y;
  const endX = target.x - NODE_WIDTH / 2;
  const endY = target.y;

  const path = `M ${startX} ${startY} C ${startX + (endX - startX) / 2} ${startY}, ${startX + (endX - startX) / 2} ${endY}, ${endX} ${endY}`;

  return (
    <path
      d={path}
      className="fill-none stroke-muted-foreground/50 transition-all duration-300 ease-in-out"
      strokeWidth="2"
    />
  );
}
