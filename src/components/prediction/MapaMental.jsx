'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { loadDbData } from '../../services/disciplinaService';
import { useQuery } from '@tanstack/react-query';
import MapaMentalVisualizacao from './MapaMentalVisualizacao';
import LoadingSpinner from '../shared/LoadingSpinner';
// Remover import html2canvas from 'html2canvas';

// Constantes para o layout
// Constants for layout - Visual Tuning
const COLUMN_WIDTH = 380; // More horizontal spacing
const ROW_HEIGHT = 110;   // More vertical spacing
const NODE_WIDTH = 300;   // Wider cards for better text fit
const NODE_HEIGHT = 80;   // Taller cards
const TITLE_WIDTH = 300;
const TITLE_HEIGHT = 40;

const MapaMental = ({ subjectStatus, onVoltar }) => {
  const params = useParams();
  const cur = params?.cur;

  const [mindMapData, setMindMapData] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const svgRef = useRef(null);

  const handleNodeClick = useCallback((nodeId) => {
    setSelectedNodeId(prevId => (prevId === nodeId ? null : nodeId));
  }, []);

  const processarDadosParaMapa = useCallback((disciplinasDoCurso, currentSubjectStatus) => {
    const disciplinasMap = new Map();
    disciplinasDoCurso.forEach(d => {
      // Filter only active subjects
      if (d._ag && !disciplinasMap.has(d._re)) {
        disciplinasMap.set(d._re, { ...d, id: d._re, name: d._di });
      }
    });

    // Group by semester/period
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
    // Sort periods numerically
    const sortedPeriods = Array.from(periodosMap.keys()).sort((a, b) => a - b);

    sortedPeriods.forEach(periodo => {
      const disciplinasNoPeriodo = periodosMap.get(periodo);
      const columnX = (periodo - 1) * COLUMN_WIDTH;

      // Add Period Title Node
      nodes.push({
        id: `period-title-${periodo}`,
        name: `${periodo}º Período`,
        type: 'title',
        x: columnX + (NODE_WIDTH / 2), // Center title relative to column
        y: -100,
        width: TITLE_WIDTH,
        height: TITLE_HEIGHT,
        depth: periodo,
      });

      // Add Subject Nodes
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
            y: index * ROW_HEIGHT,
            width: NODE_WIDTH,
            height: NODE_HEIGHT,
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

    // Calculate bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(node => {
      // For calculation, assume node anchor is center to make bounds more predictable?
      // Or top-left. Current implementation uses top-left logic in Node, but might need centering.
      // Let's stick to Top-Left for x/y to be consistent with SVG rects usually.

      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + node.width);
      maxY = Math.max(maxY, node.y + node.height);
    });

    const padding = 300;
    const graphBounds = {
      minX: minX - padding,
      minY: minY - padding,
      maxX: maxX + padding,
      maxY: maxY + padding,
    };

    return { nodes, links, graphBounds };
  }, []);

  // React Query for Subjects Data
  const { data: dbData = [], isLoading } = useQuery({
    queryKey: ['subjects', cur],
    queryFn: () => loadDbData(cur),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: !!cur,
  });

  useEffect(() => {
    if (dbData.length > 0) {
      const data = processarDadosParaMapa(dbData, subjectStatus);
      setMindMapData(data);
    }
  }, [dbData, processarDadosParaMapa, subjectStatus]);

  const loading = isLoading; // Alias for compatibility with existing code

  if (loading) {
    return <LoadingSpinner message="Carregando mapa mental..." />;
  }

  if (!mindMapData || mindMapData.nodes.length === 0) {
    return <div>Não há dados para exibir o mapa mental deste curso.</div>;
  }

  return (
    <div className="flex flex-col p-4 mx-auto">
      <div className="flex w-full lg:flex-row sm:flex-col  lg:justify-between sm:justify-center sm:align-center sm:gap-3 lg:gap-4">
        <h1 className="text-2xl dark:text-text-dark-primary font-bold">Mapa de Pré-requisitos - {cur}</h1>
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