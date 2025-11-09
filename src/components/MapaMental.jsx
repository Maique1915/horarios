import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import db from '../model/db.json';
import MapaMentalVisualizacao from './MapaMentalVisualizacao';

// Constantes para o layout
const COLUMN_WIDTH = 350;
const ROW_HEIGHT = 150;

const MapaMental = () => {
  const { cur } = useParams();
  const [mindMapData, setMindMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const handleNodeClick = (nodeId) => {
    setSelectedNodeId(prevId => (prevId === nodeId ? null : nodeId)); // Clicar de novo no mesmo nó deseleciona
  };

  const processarDadosParaMapa = (disciplinasDoCurso) => {
    // 1. Mapear todas as disciplinas por seu código (_re) para fácil acesso
    const disciplinasMap = new Map();
    disciplinasDoCurso.forEach(d => {
      // Adicionar apenas disciplinas ativas
      if (d._ag && !disciplinasMap.has(d._re)) {
        disciplinasMap.set(d._re, { ...d, id: d._re, name: d._di });
      }
    });

    // 2. Agrupar disciplinas por período (apenas as ativas)
    const periodosMap = new Map();
    disciplinasDoCurso.forEach(d => {
      if (d._ag) { // Apenas disciplinas ativas
        if (!periodosMap.has(d._se)) {
          periodosMap.set(d._se, []);
        }
        // Adicionar apenas a referência (_re) para evitar duplicar dados
        if (!periodosMap.get(d._se).includes(d._re)) {
          periodosMap.get(d._se).push(d._re);
        }
      }
    });

    // 3. Criar os nós (nodes) para matérias e títulos
    const nodes = [];
    const sortedPeriods = Array.from(periodosMap.keys()).sort((a, b) => a - b);

    sortedPeriods.forEach(periodo => {
      const disciplinasNoPeriodo = periodosMap.get(periodo);
      const columnX = (periodo - 1) * COLUMN_WIDTH;

      // Adicionar nó de título do período
      nodes.push({
        id: `period-title-${periodo}`,
        name: `${periodo}º Período`,
        type: 'title', // Tipo especial para o nó de título
        x: columnX,
        y: -100, // Posição acima dos nós de matéria
        width: 240,
        height: 50,
        depth: periodo,
      });

      // Adicionar nós de matéria
      disciplinasNoPeriodo.forEach((re, index) => {
        const disciplina = disciplinasMap.get(re);
        if (disciplina) {
          nodes.push({
            ...disciplina,
            type: 'subject', // Tipo padrão
            x: columnX,
            y: index * ROW_HEIGHT,
            width: 240,
            height: 72,
            depth: periodo,
          });
        }
      });
    });
    
    // 4. Criar os links (arestas)
    const links = [];
    const subjectNodes = nodes.filter(n => n.type === 'subject');
    subjectNodes.forEach(targetNode => {
      if (targetNode._pr) {
        targetNode._pr.forEach(prereq_re => {
          const sourceNode = subjectNodes.find(n => n._re === prereq_re);
          if (sourceNode) {
            links.push({
              source: sourceNode,
              target: targetNode,
            });
          }
        });
      }
    });

    // 5. Calcular os limites do grafo
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(node => {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + node.width);
      maxY = Math.max(maxY, node.y + node.height);
    });

    const padding = 200; // Adicionar um preenchimento ao redor do grafo
    const graphBounds = {
      minX: minX - padding,
      minY: minY - padding,
      maxX: maxX + padding,
      maxY: maxY + padding,
    };

    return { nodes, links, graphBounds };
  };

  useEffect(() => {
    setLoading(true);
    const filteredDb = db.filter(d => d._cu === cur);
    
    if (filteredDb.length > 0) {
      const data = processarDadosParaMapa(filteredDb);
      console.log('Dados do Mapa Mental:', data); // Log para depuração
      setMindMapData(data);
    }
    
    setLoading(false);
  }, [cur]);

  if (loading) {
    return <div>Carregando mapa mental...</div>;
  }

  if (!mindMapData || mindMapData.nodes.length === 0) {
    return <div>Não há dados para exibir o mapa mental deste curso.</div>;
  }

  // O componente de visualização precisa ser adaptado para receber 'nodes' e 'links'
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <h1 className="text-2xl font-bold p-4">Mapa de Pré-requisitos - {cur}</h1>
      <MapaMentalVisualizacao 
        nodes={mindMapData.nodes} 
        links={mindMapData.links}
        selectedNodeId={selectedNodeId}
        onNodeClick={handleNodeClick}
        graphBounds={mindMapData.graphBounds}
      />
    </div>
  );
};

export default MapaMental;
