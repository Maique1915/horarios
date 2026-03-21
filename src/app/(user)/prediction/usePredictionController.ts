import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import {
    loadCompletedSubjects,
    loadDbData,
    loadCurrentEnrollments,
    Enrollment
} from '../../../services/disciplinaService';
import { getCurrentPeriod } from '@/utils/dateUtils';
import { getDays, getTimeSlots } from '../../../services/scheduleService';
// @ts-ignore
import Escolhe from '../../../model/util/Escolhe';
// @ts-ignore
import Grafos from '../../../model/util/Grafos';

// --- Types ---

import { Subject } from '../../../types/Subject';
export type { Subject };

export interface ScheduleMeta {
    days: any[];
    slots: any[];
}

export interface SimulationResult {
    semesters: Subject[][];
    totalCount: number;
}

export interface HistoryState {
    fixedSemesters: Subject[][];
    blacklistedIds: Set<string | number>;
}

// --- Constants ---
export const COLUMN_WIDTH = 380;
export const ROW_HEIGHT = 110;
export const NODE_WIDTH = 300;
export const NODE_HEIGHT = 80;
export const TITLE_WIDTH = 300;
export const TITLE_HEIGHT = 40;

// --- Helper Functions ---
export const checkCollision = (subA: Subject, subB: Subject) => {
    const getSlots = (s: Subject) => {
        const slots = new Set<string>();
        if (s._classSchedules) {
            s._classSchedules.forEach((sched: any) => {
                if (sched.ho) {
                    sched.ho.forEach(([d, t]: [string, string]) => slots.add(`${d}:${t}`));
                }
            });
        }
        return slots;
    };

    const slotsA = getSlots(subA);
    const slotsB = getSlots(subB);

    for (let sa of slotsA) {
        if (slotsB.has(sa)) return true; // Collision
    }
    return false;
};

// --- Controller ---
export const usePredictionController = () => {
    const { user, loading: authLoading, isExpired } = useAuth();
    const router = useRouter();

    // Data State
    const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
    const [completedSubjects, setCompletedSubjects] = useState<Subject[]>([]);
    const [currentEnrollments, setCurrentEnrollments] = useState<Subject[]>([]);
    const [scheduleMeta, setScheduleMeta] = useState<ScheduleMeta>({ days: [], slots: [] });
    const [loading, setLoading] = useState(true);

    // User Interaction State
    const [blacklistedIds, setBlacklistedIds] = useState<Set<string | number>>(new Set());
    const [fixedSemesters, setFixedSemesters] = useState<Subject[][]>([]);

    // UI State
    const [selectedSemesterIndex, setSelectedSemesterIndex] = useState<number | null>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<string | number | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // --- Drag and Drop State ---
    const [draggedSubject, setDraggedSubject] = useState<Subject | null | undefined>(null);
    const [hoveredSemesterIndex, setHoveredSemesterIndex] = useState<number | null>(null);
    const [dragPosition, setDragPosition] = useState<{ x: number, y: number } | null>(null);
    const [invalidDropReason, setInvalidDropReason] = useState<string | null>(null);

    const svgRef = useRef<SVGSVGElement>(null);

    // History State
    const [history, setHistory] = useState<HistoryState[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const canInteract = user?.is_paid || false;

    // --- Effects ---

    // Auth Check
    useEffect(() => {
        if (!authLoading) {
            if (!user || isExpired) {
                router.push('/');
            }
        }
    }, [authLoading, user, isExpired, router]);

    // Data Loading
    useEffect(() => {
        const init = async () => {
            if (!user) return;
            try {
                const [days, slots] = await Promise.all([getDays(), getTimeSlots()]);
                setScheduleMeta({ days: days || [], slots: slots || [] });

                const courseCode = user.courses?.code || localStorage.getItem('last_active_course');
                const [dbSubjects, dbCompleted, dbEnrollments] = await Promise.all([
                    loadDbData(courseCode),
                    loadCompletedSubjects(user.id),
                    loadCurrentEnrollments(user.id)
                ]);

                const periodoAtual = getCurrentPeriod();
                const filteredEnrollments = (dbEnrollments as Enrollment[]).filter(e => e.period === periodoAtual);

                setAllSubjects(dbSubjects);
                setCompletedSubjects(dbCompleted);
                setCurrentEnrollments(filteredEnrollments);
            } catch (error) {
                console.error("Failed to load prediction data", error);
            } finally {
                setLoading(false);
            }
        };
        if (!authLoading && user) init();
    }, [user, authLoading]);

    // History Init
    useEffect(() => {
        if (!loading && history.length === 0) {
            const hasCurrentEnrollments = currentEnrollments.length > 0;
            const initialFixed = hasCurrentEnrollments ? [currentEnrollments] : [];
            
            const initialState: HistoryState = {
                fixedSemesters: initialFixed,
                blacklistedIds: new Set()
            };
            setHistory([initialState]);
            setHistoryIndex(0);
            setFixedSemesters(initialFixed);
        }
    }, [loading, currentEnrollments]);

    // Undo/Redo Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                if (e.shiftKey || e.altKey) {
                    performRedo();
                } else {
                    performUndo();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [history, historyIndex]);

    // Auto-dismiss invalid drop reason after 5 seconds
    useEffect(() => {
        if (invalidDropReason) {
            console.log('📢 Mostrando mensagem:', invalidDropReason);
            const timer = setTimeout(() => {
                console.log('⏰ Auto-fechando mensagem');
                setInvalidDropReason(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [invalidDropReason]);


    // --- Core Logic (Memoized) ---
    const simulationResult: SimulationResult | null = useMemo(() => {
        if (loading || allSubjects.length === 0) return null;

        const availableSubjects = allSubjects.filter(s => s._id !== undefined && !blacklistedIds.has(s._id) && s._ag);

        let simulatedCompleted = [...completedSubjects];
        const finalGrid: Subject[][] = [];

        fixedSemesters.forEach(semesterSubjects => {
            finalGrid.push(semesterSubjects);
            simulatedCompleted = [...simulatedCompleted, ...semesterSubjects];
        });

        const limits = {
            optionalHours: 360,
            mandatoryHours: Infinity
        };

        const prediction = Escolhe.predictCompletion(
            availableSubjects,
            simulatedCompleted,
            scheduleMeta,
            limits
        );

        return {
            semesters: [...fixedSemesters, ...prediction.semesterGrids] as Subject[][],
            totalCount: fixedSemesters.length + prediction.semestersCount
        };

    }, [allSubjects, completedSubjects, currentEnrollments, scheduleMeta, blacklistedIds, fixedSemesters, loading]);

    // --- Collision Detection during Hover ---
    const isHoverCollision = useMemo(() => {
        if (!draggedSubject || hoveredSemesterIndex === null) return false;

        const allSemesters = simulationResult?.semesters || [];
        const targetSemester = allSemesters[hoveredSemesterIndex] || [];
        
        // 1. Check Time Collision with ALL subjects in target semester
        // Exclude the dragged subject itself
        const otherSubjectsInTarget = targetSemester.filter(s => s._re !== draggedSubject._re);
        for (const s of otherSubjectsInTarget) {
            if (checkCollision(draggedSubject, s)) return true; 
        }

        // 2. Check Prerequisites / Credits for this period
        // Build list of subjects completed before hoveredSemesterIndex
        let previousCompleted = [...completedSubjects];
        for (let i = 0; i < hoveredSemesterIndex; i++) {
            previousCompleted = [...previousCompleted, ...(allSemesters[i] || [])];
        }
        // Remove the dragged subject from previous levels if it was there (internal shift)
        previousCompleted = previousCompleted.filter(s => s._re !== draggedSubject._re);

        // Verify if subject can be taken in this semester based on prerequisites
        const grafos = new Grafos(allSubjects, -1, previousCompleted);
        const candidates = grafos.matriz();
        if (!candidates.some(c => c._re === draggedSubject._re)) {
            return true; // Prerequisite or Credit lock
        }

        return false;
    }, [draggedSubject, hoveredSemesterIndex, simulationResult, allSubjects, completedSubjects]);

    const suggestions = useMemo(() => {
        if (selectedSemesterIndex === null) return [];

        let previousCompleted = [...completedSubjects];
        for (let i = 0; i < selectedSemesterIndex; i++) {
            previousCompleted = [...previousCompleted, ...fixedSemesters[i]];
        }

        const grafos = new Grafos(allSubjects, -1, previousCompleted);
        let candidates: Subject[] = grafos.matriz();

        const currentSemesterSubjects = fixedSemesters[selectedSemesterIndex] || [];
        const currentIds = new Set(currentSemesterSubjects.map(s => s._id));

        candidates = candidates.filter(s =>
            s._ag &&
            s._id !== undefined &&
            !blacklistedIds.has(s._id) &&
            !currentIds.has(s._id)
        );

        candidates = candidates.filter(candidate => {
            for (let existing of currentSemesterSubjects) {
                if (checkCollision(candidate, existing)) return false;
            }
            return true;
        });

        return candidates.sort((a, b) => {
            if (a._el !== b._el) return a._el ? -1 : 1;
            return (a._di || '').localeCompare(b._di || '');
        });

    }, [selectedSemesterIndex, fixedSemesters, allSubjects, completedSubjects, currentEnrollments, blacklistedIds]);

    const mindMapData = useMemo(() => {
        if (!simulationResult) return null;

        const nodes: any[] = [];
        const links: any[] = [];
        const nodeMap = new Map();
        
        const periodoAtual = getCurrentPeriod();
        const [currentYearStr, currentSemStr] = periodoAtual.split('.');
        const baseYear = parseInt(currentYearStr);
        const baseSemester = parseInt(currentSemStr);
        const hasCurrentEnrollments = currentEnrollments.length > 0;

        simulationResult.semesters.forEach((subjects, index) => {
            const semesterNum = index + 1;
            const columnX = (semesterNum - 1) * COLUMN_WIDTH;

            const firstIsCurrentPeriod = hasCurrentEnrollments && index === 0;

            let displayYear: number;
            let displaySemester: number;
            let labelSuffix = 'Previsto';

            if (firstIsCurrentPeriod) {
                displayYear = baseYear;
                displaySemester = baseSemester;
                labelSuffix = 'Atual';
            } else {
                const addedSemesters = hasCurrentEnrollments ? index : index + 1;
                const futureSemesterVal = baseSemester + addedSemesters;
                const yearOffset = Math.floor((futureSemesterVal - 1) / 2);
                displayYear = baseYear + yearOffset;
                displaySemester = ((futureSemesterVal - 1) % 2) + 1;
            }

            const titleNode = {
                id: `period-title-${semesterNum}`,
                name: `${displayYear}.${displaySemester} ${labelSuffix}`,
                type: 'title',
                x: columnX + (NODE_WIDTH / 2),
                y: -100,
                width: TITLE_WIDTH,
                height: TITLE_HEIGHT,
                depth: semesterNum,
                isFixed: index < fixedSemesters.length,
                onEdit: canInteract ? () => handleEditSemester(index) : null
            };
            nodes.push(titleNode);

            subjects.forEach((subject, subIndex) => {
                const node = {
                    ...subject,
                    id: subject._re || `sub-${subIndex}`,
                    name: subject._di,
                    type: 'subject',
                    status: 'podeFazer',
                    x: columnX,
                    y: subIndex * ROW_HEIGHT,
                    width: NODE_WIDTH,
                    height: NODE_HEIGHT,
                    depth: semesterNum,
                };
                nodes.push(node);
                nodeMap.set(node.id, node);
                if (subject._re) nodeMap.set(subject._re, node);
            });
        });

        nodes.forEach(node => {
            if (node.type === 'subject' && node._pr) {
                const prerequisites = Array.isArray(node._pr) ? node._pr : [node._pr];
                prerequisites.forEach((prereq: string) => {
                    const sourceNode = nodeMap.get(prereq);
                    if (sourceNode) {
                        links.push({
                            source: sourceNode,
                            target: node,
                            id: `${sourceNode.id}-${node.id}`
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
        if (minX === Infinity) { minX = 0; maxX = 100; minY = 0; maxY = 100; }
        const padding = 300;
        const graphBounds = { minX: minX - padding, minY: minY - padding, maxX: maxX + padding, maxY: maxY + padding };

        return { nodes, links, graphBounds };
    }, [simulationResult, fixedSemesters, currentEnrollments, canInteract]);


    // --- Actions ---

    const pushToHistory = (newFixed: Subject[][], newBlacklisted: Set<string | number>) => {
        const newState: HistoryState = {
            fixedSemesters: newFixed,
            blacklistedIds: newBlacklisted
        };
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newState);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const performUndo = () => {
        if (historyIndex > 0) {
            const prevIndex = historyIndex - 1;
            const prevState = history[prevIndex];
            setFixedSemesters(prevState.fixedSemesters);
            setBlacklistedIds(prevState.blacklistedIds);
            setHistoryIndex(prevIndex);
        }
    };

    const performRedo = () => {
        if (historyIndex < history.length - 1) {
            const nextIndex = historyIndex + 1;
            const nextState = history[nextIndex];
            setFixedSemesters(nextState.fixedSemesters);
            setBlacklistedIds(nextState.blacklistedIds);
            setHistoryIndex(nextIndex);
        }
    };

    const toggleBlacklist = (subjectId: string | number) => {
        const newSet = new Set(blacklistedIds);
        if (newSet.has(subjectId)) {
            newSet.delete(subjectId);
            setBlacklistedIds(newSet);
            pushToHistory(fixedSemesters, newSet);
        } else {
            const subjectToRemove = allSubjects.find(s => s._id === subjectId);
            if (!subjectToRemove) return;

            const isSameSubject = (a: Subject, b: Subject) => a._id === b._id;
            const completedOptionalHours = completedSubjects
                .filter(s => s._el || s._category === 'OPTIONAL')
                .reduce((acc, s) => acc + (s._workload || 0), 0);
            const currentOptionalHours = currentEnrollments
                .filter(s => s._el || s._category === 'OPTIONAL')
                .reduce((acc, s) => acc + (s._workload || 0), 0);
            const availablePoolHours = allSubjects
                .filter(s =>
                    (s._el || s._category === 'OPTIONAL') && 
                    s._ag && 
                    !completedSubjects.some(c => isSameSubject(c, s)) && 
                    !currentEnrollments.some(e => isSameSubject(e, s)) && 
                    s._id !== undefined &&
                    !newSet.has(s._id) && 
                    s._id !== subjectId 
                )
                .reduce((acc, s) => acc + (s._workload || 0), 0);

            const totalPossibleHours = completedOptionalHours + currentOptionalHours + availablePoolHours;
            if (totalPossibleHours < 360) {
                alert(`IMPOSSÍVEL REMOVER: Pelo menos 360h de optativas são necessárias.`);
                return;
            }
            newSet.add(subjectId);
            const newFixed = fixedSemesters.map(semester => semester.filter(subject => subject._id !== subjectId));
            setBlacklistedIds(newSet);
            pushToHistory(newFixed, newSet);
        }
    };

    const handleDragStart = (subject: Subject, initialPos: { x: number, y: number }) => {
        // TODO: Reativar após testes
        // if (!canInteract) return;
        console.log('🔴 handleDragStart called:', { subject: subject._di, subject_re: subject._re, subject_id: subject._id });
        
        // Buscar o subject completo em allSubjects para ter todos os dados (_pr, _pr_creditos_input, etc)
        const fullSubject = allSubjects.find(s => 
            s._id === subject._id || s._re === subject._re || s._id === subject.id
        ) || subject;
        
        console.log('📦 Full subject loaded:', { 
            _di: fullSubject._di, 
            _pr: fullSubject._pr,
            _pr_creditos_input: fullSubject._pr_creditos_input
        });
        
        setDraggedSubject(fullSubject);
        setDragPosition(initialPos);
    };

    // Função auxiliar para calcular créditos até um semestre específico
    // semesterIndex: 0 = 2026.1, 1 = 2026.2, etc.
    // IMPORTANTE: fixedSemesters[0] = 2026.1 (sempre contém currentEnrollments)
    //             fixedSemesters[1] = 2026.2, etc.
    //             simulationResult.semesters começa de 2026.2
    const calculateCreditsUntilSemester = (semesterIndex: number): { total: number; breakdown: string } => {
        let totalCR = 0;
        let breakdown = '';
        
        // 1. Matérias já completadas
        const completedCR = completedSubjects.reduce((total, s) => total + ((s._ap || 0) + (s._at || 0)), 0);
        totalCR += completedCR;
        breakdown += `✓ Completadas: ${completedCR} créditos\n`;
        
        // 2-N. Semestres do fixedSemesters (começa de 0 = 2026.1, para ANTES de semesterIndex)
        for (let i = 0; i < semesterIndex && i < fixedSemesters.length; i++) {
            const semCR = fixedSemesters[i].reduce((total, s) => total + ((s._ap || 0) + (s._at || 0)), 0);
            const semName = i === 0 ? '2026.1' : `2026.${i + 1}`;
            totalCR += semCR;
            breakdown += `✓ ${semName}: ${semCR} (${fixedSemesters[i].map(s => `${s._re}`).join(', ')})\n`;
        }
        
        // Semestres previstos (só aparecem se há espaço após fixedSemesters)
        const allSemesters = simulationResult?.semesters || [];
        for (let i = fixedSemesters.length; i < semesterIndex && i < allSemesters.length; i++) {
            const semCR = allSemesters[i].reduce((total, s) => total + ((s._ap || 0) + (s._at || 0)), 0);
            const semName = `2026.${i + 2}`;  // simulationResult[0] = 2026.2
            totalCR += semCR;
            breakdown += `✓ ${semName}: ${semCR} (${allSemesters[i].map(s => `${s._re}`).join(', ')})\n`;
        }
        
        return { total: totalCR, breakdown };
    };

    // Função para detalhar o motivo específico da colisão
    const getDetailedCollisionReason = (subject: Subject, semesterIndex: number): string | null => {
        console.log(`🔎 Analisando motivo da colisão para ${subject._di} no semestre ${semesterIndex}`);
        
        // 1. VERIFICAR COLISÃO DE HORÁRIO
        // Precisamos saber que semestres teriam matérias neste índice
        // fixedSemesters[semesterIndex] ou simulationResult.semesters[semesterIndex - fixedSemesters.length]
        let targetSemester: Subject[] = [];
        if (semesterIndex < fixedSemesters.length) {
            targetSemester = fixedSemesters[semesterIndex];
        } else {
            const predIndex = semesterIndex - fixedSemesters.length;
            targetSemester = (simulationResult?.semesters || [])[predIndex] || [];
        }
        
        for (const otherSubject of targetSemester.filter(s => s._re !== subject._re)) {
            if (checkCollision(subject, otherSubject)) {
                const reason = `⏰ Colisão de horário: ${subject._di} choca com ${otherSubject._di}`;
                console.log(`  → ${reason}`);
                return reason;
            }
        }
        
        // 2. VERIFICAR FALTA DE CRÉDITOS
        const { total: totalCR, breakdown } = calculateCreditsUntilSemester(semesterIndex);
        console.log(`💰 Breakdown de créditos:\n${breakdown}`);
        
        if (subject._pr_creditos_input && subject._pr_creditos_input > 0) {
            if (totalCR < subject._pr_creditos_input) {
                const reason = `💰 Falta de créditos: ${subject._di} precisa de ${subject._pr_creditos_input} créditos (você terá ${totalCR})`;
                console.log(`  → ${reason}`);
                return reason;
            }
        }
        
        // 3. VERIFICAR FALTA DE PRÉ-REQUISITOS
        // Recalcular quais matérias estarão completas até este semestre
        let semesterCompleted = [
            ...completedSubjects
        ];
        
        // Adicionar semestres fixos até o semestre destino
        for (let i = 0; i < semesterIndex && i < fixedSemesters.length; i++) {
            semesterCompleted = [...semesterCompleted, ...fixedSemesters[i]];
        }
        
        // Adicionar semestres previstos até o semestre destino
        const allSemesters = simulationResult?.semesters || [];
        for (let i = fixedSemesters.length; i < semesterIndex && i < allSemesters.length; i++) {
            semesterCompleted = [...semesterCompleted, ...allSemesters[i]];
        }
        
        const prList = Array.isArray(subject._pr) ? subject._pr : (subject._pr ? [subject._pr] : []);
        for (const pr of prList) {
            const prStr = String(pr);
            const isNumeric = !isNaN(Number(prStr)) && !isNaN(parseFloat(prStr));
            
            if (!isNumeric) {
                // É uma disciplina pré-requisita
                const hasPrereq = semesterCompleted.some(s => s._re === prStr);
                if (!hasPrereq) {
                    const prereqSubject = allSubjects.find(s => s._re === prStr);
                    const prereqName = prereqSubject?._di || prStr;
                    const reason = `📚 Falta pré-requisito: ${subject._di} precisa ter cursado ${prereqName}`;
                    console.log(`  → ${reason}`);
                    return reason;
                }
            }
        }
        
        // 4. SEM RESTRIÇÃO
        console.log(`  → ✅ Nenhuma restrição detectada`);
        return null;
    };

    const handleDragMove = (pos: { x: number, y: number }, semesterIndex: number | null) => {
        if (!draggedSubject) return;
        console.log('🟢 handleDragMove:', { semesterIndex, collision: isHoverCollision });
        setDragPosition(pos);
        setHoveredSemesterIndex(semesterIndex);
    };

    const handleDragEnd = () => {
        console.log('🔵 handleDragEnd:', { 
            draggedSubject: draggedSubject?._di, 
            hoveredSemester: hoveredSemesterIndex, 
            collision: isHoverCollision 
        });
        
        if (!draggedSubject || hoveredSemesterIndex === null) {
            console.log('❌ Sem subject ou semester');
            setDraggedSubject(null);
            setHoveredSemesterIndex(null);
            setDragPosition(null);
            setInvalidDropReason(null);
            return;
        }

        // 1. PRIMEIRO: Verificar colisão de horário (tem PRIORIDADE)
        if (isHoverCollision) {
            console.log('🔴 BLOQUEADO: Colisão de horário detectada');
            
            // Usar função detalhada para encontrar o motivo específico
            const reason = getDetailedCollisionReason(draggedSubject, hoveredSemesterIndex);
            console.log('💥 Motivo específico:', reason);
            
            setInvalidDropReason(reason || '❌ Colisão detectada');
            setDraggedSubject(null);
            setHoveredSemesterIndex(null);
            setDragPosition(null);
            
            return; // SEMPRE retorna quando há colisão
        }
        
        // 2. SEGUNDO: Verificar pré-requisitos
        const reason = getDetailedCollisionReason(draggedSubject, hoveredSemesterIndex);
        
        if (reason) {
            // Há restrição de pré-requisitos, créditos ou outro motivo
            console.log('❌ Motivo:', reason);
            setInvalidDropReason(reason);
            setDraggedSubject(null);
            setHoveredSemesterIndex(null);
            setDragPosition(null);
        } else {
            // ✅ Nenhuma restrição - PODE SOLTAR
            console.log('✅ Sem colisão ou pré-requisitos, tentando mover...');
            console.log('📊 fixedSemesters antes:', fixedSemesters.map((sem, idx) => `${idx}: [${sem.map(s => s._re).join(', ')}]`));
            
            // Procurar em TODOS os semestres (fixedSemesters + simulados)
            let originalSemIndex = -1;
            let isFromFixed = false;
            
            // Primeiro procurar em fixedSemesters
            originalSemIndex = fixedSemesters.findIndex(sem => 
                sem.some(s => s._re === draggedSubject._re || s._id === draggedSubject._id)
            );
            
            if (originalSemIndex >= 0) {
                isFromFixed = true;
            } else {
                // Se não achou em fixed, procurar em simulationResult
                originalSemIndex = simulationResult?.semesters.findIndex(sem => 
                    sem.some(s => s._re === draggedSubject._re || s._id === draggedSubject._id)
                ) ?? -1;
            }
            
            console.log(`🔍 Procurando ${draggedSubject._re} (${draggedSubject._di})...`);
            console.log(`📍 Encontrado em semestre: ${originalSemIndex} (isFromFixed: ${isFromFixed})`);
            console.log(`📍 Destino: semestre ${hoveredSemesterIndex}`);

            if (originalSemIndex >= 0 && originalSemIndex !== hoveredSemesterIndex) {
                 console.log('✅ Movendo matéria!');
                 
                 // Sempre trabalhar com fixedSemesters
                 const newFixed = fixedSemesters.map((sem, idx) => {
                     if (idx === originalSemIndex && isFromFixed) {
                         // Remove do semestre original em fixed
                         return sem.filter(s => s._re !== draggedSubject._re && s._id !== draggedSubject._id);
                     }
                     return sem;
                 });
                 
                 // Adiciona ao semestre destino
                 while (newFixed.length <= hoveredSemesterIndex!) {
                     newFixed.push([]);
                 }
                 newFixed[hoveredSemesterIndex!] = [...newFixed[hoveredSemesterIndex!], draggedSubject];
                 
                 console.log('📊 fixedSemesters depois:', newFixed.map((sem, idx) => `${idx}: [${sem.map(s => s._re).join(', ')}]`));
                 
                 setFixedSemesters(newFixed);
                 pushToHistory(newFixed, blacklistedIds);
                 setInvalidDropReason(null);
            } else if (originalSemIndex === hoveredSemesterIndex) {
                 console.log('⚠️ Mesmo semestre, ignorando');
                 setInvalidDropReason(null);
            } else {
                 console.log('⚠️ Matéria não encontrada em nenhum semestre');
                 setInvalidDropReason(null);
            }
            
            setDraggedSubject(null);
            setHoveredSemesterIndex(null);
            setDragPosition(null);
        }
    };

    const handleEditSemester = (index: number) => {
        if (index >= fixedSemesters.length) {
            const newFixed = [...fixedSemesters];
            for (let i = fixedSemesters.length; i <= index; i++) {
                if (simulationResult && simulationResult.semesters[i]) {
                    newFixed.push(simulationResult.semesters[i]);
                }
            }
            setFixedSemesters(newFixed);
            pushToHistory(newFixed, blacklistedIds);
        }
        setSelectedSemesterIndex(index);
    };

    const handleAddSubjectToSemester = (subject: Subject, semesterIndex: number | null) => {
        if (semesterIndex === null) return;
        const newFixed = [...fixedSemesters];
        while (newFixed.length <= semesterIndex) newFixed.push([]);
        if (!newFixed[semesterIndex].find(s => s._id === subject._id)) {
            newFixed[semesterIndex] = [...newFixed[semesterIndex], subject];
            setFixedSemesters(newFixed);
            pushToHistory(newFixed, blacklistedIds);
        }
    };

    const handleRemoveSubjectFromSemester = (subjectId: string | number, semesterIndex: number | null) => {
        if (semesterIndex === null || semesterIndex >= fixedSemesters.length) return;
        const newFixed = [...fixedSemesters];
        newFixed[semesterIndex] = newFixed[semesterIndex].filter(s => s._id !== subjectId);
        setFixedSemesters(newFixed);
        pushToHistory(newFixed, blacklistedIds);
    };

    return {
        allSubjects, completedSubjects, loading,
        blacklistedIds, fixedSemesters,
        selectedSemesterIndex, selectedNodeId, isSidebarOpen,
        simulationResult, suggestions, mindMapData,
        svgRef,
        
        // DnD
        draggedSubject, hoveredSemesterIndex, dragPosition, isHoverCollision, invalidDropReason,
        handleDragStart, handleDragMove, handleDragEnd,

        setIsSidebarOpen, setSelectedSemesterIndex, setSelectedNodeId, setInvalidDropReason,
        toggleBlacklist, handleEditSemester, handleAddSubjectToSemester, handleRemoveSubjectFromSemester,
        canInteract
    };
};
