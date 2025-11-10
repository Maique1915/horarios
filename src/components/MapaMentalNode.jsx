import React from 'react';

const NODE_WIDTH = 240;
const NODE_HEIGHT = 72;

// Cores locais para garantir que funcionem sem depender de CSS externo
const periodColors = [
  'rgba(255, 99, 132, 1)',   // Vermelho
  'rgba(54, 162, 235, 1)',   // Azul
  'rgba(255, 206, 86, 1)',   // Amarelo
  'rgba(75, 192, 192, 1)',   // Verde água
  'rgba(153, 102, 255, 1)',  // Roxo
  'rgba(255, 159, 64, 1)',   // Laranja
  'rgba(201, 203, 207, 1)',  // Cinza
  'rgba(255, 99, 255, 1)',   // Rosa
  'rgba(100, 255, 100, 1)',  // Verde claro
  'rgba(0, 191, 255, 1)',    // Azul celeste
];
 
// Gera cores de fundo com opacidade
const periodBackgroundColors = periodColors.map(c => c.replace(', 1)', ', 0.15)'));

const SubjectNode = ({ node, onNodeClick, selectedNodeId }) => {
  const statusColors = {
    feita: {
      border: 'rgba(0, 128, 0, 1)', // Verde
      background: 'rgba(0, 128, 0, 0.15)',
    },
    podeFazer: {
      border: 'rgba(0, 0, 255, 1)', // Azul
      background: 'rgba(0, 0, 255, 0.15)',
    },
    naoPodeFazer: {
      border: 'rgba(128, 128, 128, 1)', // Cinza
      background: 'rgba(128, 128, 128, 0.15)',
    },
    normal: { // Fallback para quando nenhum status é passado
      border: periodColors[(node.depth - 1) % periodColors.length],
      background: periodBackgroundColors[(node.depth - 1) % periodBackgroundColors.length],
    }
  };

  const { border, background } = statusColors[node.status] || statusColors.normal;
  const isSelected = node.id === selectedNodeId;

  return (
    <g 
      transform={`translate(${node.x}, ${node.y})`} 
      className="transition-all duration-300 ease-in-out cursor-pointer"
      onClick={() => onNodeClick(node.id)}
    >
      <foreignObject x={-NODE_WIDTH / 2} y={-NODE_HEIGHT / 2} width={NODE_WIDTH} height={NODE_HEIGHT} className="group">
        <div 
          className="w-full h-full p-3 rounded-lg shadow-lg flex items-center justify-center text-center font-medium transition-all duration-200"
          style={{ 
            border: `2px solid ${border}`,
            backgroundColor: background,
            color: 'hsl(var(--foreground))',
          }}
        >
          <p className="line-clamp-3">{node.name} ({node.id})</p>
        </div>
      </foreignObject>
    </g>
  );
};

const TitleNode = ({ node }) => {
  return (
    <g transform={`translate(${node.x}, ${node.y})`}>
      <foreignObject x={-NODE_WIDTH / 2} y={-node.height / 2} width={NODE_WIDTH} height={node.height}>
        <div className="w-full h-full flex items-center justify-center">
          <h2 className="text-xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
            {node.name}
          </h2>
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