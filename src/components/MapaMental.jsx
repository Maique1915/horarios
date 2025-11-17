import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { loadDbData } from '../model/loadData';
import MapaMentalVisualizacao from './MapaMentalVisualizacao';
// Remover import html2canvas from 'html2canvas';

// Constantes para o layout
const COLUMN_WIDTH = 400; // Reverter para o valor original
const ROW_HEIGHT = 100; // Aumentado para evitar sobreposição
const NODE_WIDTH = 100; // Reverter para o valor original
const NODE_HEIGHT = 72; // Reverter para o valor original
const TITLE_WIDTH = 240;
const TITLE_HEIGHT = 50;
const VERTICAL_PADDING = 30; // Manter se for usado em ROW_HEIGHT

const MapaMental = ({ subjectStatus, onVoltar }) => {
  const { cur } = useParams();

  const [mindMapData, setMindMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const svgRef = useRef(null);
  // Remover const containerRef = useRef(null);

  const handleNodeClick = useCallback((nodeId) => {
    setSelectedNodeId(prevId => (prevId === nodeId ? null : nodeId));
  }, []);

  // Remover handleDownloadImage e o useEffect de captura

  const processarDadosParaMapa = useCallback((disciplinasDoCurso, currentSubjectStatus) => { // Remover downloadMode
    // Remover currentLayout e usar as constantes diretamente
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
      const columnX = (periodo - 1) * COLUMN_WIDTH; // Usar COLUMN_WIDTH diretamente

      nodes.push({
        id: `period-title-${periodo}`,
        name: `${periodo}º Período`,
        type: 'title',
        x: columnX,
        y: -100,
        width: TITLE_WIDTH, // Usar TITLE_WIDTH diretamente
        height: TITLE_HEIGHT, // Usar TITLE_HEIGHT diretamente
        depth: periodo,
      });

      disciplinasNoPeriodo.forEach((re, index) => {
        const disciplina = disciplinasMap.get(re);
        if (disciplina) {
          let status = 'naoPodeFazer';
          if (currentSubjectStatus?.feitas?.includes(re)) {
            status = 'feita';
          } else if (currentSubjectStatus?.podeFazer?.includes(re)) {
            status = 'podeFazer';
          }

          nodes.push({
            ...disciplina,
            type: 'subject',
            status: currentSubjectStatus ? status : 'normal',
            x: columnX,
            y: index * ROW_HEIGHT, // Usar ROW_HEIGHT diretamente
            width: NODE_WIDTH, // Usar NODE_WIDTH diretamente
            height: NODE_HEIGHT, // Usar NODE_HEIGHT diretamente
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

    const padding = 200; // Reverter para o padding original
    const graphBounds = {
      minX: minX - padding,
      minY: minY - padding,
      maxX: maxX + padding,
      maxY: maxY + padding,
    };

    return { nodes, links, graphBounds };
  }, []); // Dependências vazias para useCallback

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const db = await loadDbData();
      const filteredDb = db.filter(d => d._cu === cur);

      if (filteredDb.length > 0) {
        const data = processarDadosParaMapa(filteredDb, subjectStatus); // Remover isDownloadMode
        setMindMapData(data);
      }

      setLoading(false);
    };

    fetchData();
  }, [cur, subjectStatus, processarDadosParaMapa]); // Remover isDownloadMode das dependências

  if (loading) {
    return <div>Carregando mapa mental...</div>;
  }

  if (!mindMapData || mindMapData.nodes.length === 0) {
    return <div>Não há dados para exibir o mapa mental deste curso.</div>;
  }

  return (
    <div className="flex flex-col p-4 mx-auto">
      <div className="flex w-full lg:flex-row sm:flex-col  lg:justify-between sm:justify-center sm:align-center sm:gap-3 lg:gap-4">
        <h1 className="text-2xl font-bold">Mapa de Pré-requisitos - {cur}</h1>
        <div className="flex flex-wrap gap-2 justify-right sm:justify-center lg:justify-end items-center">
          {onVoltar && (
            <button
              onClick={onVoltar}
              className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
              Voltar
            </button>
          )}
          {/* Remover botão de baixar imagem */}
        </div>
      </div>
      <MapaMentalVisualizacao
        svgRef={svgRef}
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