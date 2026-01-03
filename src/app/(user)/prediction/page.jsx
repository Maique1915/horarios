'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import {
    loadCompletedSubjects,
    loadDbData,
    loadCurrentEnrollments
} from '../../../services/disciplinaService';
import { getDays, getTimeSlots } from '../../../services/scheduleService';
import Escolhe from '../../../model/util/Escolhe';
import Grafos from '../../../model/util/Grafos';
import LoadingSpinner from '../../../components/LoadingSpinner';
import MapaMentalVisualizacao from '../../../components/MapaMentalVisualizacao';

// Reusing layout constants
const COLUMN_WIDTH = 380;
const ROW_HEIGHT = 110;
const NODE_WIDTH = 300;
const NODE_HEIGHT = 80;
const TITLE_WIDTH = 300;
const TITLE_HEIGHT = 40;

// Helper to check collision between two subjects
const checkCollision = (subA, subB) => {
    const getSlots = (s) => {
        const slots = new Set();
        if (s._classSchedules) {
            s._classSchedules.forEach(sched => {
                sched.ho.forEach(([d, t]) => slots.add(`${d}:${t}`));
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

const PredictionPage = () => {
    const { user, isAuthenticated, loading: authLoading } = useAuth();

    // --- Data State ---
    const [allSubjects, setAllSubjects] = useState([]);
    const [completedSubjects, setCompletedSubjects] = useState([]);
    const [currentEnrollments, setCurrentEnrollments] = useState([]);
    const [scheduleMeta, setScheduleMeta] = useState({ days: [], slots: [] });
    const [loading, setLoading] = useState(true);

    // --- User Interaction State ---
    const [blacklistedIds, setBlacklistedIds] = useState(new Set());
    const [fixedSemesters, setFixedSemesters] = useState([]); // Array of arrays of subjects
    // fixedSemesters[0] = subjects for "Next Semester 1"
    // fixedSemesters[1] = subjects for "Next Semester 2" etc.

    // UI State
    const [selectedSemesterIndex, setSelectedSemesterIndex] = useState(null); // For editing
    const [selectedNodeId, setSelectedNodeId] = useState(null); // For visualization highlighting
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const svgRef = useRef(null);

    // --- Initialization ---
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


    // --- Prediction Core Logic ---
    const simulationResult = useMemo(() => {
        if (loading || allSubjects.length === 0) return null;

        // 1. Filter Available Subjects (Exclude Blacklisted & Completed & Inactive)
        // Note: Completed are filtered by Grafos inside predictCompletion, but we must exclude blacklisted.
        const availableSubjects = allSubjects.filter(s => !blacklistedIds.has(s._id) && s._ag);

        // 2. Determine Starting Point
        // We need to account for 'fixedSemesters'. 
        // The prediction should run *after* the last fixed semester.
        // We must accumulate 'fixed' subjects into 'completed' for the purpose of the NEXT prediction step.

        let simulatedCompleted = [...completedSubjects, ...currentEnrollments];
        const finalGrid = [];

        // Add fixed semesters to the final grid and to the completed list for subsequent prediction
        fixedSemesters.forEach(semesterSubjects => {
            finalGrid.push(semesterSubjects);
            simulatedCompleted = [...simulatedCompleted, ...semesterSubjects];
        });

        // 3. Run Prediction for remaining semesters
        // We only predict if we haven't reached a graduation state? 
        // Escolhe.predictCompletion handles the loop.

        // Limits (20 credits * 18 hours = 360 hours)
        const limits = {
            electiveHours: 360,
            mandatoryHours: Infinity // Ensure all mandatory are included
        };

        const prediction = Escolhe.predictCompletion(
            availableSubjects,
            simulatedCompleted,
            scheduleMeta,
            limits
        );

        // Combine Fixed + Predicted
        return {
            semesters: [...fixedSemesters, ...prediction.semesterGrids],
            totalCount: fixedSemesters.length + prediction.semestersCount
        };

    }, [allSubjects, completedSubjects, currentEnrollments, scheduleMeta, blacklistedIds, fixedSemesters, loading]);

    // --- Suggestions Calculation ---
    const suggestions = useMemo(() => {
        if (selectedSemesterIndex === null) return [];

        // 1. Determine what's completed BEFORE this semester
        let previousCompleted = [...completedSubjects, ...currentEnrollments];
        for (let i = 0; i < selectedSemesterIndex; i++) {
            previousCompleted = [...previousCompleted, ...fixedSemesters[i]];
        }

        // 2. Grafos to find candidates
        const grafos = new Grafos(allSubjects, -1, previousCompleted);
        let candidates = grafos.matriz();

        // 3. Filter Candidates
        const currentSemesterSubjects = fixedSemesters[selectedSemesterIndex] || [];
        const currentIds = new Set(currentSemesterSubjects.map(s => s._id));

        candidates = candidates.filter(s =>
            s._ag &&
            !blacklistedIds.has(s._id) &&
            !currentIds.has(s._id)
        );

        // 4. Collision Check against CURRENT semester subjects
        candidates = candidates.filter(candidate => {
            for (let existing of currentSemesterSubjects) {
                if (checkCollision(candidate, existing)) return false;
            }
            return true;
        });

        return candidates.sort((a, b) => {
            if (a._el !== b._el) return a._el ? -1 : 1;
            return a._di.localeCompare(b._di);
        });

    }, [selectedSemesterIndex, fixedSemesters, allSubjects, completedSubjects, currentEnrollments, blacklistedIds]);


    // --- History / Undo-Redo State ---
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Initial History Setup
    useEffect(() => {
        if (!loading && history.length === 0) {
            // Initial state snapshot
            const initialState = {
                fixedSemesters: [],
                blacklistedIds: new Set()
            };
            setHistory([initialState]);
            setHistoryIndex(0);
        }
    }, [loading]);

    // Helper to add new state to history
    const pushToHistory = (newFixed, newBlacklisted) => {
        const newState = {
            fixedSemesters: newFixed,
            blacklistedIds: newBlacklisted
        };

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newState);

        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    // Undo/Redo Actions
    const performUndo = () => {
        if (historyIndex > 0) {
            const prevIndex = historyIndex - 1;
            const prevState = history[prevIndex];

            // Restore state
            setFixedSemesters(prevState.fixedSemesters);
            setBlacklistedIds(prevState.blacklistedIds);

            setHistoryIndex(prevIndex);
        }
    };

    const performRedo = () => {
        if (historyIndex < history.length - 1) {
            const nextIndex = historyIndex + 1;
            const nextState = history[nextIndex];

            // Restore state
            setFixedSemesters(nextState.fixedSemesters);
            setBlacklistedIds(nextState.blacklistedIds);

            setHistoryIndex(nextIndex);
        }
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
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


    // --- Handlers ---

    const toggleBlacklist = (subjectId) => {
        const newSet = new Set(blacklistedIds);

        if (newSet.has(subjectId)) {
            // Un-blacklist (Re-include): Always allowed
            newSet.delete(subjectId);
            setBlacklistedIds(newSet);
            pushToHistory(fixedSemesters, newSet);
        } else {
            // Blacklist (Exclude): Check minimum requirements
            const subjectREMOVE = allSubjects.find(s => s._id === subjectId);
            if (!subjectREMOVE) return;

            // Helper to check identity strictly (ID match)
            const isSameSubject = (a, b) => a._id === b._id;

            // 1. Hours from Completed/Enrolled Electives (SECURED)
            const securedHours = [...completedSubjects, ...currentEnrollments]
                .filter(s => (!s._el || s._category === 'ELECTIVE'))
                .reduce((acc, s) => acc + (s._workload || 0), 0);

            // 2. Hours from AVAILABLE POOL (Active, Not Completed, Not Enrolled, Not Blacklisted)
            // AND check what happens if we remove THIS one.
            const remainingPoolHours = allSubjects
                .filter(s =>
                    !s._el && // Elective
                    s._ag &&  // Active
                    !completedSubjects.some(c => isSameSubject(c, s)) && // Not completed
                    !currentEnrollments.some(e => isSameSubject(e, s)) && // Not enrolled
                    !newSet.has(s._id) && // Not currently blacklisted
                    s._id !== subjectId // The one we are trying to blacklist
                )
                .reduce((acc, s) => acc + (s._workload || 0), 0);

            const totalFutureCredits = securedHours + remainingPoolHours;

            // Limit: 20 credits * 18 = 360 hours
            if (totalFutureCredits < 360) {
                alert(`IMPOSSÍVEL REMOVER:\n\nPara formar, você precisa de 360 horas de optativas.\n\nVocê já garantiu: ${securedHours}h.\nO banco de matérias restante teria: ${remainingPoolHours}h.\nTotal Possível: ${totalFutureCredits}h.\n\nSe você excluir esta matéria, o sistema não terá opções suficientes para te formar.`);
                return;
            }

            newSet.add(subjectId);
            setBlacklistedIds(newSet);
            pushToHistory(fixedSemesters, newSet);
        }
    };

    const handleEditSemester = (index) => {
        // If we edit a semester that is "Predicted" (not fixed yet),
        // we must "Fix" it and all previous ones? 
        // Strategy: 
        // If I click "Edit" on Semester index 2 (which is predicted),
        // I should convert Semesters 0, 1, 2 into 'FixedSemesters'.

        if (index >= fixedSemesters.length) {
            // It's a predicted semester.
            // Take the predicted subjects up to this index and freeze them.
            const newFixed = [...fixedSemesters];
            for (let i = fixedSemesters.length; i <= index; i++) {
                // Get from simulationResult (which contains both fixed and predicted)
                // But we need to separate them.
                // Actually simulationResult.semesters has everything consolidated.
                newFixed.push(simulationResult.semesters[i]);
            }
            setFixedSemesters(newFixed);
            pushToHistory(newFixed, blacklistedIds);
        }
        setSelectedSemesterIndex(index);
    };

    const handleAddSubjectToSemester = (subject, semesterIndex) => {
        // Add subject to fixedSemesters[semesterIndex]
        if (semesterIndex === null || semesterIndex >= fixedSemesters.length) return;

        const newFixed = [...fixedSemesters];
        const currentSem = [...newFixed[semesterIndex]];

        // Prevent duplicates
        if (!currentSem.find(s => s._id === subject._id)) {
            currentSem.push(subject);
            newFixed[semesterIndex] = currentSem;
            setFixedSemesters(newFixed);
            pushToHistory(newFixed, blacklistedIds);
        }
    };

    const handleRemoveSubjectFromSemester = (subjectId, semesterIndex) => {
        if (semesterIndex === null || semesterIndex >= fixedSemesters.length) return;

        const newFixed = [...fixedSemesters];
        newFixed[semesterIndex] = newFixed[semesterIndex].filter(s => s._id !== subjectId);
        setFixedSemesters(newFixed);
        pushToHistory(newFixed, blacklistedIds);
    };

    // --- Visualization Data Preparation ---
    const mindMapData = useMemo(() => {
        if (!simulationResult) return null;

        const nodes = [];
        const links = [];
        const nodeMap = new Map();

        simulationResult.semesters.forEach((subjects, index) => {
            const semesterNum = index + 1;
            const columnX = (semesterNum - 1) * COLUMN_WIDTH;

            // Title Node
            const baseYear = 2026;
            const baseSemester = 1; // Assuming starting from first semester of 2026

            // Calculate current semester based on index
            // index 0 -> 0 sem added -> 2026.1
            // index 1 -> 1 sem added -> 2026.2
            // index 2 -> 2 sem added -> 2027.1
            const addedSemesters = index;
            const currentSemesterVal = baseSemester + addedSemesters;

            // If starting at .1: 
            // 0 -> 1 -> .1
            // 1 -> 2 -> .2
            // 2 -> 3 -> .1 (+1 year)
            // 3 -> 4 -> .2 (+1 year)

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
                onEdit: () => handleEditSemester(index)
            };
            nodes.push(titleNode);

            // Subject Nodes
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

        // Generate Links
        nodes.forEach(node => {
            if (node.type === 'subject' && node._pr) {
                const prerequisites = Array.isArray(node._pr) ? node._pr : [node._pr];
                prerequisites.forEach(prereq => {
                    const sourceNode = nodeMap.get(prereq);
                    if (sourceNode) {
                        links.push({
                            source: sourceNode, // MUST BE OBJECT
                            target: node,       // MUST BE OBJECT
                            id: `${sourceNode.id}-${node.id}`
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
        if (minX === Infinity) { minX = 0; maxX = 100; minY = 0; maxY = 100; }
        const padding = 300;
        const graphBounds = { minX: minX - padding, minY: minY - padding, maxX: maxX + padding, maxY: maxY + padding };

        return { nodes, links, graphBounds };
    }, [simulationResult, fixedSemesters]);


    if (loading) return <LoadingSpinner message="Inicializando simulador..." />;

    // Group electives for sidebar
    const electives = allSubjects.filter(s => !s._el && s._ag).sort((a, b) => a._di.localeCompare(b._di));

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background-light dark:bg-background-dark">
            {/* Sidebar Controls */}
            <div className={`flex flex-col border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark transition-all duration-300 ${isSidebarOpen ? 'w-80' : 'w-0 overflow-hidden'}`}>
                <div className="p-4 border-b border-border-light dark:border-border-dark flex justify-between items-center">
                    <h2 className="font-bold text-lg text-text-light-primary dark:text-text-dark-primary">Controles</h2>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {selectedSemesterIndex !== null ? (
                        /* EDIT MODE: Show Suggestions */
                        <div className="space-y-4">
                            <div className="mb-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                                <h3 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base">edit</span>
                                    Editando {selectedSemesterIndex + 1}º Semestre
                                </h3>
                                <p className="text-xs text-slate-500 mb-3">
                                    Adicione matérias sugeridas abaixo. Elas não têm choque de horário com as já adicionadas.
                                </p>
                                <button
                                    onClick={() => setSelectedSemesterIndex(null)}
                                    className="w-full py-1.5 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    Concluir Edição
                                </button>
                            </div>

                            {/* Selected Subjects List */}
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 block">
                                    Matérias Selecionadas
                                </h3>
                                <div className="space-y-1 mb-6">
                                    {(fixedSemesters[selectedSemesterIndex] || []).map(subject => (
                                        <div key={subject._id} className="flex items-center justify-between group p-2 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20">
                                            <div className="flex-1 min-w-0 mr-2">
                                                <div className="truncate text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2" title={subject._di}>
                                                    {subject._di}
                                                </div>
                                                <div className="text-[10px] text-slate-400 dark:text-slate-500">
                                                    {(subject._ap || 0) + (subject._at || 0)} cr • {subject._workload}h
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveSubjectFromSemester(subject._id, selectedSemesterIndex)}
                                                className="w-6 h-6 rounded flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                title="Remover do semestre"
                                            >
                                                <span className="material-symbols-outlined text-base">remove_circle</span>
                                            </button>
                                        </div>
                                    ))}
                                    {(fixedSemesters[selectedSemesterIndex] || []).length === 0 && (
                                        <div className="text-sm text-slate-400 text-center py-2 italic">
                                            Semestre vazio
                                        </div>
                                    )}
                                </div>
                            </div>

                            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 block">
                                Matérias Sugeridas ({suggestions.length})
                            </h3>
                            <div className="space-y-1">
                                {suggestions.map(subject => (
                                    <div key={subject._id} className="flex items-center justify-between group p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-state-800/50 border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                                        <div className="flex-1 min-w-0 mr-2">
                                            <div className="truncate text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2" title={subject._di}>
                                                {subject._di}
                                                {subject._el && <span className="px-1.5 py-0.5 rounded text-[9px] bg-red-100 text-red-700 font-bold">OBG</span>}
                                            </div>
                                            <div className="text-[10px] text-slate-400 dark:text-slate-500">
                                                {(subject._ap || 0) + (subject._at || 0)} cr • {subject._workload}h
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleAddSubjectToSemester(subject, selectedSemesterIndex)}
                                            className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                                            title="Adicionar"
                                        >
                                            <span className="material-symbols-outlined text-base">add_circle</span>
                                        </button>
                                    </div>
                                ))}
                                {suggestions.length === 0 && (
                                    <div className="text-sm text-slate-400 text-center py-4">
                                        Nenhuma sugestão disponível sem conflito.
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* DEFAULT MODE: Show Blacklist Electives */
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 block">
                                    Matérias Optativas
                                </h3>
                                <div className="space-y-1">
                                    {electives.map(subject => {
                                        const isBlacklisted = blacklistedIds.has(subject._id);
                                        // Check if currently IN the plan (Fixed or Predicted)
                                        // This is expensive to scan every render, optimization needed if slow.
                                        const isInPlan = simulationResult?.semesters.some(sem => sem.some(s => s._id === subject._id));
                                        const isCompleted = completedSubjects.some(s => s._id === subject._id);

                                        if (isCompleted) return null; // Don't show completed

                                        return (
                                            <div key={subject._id} className="flex items-center justify-between group p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-state-800/50 border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={!isBlacklisted}
                                                        onChange={() => toggleBlacklist(subject._id)}
                                                        className="rounded border-slate-300 text-primary focus:ring-primary"
                                                        title={isBlacklisted ? "Incluir na simulação" : "Remover da simulação"}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="truncate text-sm text-slate-700 dark:text-slate-300" title={subject._di}>
                                                            {subject._di}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 dark:text-slate-500">
                                                            {(subject._ap || 0) + (subject._at || 0)} cr • {subject._workload}h
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Canvas */}
            <div className="flex-1 relative bg-slate-50 dark:bg-slate-900/50 w-full h-full overflow-hidden">
                {!isSidebarOpen && (
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="absolute top-4 left-4 z-10 w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-border-light dark:border-border-dark flex items-center justify-center hover:bg-slate-50"
                    >
                        <span className="material-symbols-outlined">menu_open</span>
                    </button>
                )}

                {/* Info Bar */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-sm border border-border-light dark:border-border-dark text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span className="text-slate-600 dark:text-slate-300">Previsto</span>
                    </div>
                </div>

                {mindMapData && (
                    <MapaMentalVisualizacao
                        svgRef={svgRef}
                        nodes={mindMapData.nodes}
                        links={mindMapData.links}
                        graphBounds={mindMapData.graphBounds}
                        selectedNodeId={selectedNodeId}
                        onNodeClick={(nodeId) => {
                            if (selectedSemesterIndex !== null) {
                                // If editing, clicking a subject node in this semester REMOVES it
                                const currentFixed = fixedSemesters[selectedSemesterIndex];
                                if (currentFixed && currentFixed.some(s => s._id === nodeId || s._re === nodeId)) {
                                    const subject = currentFixed.find(s => s._id === nodeId || s._re === nodeId);
                                    if (subject) handleRemoveSubjectFromSemester(subject._id, selectedSemesterIndex);
                                }
                            } else {
                                // Visualization Mode: Toggle Highlight
                                setSelectedNodeId(prev => prev === nodeId ? null : nodeId);
                            }
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default PredictionPage;
