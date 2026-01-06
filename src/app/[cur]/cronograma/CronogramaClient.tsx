'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import MapaMentalVisualizacao from '../../../components/prediction/MapaMentalVisualizacao';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import { loadDbData } from '../../../services/disciplinaService';
import { Subject } from '../../../types/Subject';

// --- Constants ---
const COLUMN_WIDTH = 380;
const ROW_HEIGHT = 110;
const NODE_WIDTH = 300;
const NODE_HEIGHT = 80;
const TITLE_WIDTH = 300;
const TITLE_HEIGHT = 40;

// --- Controller ---
const useCronogramaController = () => {
    const params = useParams();
    const router = useRouter();
    const rawCur = params?.cur;
    const cur = (Array.isArray(rawCur) ? rawCur[0] : rawCur) || 'engcomp';

    const [mindMapData, setMindMapData] = useState<any>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const handleNodeClick = useCallback((nodeId: string) => {
        setSelectedNodeId(prevId => (prevId === nodeId ? null : nodeId));
    }, []);

    const processarDadosParaMapa = useCallback((disciplinasDoCurso: Subject[], currentSubjectStatus?: { feitas: string[], podeFazer: string[] }) => {
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

        const nodes: any[] = [];
        const sortedPeriods = Array.from(periodosMap.keys()).sort((a: any, b: any) => a - b);

        sortedPeriods.forEach((periodo: any) => {
            const disciplinasNoPeriodo = periodosMap.get(periodo);
            const columnX = (periodo - 1) * COLUMN_WIDTH;

            // Add Period Title Node
            nodes.push({
                id: `period-title-${periodo}`,
                name: `${periodo}º Período`,
                type: 'title',
                x: columnX + (NODE_WIDTH / 2),
                y: -100,
                width: TITLE_WIDTH,
                height: TITLE_HEIGHT,
                depth: periodo,
            });

            // Add Subject Nodes
            disciplinasNoPeriodo.forEach((re: string, index: number) => {
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

        const links: any[] = [];
        const subjectNodes = nodes.filter(n => n.type === 'subject');
        subjectNodes.forEach(targetNode => {
            if (targetNode._pr) {
                targetNode._pr.forEach((prereq_re: string) => {
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

        const padding = 300;
        const graphBounds = {
            minX: minX - padding,
            minY: minY - padding,
            maxX: maxX + padding,
            maxY: maxY + padding,
        };

        return { nodes, links, graphBounds };
    }, []);

    const { data: dbData = [], isLoading } = useQuery({
        queryKey: ['subjects', cur],
        queryFn: () => loadDbData(cur),
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
        enabled: !!cur,
    });

    const subjectStatus = undefined;

    useEffect(() => {
        if (dbData.length > 0) {
            const data = processarDadosParaMapa(dbData, subjectStatus);
            setMindMapData(data);
        }
    }, [dbData, processarDadosParaMapa, subjectStatus]);

    const handleVoltar = () => router.back();

    return {
        cur,
        mindMapData,
        selectedNodeId,
        svgRef,
        handleNodeClick,
        handleVoltar,
        loading: isLoading
    };
};

// --- Views ---

const LoadingView = () => (
    <div className="pt-20">
        <LoadingSpinner message="Carregando mapa mental..." />
    </div>
);

const EmptyView = () => (
    <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center text-text-light-secondary dark:text-text-dark-secondary">
            Não há dados para exibir o mapa mental deste curso.
        </div>
    </div>
);

const CronogramaView = ({ ctrl }: { ctrl: ReturnType<typeof useCronogramaController> }) => {
    if (ctrl.loading) return <LoadingView />;

    if (!ctrl.mindMapData || ctrl.mindMapData.nodes.length === 0) {
        return <EmptyView />;
    }

    return (
        <div className="flex flex-col p-4 mx-auto">
            <div className="flex w-full lg:flex-row sm:flex-col lg:justify-between sm:justify-center sm:align-center sm:gap-3 lg:gap-4">
                <h1 className="text-2xl dark:text-text-dark-primary font-bold">Mapa de Pré-requisitos - {ctrl.cur}</h1>
                <div className="flex flex-wrap gap-2 justify-right sm:justify-center lg:justify-end items-center">
                    <button
                        onClick={ctrl.handleVoltar}
                        className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                        Voltar
                    </button>
                </div>
            </div>
            <MapaMentalVisualizacao
                svgRef={ctrl.svgRef}
                nodes={ctrl.mindMapData.nodes}
                links={ctrl.mindMapData.links}
                selectedNodeId={ctrl.selectedNodeId}
                onNodeClick={ctrl.handleNodeClick}
                graphBounds={ctrl.mindMapData.graphBounds}
            />
        </div>
    );
};

const CronogramaPageWithController = () => {
    const ctrl = useCronogramaController();
    return <CronogramaView ctrl={ctrl} />;
};

export default function CronogramaClient() {
    return (
        <Suspense fallback={<LoadingSpinner message="Carregando..." />}>
            <CronogramaPageWithController />
        </Suspense>
    );
}
