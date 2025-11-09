import React from 'react';

const NODE_WIDTH = 240; // Valor fixo

const MapaMentalLink = ({ source, target, selectedNodeId }) => {
  const startX = source.x + NODE_WIDTH / 2;
  const startY = source.y;
  const endX = target.x - NODE_WIDTH / 2;
  const endY = target.y;

  const isVisible = selectedNodeId && (source.id === selectedNodeId || target.id === selectedNodeId);
  
  let strokeColor = "black"; // Cor padrão ou para quando não está selecionado
  if (isVisible) {
    if (target.id === selectedNodeId) {
      strokeColor = "blue"; // Cor para pré-requisitos (entrada)
    } else if (source.id === selectedNodeId) {
      strokeColor = "green"; // Cor para matérias que libera (saída)
    }
  }

  // Curva de Bézier em "S" para um visual mais orgânico e que desvia melhor
  const path = `M ${startX} ${startY} C ${startX + 60} ${startY}, ${endX - 60} ${endY}, ${endX} ${endY}`;

  return (
    <path
      d={path}
      fill="none"
      stroke={strokeColor}
      strokeWidth="2"
      style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.3s, stroke 0.3s' }}
    />
  );
};

export default MapaMentalLink;
