import React from 'react';

// Cores para os períodos (bordas laterais)
const periodColors = [
  '#ef4444', // red-500
  '#3b82f6', // blue-500
  '#eab308', // yellow-500
  '#14b8a6', // teal-500
  '#a855f7', // purple-500
  '#f97316', // orange-500
  '#64748b', // slate-500
  '#ec4899', // pink-500
  '#22c55e', // green-500
  '#0ea5e9', // sky-500
];

const SubjectNode = ({ node, onNodeClick, selectedNodeId, onDragStart }) => {
  const isSelected = node.id === selectedNodeId;
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseDown = (e) => {
    // Só registrar a posição inicial, não iniciar drag yet
    if (e.button !== 0) return;
    
    e.stopPropagation();
    e.preventDefault();
    
    // Notificar o pai (MapaMentalVisualizacao) que um card pode estar sendo arrastado
    // Passa apenas as coordenadas - o pai vai detectar movimento via threshold
    if (onDragStart) {
      onDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleClick = (e) => {
    // Click só dispara se não houve movimento significativo
    // O pai (MapaMentalVisualizacao) vai decidir se é drag ou click
    e.stopPropagation();
    onNodeClick(node.id);
  };

  const getStatusStyles = () => {
    if (isSelected) {
      return "ring-2 ring-primary bg-primary/10 border-primary shadow-xl scale-105 z-10";
    }

    switch (node.status) {
      case 'feita':
        return "bg-green-100 dark:bg-green-900/30 border-green-500/50 text-green-900 dark:text-green-100 shadow-sm opacity-90 grayscale-0";
      case 'podeFazer':
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-400 text-blue-900 dark:text-blue-100 shadow-md font-semibold ring-1 ring-blue-200 dark:ring-blue-800";
      case 'naoPodeFazer':
      default:
        // Normal/Locked style - improved visibility for dark mode
        return "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-200 shadow-sm opacity-90";
    }
  };

  const periodColor = periodColors[(node.depth - 1) % periodColors.length];

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      className="transition-all duration-300 ease-in-out cursor-move hover:drop-shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <foreignObject x={0} y={0} width={node.width} height={node.height} className="overflow-visible">
        <div
          className={`
            relative w-full h-full px-4 py-2 flex flex-col items-center justify-center text-center
            rounded-xl border transition-all duration-200 select-none cursor-move
            ${isHovered ? 'scale-105 shadow-lg' : ''}
            ${getStatusStyles()}
          `}
          onClick={handleClick}
          onMouseDown={handleMouseDown}
        >
          {/* Period Indicator strip on left */}
          <div
            className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full opacity-80 transition-all duration-200"
            style={{ backgroundColor: periodColor }}
          />

          {/* Optional badge */}
          {node.isOptional && (
            <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded-md bg-purple-400 dark:bg-purple-600 text-white text-[9px] font-bold shadow-sm">
              OPT
            </div>
          )}

          {/* Drag hint - visible on hover */}
          {isHovered && (
            <div className="absolute top-1 left-1 text-[8px] text-slate-400 dark:text-slate-500 opacity-75 font-mono">
              ⚡ Clique e arraste
            </div>
          )}

          <p className="text-xs font-bold font-mono opacity-60 mb-0.5 leading-none">
            {node.acronym || node.id || node._re}
          </p>
          <p className="text-sm font-medium leading-tight line-clamp-2 w-full px-2">
            {node.name || node._di}
          </p>
        </div>
      </foreignObject>
    </g>
  );
};

const TitleNode = ({ node, onClick }) => {
  return (
    <g transform={`translate(${node.x}, ${node.y})`} onClick={(e) => { e.stopPropagation(); onClick && onClick(node.id); }} className={onClick ? "cursor-pointer hover:opacity-80" : ""}>
      {/* Center title horizontally around point x (which we adjusted in parent to be center of column) */}
      <foreignObject x={-node.width / 2} y={0} width={node.width} height={node.height} className="pointer-events-none">
        <div className="w-full h-full flex items-center justify-center pointer-events-auto">
          <div className="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap flex items-center gap-2">
              {node.name}
              {onClick && <span className="material-symbols-outlined text-xs text-slate-400">edit</span>}
            </h2>
          </div>
        </div>
      </foreignObject>
    </g>
  );
};


const MapaMentalNode = ({ node, onNodeClick, selectedNodeId, onTitleClick, onDragStart }) => {
  if (node.type === 'title') {
    return <TitleNode node={node} onClick={onTitleClick} />;
  }
  return <SubjectNode node={node} onNodeClick={onNodeClick} selectedNodeId={selectedNodeId} onDragStart={onDragStart} />;
};

export default MapaMentalNode;
