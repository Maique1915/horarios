"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import type { MindMapNode } from '@/types';
import { calculateTreeLayout, flattenTree } from '@/lib/layout-utils';
import MindMapNodeComponent from './mind-map-node';
import MindMapLink from './mind-map-link';

interface MindMapVisualizationProps {
  mindMapData: MindMapNode;
  onToggleCollapse: (nodeId: string) => void;
  onAddSubtopics: (nodeId: string) => void;
}

export default function MindMapVisualization({ mindMapData, onToggleCollapse, onAddSubtopics }: MindMapVisualizationProps) {
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 800, height: 600 });
  const svgRef = useRef<SVGSVGElement>(null);
  
  const layout = useMemo(() => calculateTreeLayout(mindMapData), [mindMapData]);
  const { nodes, links } = useMemo(() => flattenTree(layout), [layout]);

  useEffect(() => {
    if (svgRef.current) {
        const { width, height } = svgRef.current.getBoundingClientRect();
        setViewBox({
            x: layout.x - width / 2,
            y: layout.y - height / 2,
            width,
            height
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mindMapData]); 
  
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.target === svgRef.current) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      e.currentTarget.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning) {
      const scaleX = viewBox.width / (svgRef.current?.clientWidth || viewBox.width);
      const scaleY = viewBox.height / (svgRef.current?.clientHeight || viewBox.height);
      const dx = (e.clientX - panStart.x) * scaleX;
      const dy = (e.clientY - panStart.y) * scaleY;
      
      setViewBox(v => ({ ...v, x: v.x - dx, y: v.y - dy }));
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning) {
        setIsPanning(false);
        e.currentTarget.style.cursor = 'grab';
    }
  };
  
  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
      e.preventDefault();
      if (!svgRef.current) return;

      const scaleFactor = 1.1;
      const { clientX, clientY } = e;
      
      const svgPoint = svgRef.current.createSVGPoint();
      svgPoint.x = clientX;
      svgPoint.y = clientY;
      
      const ctm = svgRef.current.getScreenCTM()?.inverse();
      if (!ctm) return;
      
      const { x: pointerX, y: pointerY } = svgPoint.matrixTransform(ctm);

      const newWidth = e.deltaY > 0 ? viewBox.width * scaleFactor : viewBox.width / scaleFactor;
      const newHeight = e.deltaY > 0 ? viewBox.height * scaleFactor : viewBox.height / scaleFactor;
      
      const newX = pointerX - (pointerX - viewBox.x) * (newWidth / viewBox.width);
      const newY = pointerY - (pointerY - viewBox.y) * (newHeight / viewBox.height);

      setViewBox({ x: newX, y: newY, width: newWidth, height: newHeight });
  }

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      className="cursor-grab"
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
        <g>
          {links.map((link) => (
            <MindMapLink key={`${link.source.id}-${link.target.id}`} source={link.source} target={link.target} />
          ))}
          {nodes.map(node => (
            <MindMapNodeComponent
              key={node.id}
              node={node}
              onToggleCollapse={onToggleCollapse}
              onAddSubtopics={onAddSubtopics}
            />
          ))}
        </g>
    </svg>
  );
}
