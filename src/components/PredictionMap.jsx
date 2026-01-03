'use client';

import React, { useMemo, useRef, useState, useCallback } from 'react';
import MapaMentalVisualizacao from './MapaMentalVisualizacao';

// Constants layout - reused/adapted from MapaMental
const COLUMN_WIDTH = 380;
const ROW_HEIGHT = 110;
const NODE_WIDTH = 300;
const NODE_HEIGHT = 80;
const TITLE_WIDTH = 300;
const TITLE_HEIGHT = 40;

const PredictionMap = ({ semesterGrids, onClose }) => {
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const svgRef = useRef(null);

    const handleNodeClick = useCallback((nodeId) => {
        setSelectedNodeId(prevId => (prevId === nodeId ? null : nodeId));
    }, []);

    const mindMapData = useMemo(() => {
        if (!semesterGrids || semesterGrids.length === 0) return null;

        const nodes = [];
        const links = [];

        // Flatten for link search
        const allPredictedSubjects = semesterGrids.flat();
        const subjectsMap = new Map(allPredictedSubjects.map(s => [s._re, s]));

        semesterGrids.forEach((subjects, index) => {
            const semesterNum = index + 1;
            const columnX = (semesterNum - 1) * COLUMN_WIDTH;

            // Title Node
            nodes.push({
                id: `period-title-${semesterNum}`,
                name: `${semesterNum}º Semestre Previsto`,
                type: 'title',
                x: columnX + (NODE_WIDTH / 2),
                y: -100,
                width: TITLE_WIDTH,
                height: TITLE_HEIGHT,
                depth: semesterNum,
            });

            // Subject Nodes
            subjects.forEach((subject, subIndex) => {
                // Status is always 'podeFazer' or something indicating future
                // But MapaMentalNode expects: 'feita', 'podeFazer', 'naoPodeFazer', 'normal'
                // Since this is a prediction of what TO DO, let's mark as 'podeFazer' (blue) or 'normal'
                // If we mark as 'podeFazer', it usually means "Available to take".
                // These ARE available to take in that specific sequence (theoretically).

                nodes.push({
                    ...subject,
                    id: subject._re, // Ensure ID is set
                    name: subject._di,
                    type: 'subject',
                    status: 'podeFazer', // Visual style
                    x: columnX,
                    y: subIndex * ROW_HEIGHT,
                    width: NODE_WIDTH,
                    height: NODE_HEIGHT,
                    depth: semesterNum,
                });
            });
        });

        // Links - Prerequisities
        // We only link if both source and target are in the prediction VISIBLE map.
        // If a prereq was already completed, it won't be in the map, so no link (or maybe we should show it? No, keeping it simple).
        const subjectNodes = nodes.filter(n => n.type === 'subject');
        subjectNodes.forEach(targetNode => {
            if (targetNode._pr) {
                targetNode._pr.forEach(prereq_re => {
                    const sourceNode = subjectNodes.find(n => n._re === prereq_re);
                    if (sourceNode) {
                        links.push({
                            source: sourceNode,
                            target: targetNode
                        });
                    }
                });
            }
        });

        // Calculate bounds
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        nodes.forEach(node => {
            minX = Math.min(minX, node.x);
            minY = Math.min(minY, node.y);
            maxX = Math.max(maxX, node.x + node.width);
            maxY = Math.max(maxY, node.y + node.height);
        });

        // Default bounds if empty (shouldn't happen)
        if (minX === Infinity) { minX = 0; maxX = 100; minY = 0; maxY = 100; }

        const padding = 300;
        const graphBounds = {
            minX: minX - padding,
            minY: minY - padding,
            maxX: maxX + padding,
            maxY: maxY + padding,
        };

        return { nodes, links, graphBounds };

    }, [semesterGrids]);

    if (!mindMapData) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-background-light dark:bg-background-dark/95 backdrop-blur-sm">
            <div className="flex items-center justify-between p-4 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">timeline</span>
                    Previsão de Estudos
                </h2>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Fechar"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
            <div className="flex-1 overflow-hidden relative bg-slate-50 dark:bg-slate-900/50">
                <MapaMentalVisualizacao
                    svgRef={svgRef}
                    nodes={mindMapData.nodes}
                    links={mindMapData.links}
                    selectedNodeId={selectedNodeId}
                    onNodeClick={handleNodeClick}
                    graphBounds={mindMapData.graphBounds}
                />

                {/* Legend / Info Overlay */}
                <div className="absolute bottom-4 left-4 p-4 bg-surface-light dark:bg-surface-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark max-w-xs">
                    <h3 className="font-bold text-sm mb-2">Legenda</h3>
                    <div className="flex items-center gap-2 text-xs mb-1">
                        <div className="w-3 h-3 rounded bg-blue-100 border border-blue-400"></div>
                        <span>Disciplinas Sugeridas</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 leading-tight">
                        Esta é uma sugestão baseada na sua grade e disponibilidade.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PredictionMap;
