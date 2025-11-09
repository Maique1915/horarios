import type { MindMapNode } from '@/types';
import { NODE_HEIGHT, NODE_WIDTH } from '@/lib/layout-utils';
import { Button } from './ui/button';
import { Plus, Minus, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/tooltip';

interface MindMapNodeProps {
  node: MindMapNode;
  onToggleCollapse: (nodeId: string) => void;
  onAddSubtopics: (nodeId: string) => void;
}

const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
];

export default function MindMapNodeComponent({ node, onToggleCollapse, onAddSubtopics }: MindMapNodeProps) {
  const hasChildren = node.children && node.children.length > 0;
  const color = node.depth > 0 ? colors[(node.depth-1) % colors.length] : 'hsl(var(--primary))';

  return (
    <g transform={`translate(${node.x}, ${node.y})`} className="transition-all duration-300 ease-in-out">
        <foreignObject x={-NODE_WIDTH / 2} y={-NODE_HEIGHT / 2} width={NODE_WIDTH} height={NODE_HEIGHT} className="group">
            <TooltipProvider delayDuration={300}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div 
                            className={cn(
                                "w-full h-full p-3 rounded-lg shadow-lg flex items-center justify-center text-center font-medium transition-all duration-200",
                                node.depth === 0 ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground"
                            )}
                            style={{ border: `2px solid ${color}` }}
                        >
                            <p className="line-clamp-2">{node.name}</p>
                        </div>
                    </TooltipTrigger>
                    {node.name.length > 30 && <TooltipContent><p>{node.name}</p></TooltipContent>}
                </Tooltip>
            </TooltipProvider>

            <div 
                className="absolute -bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                onClick={(e) => { e.stopPropagation(); onAddSubtopics(node.id); }}
            >
                <TooltipProvider delayDuration={300}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-background border-accent shadow-md">
                                <Wand2 size={16} className="text-accent" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Suggest subtopics</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </foreignObject>

        {hasChildren && (
            <g 
                transform={`translate(${NODE_WIDTH / 2 + 6}, 0)`} 
                onClick={(e) => { e.stopPropagation(); onToggleCollapse(node.id); }} 
                className="cursor-pointer"
            >
                <circle r="12" fill={color} />
                {node.isCollapsed 
                    ? <Plus size={16} x="-8" y="-8" className="text-primary-foreground" /> 
                    : <Minus size={16} x="-8" y="-8" className="text-primary-foreground" />}
            </g>
        )}
    </g>
  );
}
