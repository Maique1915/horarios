import React, { useState, useMemo, useEffect, useRef } from 'react';
import MapaMentalNode from './MapaMentalNode';
import MapaMentalLink from './MapaMentalLink';

const MapaMentalVisualizacao = ({ nodes, links, selectedNodeId, onNodeClick, graphBounds }) => {
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 800, height: 600 });
  const svgRef = useRef(null);

  useEffect(() => {
    if (svgRef.current && graphBounds) {
      const svgWidth = svgRef.current.clientWidth;
      const svgHeight = svgRef.current.clientHeight;
  
      if (svgWidth === 0 || svgHeight === 0) return; // Evitar divisão por zero
  
      const graphWidth = graphBounds.maxX - graphBounds.minX;
      const graphHeight = graphBounds.maxY - graphBounds.minY;
  
      // Calcular a escala para caber o grafo inteiro
      const scaleX = svgWidth / graphWidth;
      const scaleY = svgHeight / graphHeight;
      const scale = Math.min(scaleX, scaleY) * 0.95; // 0.95 para uma pequena margem
  
      // O width/height do viewBox é o tamanho da tela dividido pela escala
      const viewboxWidth = svgWidth / scale;
      const viewboxHeight = svgHeight / scale;
  
      // Centralizar o viewBox no centro do grafo
      const viewboxX = graphBounds.minX + (graphWidth - viewboxWidth) / 2;
      const viewboxY = graphBounds.minY + (graphHeight - viewboxHeight) / 2;
  
      setViewBox({
        x: viewboxX,
        y: viewboxY,
        width: viewboxWidth,
        height: viewboxHeight,
      });
    }
  }, [graphBounds]); 
  
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (e.target === svgRef.current) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      e.currentTarget.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      const scaleX = viewBox.width / (svgRef.current?.clientWidth || viewBox.width);
      const scaleY = viewBox.height / (svgRef.current?.clientHeight || viewBox.height);
      const dx = (e.clientX - panStart.x) * scaleX;
      const dy = (e.clientY - panStart.y) * scaleY;
      
      setViewBox(v => {
        let newX = v.x - dx;
        let newY = v.y - dy;

        // Aplicar limites de pan
        if (graphBounds) {
          newX = Math.max(graphBounds.minX, Math.min(newX, graphBounds.maxX - v.width));
          newY = Math.max(graphBounds.minY, Math.min(newY, graphBounds.maxY - v.height));
        }

        return { ...v, x: newX, y: newY };
      });
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = (e) => {
    if (isPanning) {
        setIsPanning(false);
        e.currentTarget.style.cursor = 'grab';
    }
  };
  
  const handleWheel = (e) => {
      e.preventDefault();
      if (!svgRef.current || !graphBounds) return;

      const scaleFactor = 1.1;
      const { clientX, clientY } = e;
      
      const svgPoint = svgRef.current.createSVGPoint();
      svgPoint.x = clientX;
      svgPoint.y = clientY;
      
      const ctm = svgRef.current.getScreenCTM()?.inverse();
      if (!ctm) return;
      
      const { x: pointerX, y: pointerY } = svgPoint.matrixTransform(ctm);

      let newWidth = e.deltaY > 0 ? viewBox.width * scaleFactor : viewBox.width / scaleFactor;
      let newHeight = e.deltaY > 0 ? viewBox.height * scaleFactor : viewBox.height / scaleFactor;

      // Limitar zoom out
      const graphWidth = graphBounds.maxX - graphBounds.minX;
      const graphHeight = graphBounds.maxY - graphBounds.minY;
      if (newWidth > graphWidth) newWidth = graphWidth;
      if (newHeight > graphHeight) newHeight = graphHeight;

      // Limitar zoom in (ex: não menor que o tamanho de um nó)
      const MIN_ZOOM_WIDTH = 240;
      if (newWidth < MIN_ZOOM_WIDTH) newWidth = MIN_ZOOM_WIDTH;
      if (newHeight < MIN_ZOOM_WIDTH * (viewBox.height / viewBox.width)) newHeight = MIN_ZOOM_WIDTH * (viewBox.height / viewBox.width);


      let newX = pointerX - (pointerX - viewBox.x) * (newWidth / viewBox.width);
      let newY = pointerY - (pointerY - viewBox.y) * (newHeight / viewBox.height);

      // Aplicar limites de pan após o zoom
      newX = Math.max(graphBounds.minX, Math.min(newX, graphBounds.maxX - newWidth));
      newY = Math.max(graphBounds.minY, Math.min(newY, graphBounds.maxY - newHeight));

      setViewBox({ x: newX, y: newY, width: newWidth, height: newHeight });
  }

  if (!nodes || nodes.length === 0) {
    return <div className="flex items-center justify-center h-full">Nenhum dado para exibir.</div>;
  }

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      className="cursor-grab bg-muted/10"
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
        <g>
          {links.map((link, i) => (
            <MapaMentalLink 
              key={`${link.source.id}-${link.target.id}-${i}`} 
              source={link.source} 
              target={link.target}
              selectedNodeId={selectedNodeId}
            />
          ))}
          {nodes.map(node => (
            <MapaMentalNode
              key={node.id}
              node={node}
              onNodeClick={onNodeClick}
            />
          ))}
        </g>
    </svg>
  );
}

export default MapaMentalVisualizacao;