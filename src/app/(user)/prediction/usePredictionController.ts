import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import {
    loadCompletedSubjects,
    loadDbData,
    loadCurrentEnrollments
} from '../../../services/disciplinaService';
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
                    // @ts-ignore
                    loadDbData(courseCode),
                    // @ts-ignore
                    loadCompletedSubjects(user.id),
                    // @ts-ignore
                    loadCurrentEnrollments(user.id)
                ]);

                setAllSubjects(dbSubjects);
                setCompletedSubjects(dbCompleted);
                setCurrentEnrollments(dbEnrollments);
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
            const initialState: HistoryState = {
                fixedSemesters: [],
                blacklistedIds: new Set()
            };
            setHistory([initialState]);
            setHistoryIndex(0);
        }
    }, [loading]);

    // historyIndex dependency is sufficient to re-bind listener
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


    // --- Core Logic (Memoized) ---
    const simulationResult: SimulationResult | null = useMemo(() => {
        if (loading || allSubjects.length === 0) return null;

        const availableSubjects = allSubjects.filter(s => s._id !== undefined && !blacklistedIds.has(s._id) && s._ag);

        // Only consider completed subjects for prediction, NOT current enrollments
        // This allows subjects being taken now to appear in future semester predictions
        let simulatedCompleted = [...completedSubjects];
        const finalGrid: Subject[][] = [];

        fixedSemesters.forEach(semesterSubjects => {
            finalGrid.push(semesterSubjects);
            simulatedCompleted = [...simulatedCompleted, ...semesterSubjects];
        });

        const limits = {
            electiveHours: 360,
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

    const suggestions = useMemo(() => {
        if (selectedSemesterIndex === null) return [];

        // Only consider completed subjects, NOT current enrollments
        // This ensures credit prerequisites are checked against credits BEFORE the semester starts
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

        simulationResult.semesters.forEach((subjects, index) => {
            const semesterNum = index + 1;
            const columnX = (semesterNum - 1) * COLUMN_WIDTH;

            const baseYear = 2026;
            const baseSemester = 1;

            const addedSemesters = index;
            const currentSemesterVal = baseSemester + addedSemesters;

            const yearOffset = Math.floor((currentSemesterVal - 1) / 2);
            const displayYear = baseYear + yearOffset;
            const displaySemester = ((currentSemesterVal - 1) % 2) + 1;

            const titleNode = {
                id: `period-title-${semesterNum}`,
                name: `${displayYear}.${displaySemester} Previsto`,
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
    }, [simulationResult, fixedSemesters]);


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
            const subjectREMOVE = allSubjects.find(s => s._id === subjectId);
            if (!subjectREMOVE) return;

            const isSameSubject = (a: Subject, b: Subject) => a._id === b._id;

            const securedHours = [...completedSubjects, ...currentEnrollments]
                .filter(s => (!s._el || s._category === 'ELECTIVE'))
                .reduce((acc, s) => acc + (s._workload || 0), 0);

            const remainingPoolHours = allSubjects
                .filter(s =>
                    !s._el &&
                    s._ag &&
                    !completedSubjects.some(c => isSameSubject(c, s)) &&
                    !currentEnrollments.some(e => isSameSubject(e, s)) &&
                    s._id !== undefined &&
                    !newSet.has(s._id) &&
                    s._id !== subjectId
                )
                .reduce((acc, s) => acc + (s._workload || 0), 0);

            const totalFutureCredits = securedHours + remainingPoolHours;

            if (totalFutureCredits < 360) {
                alert(`IMPOSSÍVEL REMOVER:\n\nPara formar, você precisa de 360 horas de optativas.\n\nVocê já garantiu: ${securedHours}h.\nO banco de matérias restante teria: ${remainingPoolHours}h.\nTotal Possível: ${totalFutureCredits}h.\n\nSe você excluir esta matéria, o sistema não terá opções suficientes para te formar.`);
                return;
            }

            newSet.add(subjectId);

            // Remove the blacklisted subject from all fixed semesters
            const newFixed = fixedSemesters.map(semester =>
                semester.filter(subject => subject._id !== subjectId)
            );

            setBlacklistedIds(newSet);
            pushToHistory(newFixed, newSet);
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
        if (semesterIndex === null || semesterIndex >= fixedSemesters.length) return;

        const newFixed = [...fixedSemesters];
        const currentSem = [...newFixed[semesterIndex]];

        if (!currentSem.find(s => s._id === subject._id)) {
            currentSem.push(subject);
            newFixed[semesterIndex] = currentSem;
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
        // State
        allSubjects, completedSubjects, loading,
        blacklistedIds, fixedSemesters,
        selectedSemesterIndex, selectedNodeId, isSidebarOpen,
        simulationResult, suggestions, mindMapData,
        svgRef,

        // Actions
        setIsSidebarOpen,
        setSelectedSemesterIndex,
        setSelectedNodeId,
        toggleBlacklist,
        handleEditSemester,
        handleAddSubjectToSemester,
        handleRemoveSubjectFromSemester,

        // Trial Status
        canInteract
    };
};
