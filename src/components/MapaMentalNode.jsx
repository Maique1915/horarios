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

const SubjectNode = ({ node, onNodeClick, selectedNodeId }) => {
  const isSelected = node.id === selectedNodeId;

  // Determine Visual State based on node status
  // status can be: 'feita', 'podeFazer', 'naoPodeFazer', 'normal'

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
      className="transition-all duration-300 ease-in-out cursor-pointer"
      onClick={(e) => { e.stopPropagation(); onNodeClick(node.id); }}
    >
      <foreignObject x={0} y={0} width={node.width} height={node.height} className="overflow-visible">
        <div
          className={`
            relative w-full h-full px-4 py-2 flex flex-col items-center justify-center text-center
            rounded-xl border transition-all duration-200 select-none
            ${getStatusStyles()}
          `}
        >
          {/* Period Indicator strip on left */}
          <div
            className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full opacity-80"
            style={{ backgroundColor: periodColor }}
          />

          <p className="text-xs font-bold font-mono opacity-60 mb-0.5 leading-none">
            {node.id}
          </p>
          <p className="text-sm font-medium leading-tight line-clamp-2 w-full px-2">
            {node.name}
          </p>
        </div>
      </foreignObject>
    </g>
  );
};

const TitleNode = ({ node }) => {
  return (
    <g transform={`translate(${node.x}, ${node.y})`}>
      {/* Center title horizontally around point x (which we adjusted in parent to be center of column) */}
      <foreignObject x={-node.width / 2} y={0} width={node.width} height={node.height}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
              {node.name}
            </h2>
          </div>
        </div>
      </foreignObject>
    </g>
  );
};


const MapaMentalNode = ({ node, onNodeClick, selectedNodeId }) => {
  if (node.type === 'title') {
    return <TitleNode node={node} />;
  }
  return <SubjectNode node={node} onNodeClick={onNodeClick} selectedNodeId={selectedNodeId} />;
};

export default MapaMentalNode;
