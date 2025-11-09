import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import db from '../model/db.json';
import MapaMentalVisualizacao from './MapaMentalVisualizacao';

// Constantes para o layout
const COLUMN_WIDTH = 280;
const ROW_HEIGHT = 100;

const MapaMental = ({ subjectStatus, onVoltar }) => {
  const { cur } = useParams();

  const [mindMapData, setMindMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const handleNodeClick = (nodeId) => {
    setSelectedNodeId(prevId => (prevId === nodeId ? null : nodeId));
  };

  const processarDadosParaMapa = (disciplinasDoCurso) => {
    const disciplinasMap = new Map();
    disciplinasDoCurso.forEach(d => {
      if (d._ag && !disciplinasMap.has(d._re)) {
        disciplinasMap.set(d._re, { ...d, id: d._re, name: d._di });
      }
    });

    const periodosMap = new Map();
    disciplinasDoCurso.forEach(d => {
      if (d._ag) {
        if (!periodosMap.has(d._se)) {
          periodosMap.set(d._se, []);
        }
        if (!periodosMap.get(d._se).includes(d._re)) {
          periodosMap.get(d._se).push(d._re);
        }
      }
    });

    const nodes = [];
    const sortedPeriods = Array.from(periodosMap.keys()).sort((a, b) => a - b);

    sortedPeriods.forEach(periodo => {
      const disciplinasNoPeriodo = periodosMap.get(periodo);
      const columnX = (periodo - 1) * COLUMN_WIDTH;

      nodes.push({
        id: `period-title-${periodo}`,
        name: `${periodo}º Período`,
        type: 'title',
        x: columnX,
        y: -100,
        width: 240,
        height: 50,
        depth: periodo,
      });

      disciplinasNoPeriodo.forEach((re, index) => {
        const disciplina = disciplinasMap.get(re);
        if (disciplina) {
          let status = 'naoPodeFazer';
          if (subjectStatus?.feitas?.includes(re)) {
            status = 'feita';
          } else if (subjectStatus?.podeFazer?.includes(re)) {
            status = 'podeFazer';
          }

          nodes.push({
            ...disciplina,
            type: 'subject',
            status: subjectStatus ? status : 'normal',
            x: columnX,
            y: index * ROW_HEIGHT,
            width: 240,
            height: 72,
            depth: periodo,
          });
        }
      });
    });
    
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

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(node => {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + node.width);
      maxY = Math.max(maxY, node.y + node.height);
    });

    const padding = 200;
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
      setMindMapData(data);
    }
    
    setLoading(false);
  }, [cur, subjectStatus]);

  if (loading) {
    return <div>Carregando mapa mental...</div>;
  }

  if (!mindMapData || mindMapData.nodes.length === 0) {
    return <div>Não há dados para exibir o mapa mental deste curso.</div>;
  }

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <div className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mapa de Pré-requisitos - {cur}</h1>
        {onVoltar && (
          <button
            onClick={onVoltar}
            className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            Voltar
          </button>
        )}
      </div>
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
