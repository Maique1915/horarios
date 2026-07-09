import React, { useState, useMemo, useEffect } from 'react';
import MapaMentalNode from './MapaMentalNode';
import MapaMentalLink from './MapaMentalLink';

const MapaMentalVisualizacao = ({ 
  nodes, links, selectedNodeId, onNodeClick, graphBounds, svgRef,
  draggedSubject = null, hoveredSemesterIndex = null, dragPosition = null, isHoverCollision = false,
  onDragStart = () => {}, onDragMove = () => {}, onDragEnd = () => {}
}) => {
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 800, height: 600 });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Helper to convert client coordinates to SVG units
  const getSVGPoint = (clientX, clientY) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const pt = svgRef.current.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svgRef.current.getScreenCTM()?.inverse();
    return ctm ? pt.matrixTransform(ctm) : { x: clientX, y: clientY };
  };

  const COLUMN_WIDTH = 380;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (svgRef.current && graphBounds) {
      const svgWidth = svgRef.current.clientWidth;
      const svgHeight = svgRef.current.clientHeight;
      if (svgWidth === 0 || svgHeight === 0) return;

      const graphWidth = graphBounds.maxX - graphBounds.minX;
      const graphHeight = graphBounds.maxY - graphBounds.minY;
      const scaleX = svgWidth / graphWidth;
      const scaleY = svgHeight / graphHeight;
      const scale = Math.min(scaleX, scaleY);

      const viewboxWidth = svgWidth / scale;
      const viewboxHeight = svgHeight / scale;
      const viewboxX = graphBounds.minX + (graphWidth - viewboxWidth) / 2;
      const isDesktop = windowWidth >= 1024;
      const viewboxY = isDesktop ? -200 : graphBounds.minY + (graphHeight - viewboxHeight) / 2;

      setViewBox({ x: viewboxX, y: viewboxY, width: viewboxWidth, height: viewboxHeight });
    }
  }, [graphBounds, windowWidth]);

  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [pendingDrag, setPendingDrag] = useState(null); // {node, startPos}
  const dragThreshold = 5;

  // Touch Zoom State
  const [initialPinchDist, setInitialPinchDist] = useState(null);
  const [initialViewBox, setInitialViewBox] = useState(null);

  const getDistance = (touches) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getCenter = (touches) => {
    if (touches.length < 2) return { clientX: touches[0].clientX, clientY: touches[0].clientY };
    return {
      clientX: (touches[0].clientX + touches[1].clientX) / 2,
      clientY: (touches[0].clientY + touches[1].clientY) / 2
    };
  };

  const handleMouseDown = (e) => {
    if (e.target === svgRef.current || e.target.closest('rect[fill="url(#dot-pattern)"]')) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      e.currentTarget.style.cursor = 'grabbing';
    }
    setPendingDrag(null);
  };

  const handleMouseMove = (e) => {
    // Se há um drag pendente, verificar se o movimento ultrapassou o threshold
    if (pendingDrag && !draggedSubject) {
      const dx = Math.abs(e.clientX - pendingDrag.startPos.x);
      const dy = Math.abs(e.clientY - pendingDrag.startPos.y);
      
      if (Math.sqrt(dx * dx + dy * dy) > dragThreshold) {
        // Movimento suficiente - ativar drag
        const point = getSVGPoint(e.clientX, e.clientY);
        onDragStart(pendingDrag.node, point);
        setPendingDrag(null);
      } else {
        // Ainda dentro do threshold, não fazer nada
        return;
      }
    }

    if (isPanning) {
      const scaleX = viewBox.width / (svgRef.current?.clientWidth || viewBox.width);
      const scaleY = viewBox.height / (svgRef.current?.clientHeight || viewBox.height);
      const dx = (e.clientX - panStart.x) * scaleX;
      const dy = (e.clientY - panStart.y) * scaleY;
      setViewBox(v => {
        let newX = v.x - dx;
        let newY = v.y - dy;
        if (graphBounds) {
          newX = Math.max(graphBounds.minX, Math.min(newX, graphBounds.maxX - v.width));
          newY = Math.max(graphBounds.minY, Math.min(newY, graphBounds.maxY - v.height));
        }
        return { ...v, x: newX, y: newY };
      });
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }
    
    if (draggedSubject) {
      const point = getSVGPoint(e.clientX, e.clientY);
      const semesterIndex = Math.max(0, Math.floor(point.x / COLUMN_WIDTH));
      onDragMove(point, semesterIndex);
    }
  };

  const handleMouseUp = (e) => {
    if (isPanning) {
      setIsPanning(false);
      e.currentTarget.style.cursor = 'grab';
    }
    
    // Se havia drag pendente e nenhum drag iniciou, foi apenas um clique
    if (pendingDrag && !draggedSubject) {
      onNodeClick(pendingDrag.node.id);
    }
    
    if (draggedSubject) {
      onDragEnd();
    }
    
    setPendingDrag(null);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (!svgRef.current || !graphBounds) return;
    const scaleFactor = 1.1;
    const { clientX, clientY } = e;
    
    // Zoom in (deltaY < 0), Zoom out (deltaY > 0)
    applyZoom(clientX, clientY, e.deltaY > 0 ? 1/scaleFactor : scaleFactor);
  };

  const applyZoom = (clientX, clientY, scaleFactor, baseViewBox = viewBox) => {
    if (!svgRef.current || !graphBounds) return;
    
    const svgPoint = svgRef.current.createSVGPoint();
    svgPoint.x = clientX;
    svgPoint.y = clientY;
    const ctm = svgRef.current.getScreenCTM()?.inverse();
    if (!ctm) return;
    const { x: pointerX, y: pointerY } = svgPoint.matrixTransform(ctm);
    
    // Invert the meaning of scaleFactor to match SVG viewbox behavior (larger viewbox = smaller elements)
    let newWidth = baseViewBox.width / scaleFactor;
    let newHeight = baseViewBox.height / scaleFactor;
    
    const graphWidth = graphBounds.maxX - graphBounds.minX;
    const graphHeight = graphBounds.maxY - graphBounds.minY;
    
    // Limite máximo de zoom out (não mais longe que o mapa real)
    if (newWidth > graphWidth * 1.5) newWidth = graphWidth * 1.5;
    if (newHeight > graphHeight * 1.5) newHeight = graphHeight * 1.5;
    
    // Limite máximo de zoom in
    const MIN_ZOOM_WIDTH = 360;
    if (newWidth < MIN_ZOOM_WIDTH) newWidth = MIN_ZOOM_WIDTH;
    if (newHeight < MIN_ZOOM_WIDTH * (baseViewBox.height / baseViewBox.width)) newHeight = MIN_ZOOM_WIDTH * (baseViewBox.height / baseViewBox.width);
    
    let newX = pointerX - (pointerX - baseViewBox.x) * (newWidth / baseViewBox.width);
    let newY = pointerY - (pointerY - baseViewBox.y) * (newHeight / baseViewBox.height);
    
    // newX = Math.max(graphBounds.minX - 500, Math.min(newX, graphBounds.maxX + 500 - newWidth));
    // newY = Math.max(graphBounds.minY - 500, Math.min(newY, graphBounds.maxY + 500 - newHeight));
    
    setViewBox({ x: newX, y: newY, width: newWidth, height: newHeight });
  };

  // --- TOUCH HANDLERS ---
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Começou um pinch
      setInitialPinchDist(getDistance(e.touches));
      setInitialViewBox({ ...viewBox });
      setIsPanning(false);
    } else if (e.touches.length === 1) {
      // Começou um pan ou um possível drag (se originado de um Node, o Node avisa no onDragStart)
      // Aqui, se não for originário de um node, é pan do background
      if (e.target === svgRef.current || e.target.closest('rect[fill="url(#dot-pattern)"]')) {
        setIsPanning(true);
        setPanStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      }
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && initialPinchDist && initialViewBox) {
      // Zoom
      e.preventDefault(); // Previne scroll da página
      const currentDist = getDistance(e.touches);
      const scaleFactor = currentDist / initialPinchDist; // scale > 1 means zoom in
      const center = getCenter(e.touches);
      
      applyZoom(center.clientX, center.clientY, scaleFactor, initialViewBox);
      return;
    }

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      
      if (pendingDrag && !draggedSubject) {
        const dx = Math.abs(touch.clientX - pendingDrag.startPos.x);
        const dy = Math.abs(touch.clientY - pendingDrag.startPos.y);
        
        if (Math.sqrt(dx * dx + dy * dy) > dragThreshold) {
          e.preventDefault(); // Evita scroll do body durante drag de matéria
          const point = getSVGPoint(touch.clientX, touch.clientY);
          onDragStart(pendingDrag.node, point);
          setPendingDrag(null);
        }
        return;
      }

      if (isPanning) {
        e.preventDefault(); // Previne scroll da página
        const scaleX = viewBox.width / (svgRef.current?.clientWidth || viewBox.width);
        const scaleY = viewBox.height / (svgRef.current?.clientHeight || viewBox.height);
        const dx = (touch.clientX - panStart.x) * scaleX;
        const dy = (touch.clientY - panStart.y) * scaleY;
        
        setViewBox(v => {
          let newX = v.x - dx;
          let newY = v.y - dy;
          return { ...v, x: newX, y: newY };
        });
        setPanStart({ x: touch.clientX, y: touch.clientY });
        return;
      }
      
      if (draggedSubject) {
        e.preventDefault();
        const point = getSVGPoint(touch.clientX, touch.clientY);
        const semesterIndex = Math.max(0, Math.floor(point.x / COLUMN_WIDTH));
        onDragMove(point, semesterIndex);
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length < 2) {
      setInitialPinchDist(null);
      setInitialViewBox(null);
    }
    
    if (e.touches.length === 0) {
      if (isPanning) {
        setIsPanning(false);
      }
      
      if (pendingDrag && !draggedSubject) {
        onNodeClick(pendingDrag.node.id);
      }
      
      if (draggedSubject) {
        onDragEnd();
      }
      
      setPendingDrag(null);
    }
  };

  if (!nodes || nodes.length === 0) return null;

  const uniqueNodes = useMemo(() => {
    const seen = new Set();
    return nodes.filter(node => {
      if (seen.has(node.id)) return false;
      seen.add(node.id);
      return true;
    });
  }, [nodes]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      className="cursor-grab bg-muted/10 touch-none"
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <defs>
        <pattern id="dot-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" className="fill-slate-300 dark:fill-slate-700" />
        </pattern>
      </defs>
      <rect x={viewBox.x} y={viewBox.y} width={viewBox.width} height={viewBox.height} fill="url(#dot-pattern)" className="pointer-events-none" />
      
      {draggedSubject && hoveredSemesterIndex !== null && (
        <>
          {/* Background overlay - changes color based on collision */}
          <rect
            x={hoveredSemesterIndex * COLUMN_WIDTH}
            y={graphBounds.minY}
            width={COLUMN_WIDTH}
            height={graphBounds.maxY - graphBounds.minY}
            fill={isHoverCollision ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)"}
            className="pointer-events-none transition-all duration-150"
          />
          
          {/* Border highlight */}
          <rect
            x={hoveredSemesterIndex * COLUMN_WIDTH}
            y={graphBounds.minY}
            width={COLUMN_WIDTH}
            height={graphBounds.maxY - graphBounds.minY}
            fill="none"
            stroke={isHoverCollision ? "#ef4444" : "#22c55e"}
            strokeWidth="3"
            className="pointer-events-none transition-all duration-150"
          />
        </>
      )}

      <g>
        {links.map((link, i) => (
          <MapaMentalLink key={`${link.source.id}-${link.target.id}-${i}`} source={link.source} target={link.target} selectedNodeId={selectedNodeId} />
        ))}
        {uniqueNodes.map(node => (
          <MapaMentalNode
            key={node.id}
            node={node}
            onNodeClick={onNodeClick}
            onTitleClick={node.onEdit}
            onDragStart={clientPoint => {
              // Registrar como "pending drag" - só confirma se houver movimento
              setPendingDrag({ node, startPos: clientPoint });
            }}
          />
        ))}

        {draggedSubject && dragPosition && (
          <>
            {/* Shadow effect */}
            <g transform={`translate(${dragPosition.x - 150}, ${dragPosition.y - 40})`} className="pointer-events-none opacity-40 filter drop-shadow-lg">
              <rect
                x={0}
                y={0}
                width={300}
                height={80}
                rx={12}
                fill="#000"
                className="blur-sm"
              />
            </g>
            
            {/* Ghost node */}
            <g transform={`translate(${dragPosition.x - 150}, ${dragPosition.y - 40})`} className="pointer-events-none opacity-95">
              <MapaMentalNode
                node={{
                  ...draggedSubject,
                  id: 'ghost-node',
                  name: draggedSubject._di,
                  type: 'subject',
                  status: 'podeFazer',
                  x: 0,
                  y: 0,
                  width: 300,
                  height: 80,
                }}
              />
            </g>
          </>
        )}
      </g>
    </svg>
  );
};

export default MapaMentalVisualizacao;