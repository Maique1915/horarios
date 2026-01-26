'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Relative imports adjusted for src/app/[cur]/page.tsx
import Comum from '../../components/shared/Comum';
import Grafos from '../../model/util/Grafos';
import Escolhe from '../../model/util/Escolhe';
// import { ativas, horarios, dimencao } from '../../model/util/Filtro.jsx/index.js'; // REMOVED
import MapaMental from '../../components/prediction/MapaMental';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { loadCompletedSubjects, toggleMultipleSubjects, loadClassesForGrid, getCourseSchedule, getCourseDimension } from '../../services/disciplinaService';
import { Subject } from '../../types/Subject';

// --- Types ---
interface GradeState {
    names: string[];
    keys: number[];
    estado: number;
    x: string[];
    crs: number[];
}

// --- Controller ---
const useGeraGradeController = () => {
    const params = useParams();
    const rawCur = params?.cur;
    const cur = (Array.isArray(rawCur) ? rawCur[0] : rawCur) || 'engcomp';

    const [state, setState] = useState<GradeState>({
        names: [],
        keys: [],
        estado: 0,
        x: [],
        crs: []
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [openPeriodKey, setOpenPeriodKey] = useState<string | null>(null);
    const [gradesResult, setGradesResult] = useState<Subject[]>([]);
    const [possibleGrades, setPossibleGrades] = useState<Subject[][]>([]);
    const [calculating, setCalculating] = useState(false);

    const _cur = useRef(cur);
    const { user, isExpired } = useAuth();
    const queryClient = useQueryClient();

    // Data Fetching
    const { data: arr = [], isLoading: loadingArr } = useQuery<Subject[]>({
        queryKey: ['ativas', cur],
        queryFn: () => loadClassesForGrid(cur),
        staleTime: 1000 * 60 * 60 * 24,
        enabled: !!cur,
    });

    const { data: courseSchedule = [], isLoading: loadingSchedule } = useQuery<any[]>({
        queryKey: ['horarios', cur],
        queryFn: () => getCourseSchedule(cur),
        staleTime: 1000 * 60 * 60 * 24,
        enabled: !!cur,
    });

    const { data: courseDimension = [0, 0], isLoading: loadingDimension } = useQuery<number[]>({
        queryKey: ['dimencao', cur],
        queryFn: () => getCourseDimension(cur),
        staleTime: 1000 * 60 * 60 * 24,
        enabled: !!cur,
    });

    const { data: completedSubjects = [] } = useQuery({
        queryKey: ['completedSubjects', user?.id],
        queryFn: () => user ? loadCompletedSubjects(user.id) : Promise.resolve([]),
        enabled: !!user?.id && !isExpired,
        staleTime: 1000 * 60 * 5,
    });

    const loading = loadingArr || (loadingSchedule && !courseSchedule.length) || (loadingDimension && !courseDimension[0]);

    // Effects
    useEffect(() => {
        if (cur !== _cur.current) {
            _cur.current = cur;
            setState({ names: [], keys: [], crs: [], estado: 0, x: [] });
        }
    }, [cur]);

    useEffect(() => {
        if (!isExpired && arr.length > 0 && completedSubjects.length > 0 && state.names.length === 0) {
            const newNames: string[] = [];
            const newKeys: number[] = [];
            const newCrs: number[] = [];

            completedSubjects.forEach((completed: any) => {
                const index = arr.findIndex((item: any) => item._re === completed._re);
                if (index > -1) {
                    newNames.push(completed._re);
                    newKeys.push(index);
                    newCrs.push(parseInt(completed._ap || 0) + parseInt(completed._at || 0));
                }
            });

            if (newNames.length > 0) {
                console.log("Auto-selecting completed subjects:", newNames.length);
                setState(prev => ({
                    ...prev,
                    names: newNames,
                    keys: newKeys,
                    crs: newCrs
                }));
            }
        }
    }, [arr, completedSubjects, isExpired, state.names.length]); // Added dependencies for stability

    useEffect(() => {
        const calculatePossibleGrades = async () => {
            if (state.estado === 2 && gradesResult.length > 0) {
                setCalculating(true);
                // Allow UI to update before heavy calculation
                await new Promise(resolve => setTimeout(resolve, 0));

                console.log('GeraGrade: Calculando grades possíveis...');
                const m = gradesResult.filter(item => !state.x.includes(item._re));

                const escolhe = new Escolhe(m, courseSchedule);
                let gp = escolhe.exc();
                console.log('GeraGrade: Grades geradas:', gp.length);

                setPossibleGrades(gp.slice(0, 50));
                setCalculating(false);
            }
        };
        calculatePossibleGrades();
    }, [state.estado, state.x, gradesResult, courseSchedule]);

    // Actions
    const handleSyncCompletedSubjects = async () => {
        if (!user || !arr.length) return;

        console.log("Syncing completed subjects...");
        const currentDbIds = new Set<string>((completedSubjects as any[]).map((s: any) => s._id));
        const selectedAcronyms = new Set(state.names);
        const selectedIds = new Set<string>();

        arr.forEach((item: any) => {
            if (selectedAcronyms.has(item._re)) {
                selectedIds.add(item._id);
            }
        });

        const toAdd: string[] = [];
        const toRemove: string[] = [];

        selectedIds.forEach(id => {
            if (!currentDbIds.has(id)) toAdd.push(id);
        });

        currentDbIds.forEach((id: string) => {
            if (!selectedIds.has(id)) {
                const existsInCurrentScope = arr.some((s: any) => String(s._id) === id);
                if (existsInCurrentScope) {
                    toRemove.push(id);
                }
            }
        });

        const promises = [];
        if (toAdd.length > 0) promises.push(toggleMultipleSubjects(user.id, toAdd, true));
        if (toRemove.length > 0) promises.push(toggleMultipleSubjects(user.id, toRemove, false));

        if (promises.length > 0) {
            await Promise.all(promises);
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['completedSubjects', user.id] }),
                queryClient.invalidateQueries({ queryKey: ['currentEnrollments', user.id] }),
                queryClient.invalidateQueries({ queryKey: ['userTotalHours', user.id] }),
            ]);
            console.log("Subjects synced successfully");
        }
    };

    function handleCheck(e: React.ChangeEvent<HTMLInputElement>) {
        const r = e.target;

        if (r.classList.contains('period-toggle')) {
            const isChecked = r.checked;
            const subjectGroup = document.getElementById(r.value);

            if (subjectGroup) {
                const subjectCheckboxes = subjectGroup.getElementsByClassName("subject-checkbox");

                Array.from(subjectCheckboxes).forEach((element) => {
                    const mat = element as HTMLInputElement;
                    const idNoEstado = (state.estado === 0)
                        ? state.keys.indexOf(parseInt(mat.value))
                        : state.x.indexOf(mat.id);

                    if (isChecked && idNoEstado === -1) {
                        altera(true, mat);
                    } else if (!isChecked && idNoEstado > -1) {
                        altera(false, mat);
                    }
                });
            }
        }
        else if (r.classList.contains('subject-checkbox')) {
            altera(r.checked, r);
        }
    }

    function altera(add: boolean, target: HTMLInputElement) {
        if (state.estado === 0) {
            const value = parseInt(target.value);
            setState(prevState => {
                const keys = [...prevState.keys];
                const names = [...prevState.names];
                const crs = [...prevState.crs];

                if (add) {
                    if (!keys.includes(value)) {
                        keys.push(value);
                        names.push(target.id);
                        crs.push(parseInt(target.name));
                    }
                } else {
                    const i = keys.indexOf(value);
                    if (i > -1) {
                        keys.splice(i, 1);
                        names.splice(i, 1);
                        crs.splice(i, 1);
                    }
                }
                return { ...prevState, keys, names, crs };
            });
        } else if (state.estado === 1) {
            setState(prevState => ({
                ...prevState,
                x: add ? [...prevState.x, target.id] : prevState.x.filter(id => id !== target.id)
            }));
        }
    }

    function remove(m: Subject[]) {
        const aux = [];
        const e = new Set();
        for (const i of m) {
            // Trim acronym to handle whitespace issues
            const key = i._re ? i._re.trim() : i._re;

            if (!e.has(key)) {
                e.add(key);

                // Clone to avoid side effects
                const newItem = { ...i };

                if (newItem._di.includes(" - A") || newItem._di.includes(" - B")) {
                    newItem._di = newItem._di.substring(0, newItem._di.length - 4);
                } else if (!newItem._el && !newItem._di.includes(" - OPT")) {
                    newItem._di += " - OPT";
                }
                aux.push(newItem);
            } else {
                console.warn("GeraGradeClient: Duplicate acronym detected and filtered:", key, i._di);
            }
        }
        return aux;
    }

    function periodo(m: Subject[]) {
        const aux: { [key: string]: Subject[] } = {};
        for (const item of m) {
            if (!aux[item._se]) {
                aux[item._se] = [];
            }
            aux[item._se].push(item);
        }
        return aux;
    }

    function mudaTela(i: number) {
        if (i === 1) {
            const cr = state.crs.reduce((a, b) => a + b, 0);
            const calculatedGr = new Grafos(arr, cr, state.names).matriz();
            setGradesResult(calculatedGr);
            setState(e => ({ ...e, estado: i }));
        } else if (i === 2) {
            setCalculating(true);
            setState(e => ({ ...e, estado: i }));
        } else {
            setState(e => ({ ...e, estado: i }));
        }
        window.scrollTo(0, 0);
    }

    const handleOpenMapaMental = () => {
        setState(e => ({ ...e, estado: 4 }));
    };

    return {
        // State
        cur,
        state, setState,
        loading,
        calculating,
        possibleGrades,
        courseSchedule,
        courseDimension,
        gradesResult,
        searchTerm, setSearchTerm,
        openPeriodKey, setOpenPeriodKey,
        arr,
        // Methods
        handleCheck,
        mudaTela,
        handleOpenMapaMental,
        handleSyncCompletedSubjects,
        periodo, // Helpers needed for View
        remove,  // Helpers needed for View
        user,    // Authentication state
        isExpired // Subscription state
    };
};

// --- Components ---

const SubjectItem = ({ itemData, isChecked, value, handleCheck }: { itemData: Subject, isChecked: boolean, value: any, handleCheck: any }) => {
    return (
        <label key={itemData._re} className="flex items-start gap-3 py-3 px-2 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group" onClick={(e) => e.stopPropagation()}>
            <div className="relative flex items-center mt-1">
                <input
                    type="checkbox"
                    name={String(itemData._ap + itemData._at)}
                    checked={isChecked}
                    className="subject-checkbox h-5 w-5 appearance-none rounded border-2 border-slate-300 dark:border-slate-600 bg-transparent checked:bg-primary checked:border-primary transition-all cursor-pointer peer"
                    id={itemData._re}
                    value={value}
                    onChange={handleCheck}
                />
                <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">
                    <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                </span>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
                <p className={`text-sm font-medium leading-snug transition-colors ${isChecked ? 'text-primary' : 'text-text-light-primary dark:text-text-dark-primary'}`}>
                    {itemData._di}
                </p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {itemData._re}
                    </span>
                    <span className="text-xs text-text-light-secondary dark:text-text-dark-secondary">
                        {itemData._ap + itemData._at} Créditos
                    </span>
                </div>
            </div>
        </label>
    );
};

const PeriodAccordion = ({ periodKey, subjectsData, openPeriodKey, setOpenPeriodKey, state, arr, handleCheck }: { periodKey: string, subjectsData: Subject[], openPeriodKey: string | null, setOpenPeriodKey: (k: string | null) => void, state: GradeState, arr: Subject[], handleCheck: any }) => {
    const allSubjectIdsInPeriod = subjectsData.map(s => s._re);
    const selectedSubjects = (state.estado === 0) ? state.names : state.x;
    const areAllSelected = allSubjectIdsInPeriod.length > 0 &&
        allSubjectIdsInPeriod.every(id => selectedSubjects.includes(id));

    const selectedCount = subjectsData.filter(subject =>
        selectedSubjects.includes(subject._re)
    ).length;

    const isOpen = openPeriodKey === periodKey;

    const handleSummaryClick = (e: React.MouseEvent) => {
        if (isOpen) {
            setOpenPeriodKey(null);
        } else {
            setOpenPeriodKey(periodKey);
        }
    };

    return (
        <details className="flex flex-col rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm overflow-hidden group transition-all duration-300" open={isOpen}>
            <summary className="flex cursor-pointer items-center justify-between gap-4 py-4 px-5 bg-surface-light dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors select-none" onClick={handleSummaryClick}>
                <div className="flex items-center gap-4">
                    <div className="relative flex items-center" onClick={(e) => e.stopPropagation()}>
                        <input
                            type="checkbox"
                            className="period-toggle h-5 w-5 appearance-none rounded border-2 border-slate-300 dark:border-slate-600 bg-transparent checked:bg-primary checked:border-primary transition-all cursor-pointer peer"
                            checked={areAllSelected}
                            onChange={handleCheck}
                            value={periodKey}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">
                            <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                        </span>
                    </div>
                    <div>
                        <p className="text-text-light-primary dark:text-text-dark-primary text-base font-bold leading-none">
                            {periodKey}º Período
                        </p>
                        <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary mt-1 font-medium">
                            {selectedCount} de {subjectsData.length} selecionadas
                        </p>
                    </div>
                </div>
                <div className={`p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <span className="material-symbols-outlined text-xl">expand_more</span>
                </div>
            </summary>
            <div className="border-t border-border-light dark:border-border-dark animate-slideDown">
                <div id={periodKey} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 p-4 bg-background-light dark:bg-background-dark/50">
                    {subjectsData.map(item => {
                        const originalIndex = arr.findIndex(i => i._re === item._re);
                        const key = (state.estado === 0) ? originalIndex : item._re;
                        const isChecked = (state.estado === 0)
                            ? state.names.includes(item._re)
                            : state.x.includes(item._re);
                        return (
                            <SubjectItem
                                key={item._re}
                                itemData={item}
                                isChecked={isChecked}
                                value={key}
                                handleCheck={handleCheck}
                            />
                        );
                    })}
                </div>
            </div>
        </details>
    );
}

// --- Views ---

const LoadingView = () => (
    <div className="pt-20">
        <LoadingSpinner message="Carregando dados da grade..." />
    </div>
);

const CalculatingView = () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fadeIn">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-6"></div>
        <p className="text-lg font-medium text-text-light-primary dark:text-text-dark-primary mb-2">
            Calculando grades possíveis...
        </p>
        <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary animate-pulse">
            Analisando combinações sem conflito
        </p>
    </div>
);

const NoGradesView = ({ mudarTela }: { mudarTela: (i: number) => void }) => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center animate-fadeIn max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-4xl text-yellow-600 dark:text-yellow-500">warning_amber</span>
        </div>
        <h2 className="text-2xl font-bold text-text-light-primary dark:text-text-dark-primary mb-3">
            Nenhuma grade possível encontrada
        </h2>
        <p className="text-text-light-secondary dark:text-text-dark-secondary mb-8 leading-relaxed">
            Não foi possível encontrar uma combinação de horários para as matérias selecionadas sem conflitos.
        </p>
        <button
            onClick={() => mudarTela(1)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 hover:shadow-xl"
        >
            <span className="material-symbols-outlined">arrow_back</span>
            Voltar e ajustar
        </button>
    </div>
);

const SelectionView = ({ ctrl }: { ctrl: ReturnType<typeof useGeraGradeController> }) => {

    const getStepTitle = () => {
        if (ctrl.state.estado === 0) return "O que você já cursou?";
        else if (ctrl.state.estado === 1) return "O que você NÃO quer fazer?";
    };

    const getStepDescription = () => {
        if (ctrl.state.estado === 0 && ctrl.state.names.length === 0)
            return (
                <p className="text-text-light-secondary dark:text-text-dark-secondary text-sm">
                    Selecione as matérias que você já foi aprovado.
                </p>
            )

        const totalCredits = ctrl.state.crs.reduce((a: number, b: number) => a + b, 0);

        return (
            <div className="flex flex-row gap-6 items-center">
                <div className="flex flex-col items-center">
                    <p className="text-xs uppercase font-bold text-text-light-secondary dark:text-text-dark-secondary tracking-wider">
                        Matérias
                    </p>
                    <p className="text-xl font-bold text-primary leading-none mt-1">
                        {ctrl.state.names.length}
                    </p>
                </div>
                <div className="w-px h-8 bg-border-light dark:border-border-dark"></div>
                <div className="flex flex-col items-center">
                    <p className="text-xs uppercase font-bold text-text-light-secondary dark:text-text-dark-secondary tracking-wider">
                        Créditos
                    </p>
                    <p className="text-xl font-bold text-primary leading-none mt-1">
                        {totalCredits}
                    </p>
                </div>
            </div>
        )
    };

    const renderContent = () => {
        if (ctrl.state.estado === 0) {
            const filteredArr = ctrl.arr.filter((item: any) =>
                (item._di?.toLowerCase() || "").includes(ctrl.searchTerm.toLowerCase()) ||
                (item._re?.toLowerCase() || "").includes(ctrl.searchTerm.toLowerCase())
            );
            const pe = ctrl.periodo(ctrl.remove(filteredArr));

            return (
                <div className="flex flex-col py-4 gap-4 animate-fadeIn">
                    {/* Search Bar */}
                    <div className="relative mb-2">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-slate-400">search</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar matéria..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light-primary dark:text-text-dark-primary focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                            value={ctrl.searchTerm}
                            onChange={(e) => ctrl.setSearchTerm(e.target.value)}
                        />
                    </div>

                    {Object.keys(pe).map(key => (
                        <PeriodAccordion
                            key={key}
                            periodKey={key}
                            subjectsData={pe[key]}
                            openPeriodKey={ctrl.openPeriodKey}
                            setOpenPeriodKey={ctrl.setOpenPeriodKey}
                            state={ctrl.state}
                            arr={ctrl.arr}
                            handleCheck={ctrl.handleCheck}
                        />
                    ))}
                </div>
            );
        } else if (ctrl.state.estado === 1) {
            const pe = ctrl.periodo(ctrl.remove(ctrl.gradesResult));

            if (Object.keys(pe).length === 0) {
                return (
                    <div className="flex flex-col py-4 gap-4 animate-fadeIn">
                        <div className="flex flex-col items-center justify-center p-10 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark text-center">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-3xl text-green-600 dark:text-green-400">check_circle</span>
                            </div>
                            <h3 className="text-lg font-bold text-text-light-primary dark:text-text-dark-primary mb-2">
                                Todas as matérias concluídas!
                            </h3>
                            <p className="text-text-light-secondary dark:text-text-dark-secondary text-sm">
                                Você não tem mais matérias obrigatórias ou optativas pendentes para matricular.
                            </p>
                        </div>
                    </div>
                );
            }

            return (
                <div className="flex flex-col py-4 gap-4 animate-fadeIn">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 mb-2 flex gap-3">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 shrink-0">info</span>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            Desmarque as matérias que você <strong>NÃO</strong> quer cursar neste semestre. O gerador tentará encaixar todas as marcadas.
                        </p>
                    </div>

                    {Object.keys(pe).map(key => (
                        <PeriodAccordion
                            key={key}
                            periodKey={key}
                            subjectsData={pe[key]}
                            openPeriodKey={ctrl.openPeriodKey}
                            setOpenPeriodKey={ctrl.setOpenPeriodKey}
                            state={ctrl.state}
                            arr={ctrl.arr}
                            handleCheck={ctrl.handleCheck}
                        />
                    ))}
                </div>
            );
        }
    };

    return (
        <>
            <aside className="sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-border-light dark:border-border-dark">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            {/* Step Indicator */}
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${ctrl.state.estado === 0 ? 'bg-primary border-primary text-white' : 'bg-transparent border-primary text-primary'}`}>
                                    1
                                </div>
                                <div className="w-8 h-0.5 bg-border-light dark:border-border-dark"></div>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${ctrl.state.estado === 1 ? 'bg-primary border-primary text-white' : 'bg-transparent border-slate-300 dark:border-slate-600 text-slate-400'}`}>
                                    2
                                </div>
                            </div>

                            <div>
                                <h1 className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary">
                                    {getStepTitle()}
                                </h1>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-6">
                            {/* Stats */}
                            <div className="hidden md:block">
                                {getStepDescription()}
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center gap-3">
                                {ctrl.state.estado === 1 && (
                                    <button
                                        onClick={() => ctrl.mudaTela(0)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-text-light-secondary hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800"
                                    >
                                        <span className="material-symbols-outlined">arrow_back</span>
                                        <span>Voltar</span>
                                    </button>
                                )}

                                {ctrl.state.estado === 0 && (
                                    <button
                                        onClick={() => ctrl.mudaTela(1)}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-lg hover:-translate-y-0.5"
                                    >
                                        <span>Próximo</span>
                                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                    </button>
                                )}

                                {ctrl.state.estado === 1 && (
                                    <>
                                        <button
                                            onClick={() => {
                                                if (!ctrl.user || ctrl.isExpired) {
                                                    window.open('https://vain-phrase.com/b.3ZVF0yPD3_p-vvbLmQVnJ/ZBDo0r2HN/zEUv3HNNzaANz/LxT/Y/3sN/TOcY3/MRDvQh', '_blank');
                                                }
                                                ctrl.handleOpenMapaMental();
                                            }}
                                            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                            title="Ver Cronograma"
                                        >
                                            <span className="material-symbols-outlined text-lg">account_tree</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (!ctrl.user || ctrl.isExpired) {
                                                    window.open('https://vain-phrase.com/b.3ZVF0yPD3_p-vvbLmQVnJ/ZBDo0r2HN/zEUv3HNNzaANz/LxT/Y/3sN/TOcY3/MRDvQh', '_blank');
                                                }
                                                ctrl.mudaTela(2);
                                            }}
                                            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-lg hover:-translate-y-0.5"
                                        >
                                            <span className="material-symbols-outlined text-lg">auto_awesome</span>
                                            <span>Gerar Grades</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Mobile Stats */}
                    <div className="md:hidden mt-4 pt-4 border-t border-border-light dark:border-border-dark flex justify-center">
                        {getStepDescription()}
                    </div>
                </div>
            </aside>

            <div className="bg-background-light dark:bg-background-dark min-h-[calc(100vh-80px)] scroll-mt-20">
                <div className="max-w-5xl mx-auto px-4 py-8">
                    {renderContent()}
                </div>
            </div>
        </>
    );
};

// --- Main View Integrator ---
const GeraGradeView = ({ ctrl }: { ctrl: ReturnType<typeof useGeraGradeController> }) => {
    // 1. Loading State
    if (ctrl.loading) {
        return <LoadingView />;
    }

    // 2. Mind Map State
    if (ctrl.state.estado === 4) {
        return (
            <MapaMental
                subjectStatus={{
                    feitas: ctrl.state.names,
                    podeFazer: ctrl.gradesResult.map(d => d._re),
                }}
                onVoltar={() => ctrl.setState(e => ({ ...e, estado: 1 }))}
            />
        );
    }

    // 3. Results State (Estado 2)
    if (ctrl.state.estado === 2) {
        if (ctrl.calculating) {
            return <CalculatingView />;
        }

        if (ctrl.possibleGrades.length === 0) {
            return <NoGradesView mudarTela={ctrl.mudaTela} />;
        }

        const b = (
            <button onClick={() => ctrl.mudaTela(1)}
                className="group flex cursor-pointer items-center justify-center gap-2 rounded-xl h-10 px-5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                Voltar
            </button>
        );

        const feitasIds = ctrl.state.names.map(name => {
            const subject = ctrl.arr.find((s) => s._re === name);
            return subject ? subject._id : null;
        }).filter((id): id is number => id !== null);

        return (
            <Comum
                materias={ctrl.possibleGrades}
                feitas={feitasIds}
                tela={2}
                fun={b}
                cur={String(ctrl.cur)}
                onSaveAction={ctrl.handleSyncCompletedSubjects}
                separa={false}
                g={"ª"}
                f={" Grade Possível"}
                courseSchedule={ctrl.courseSchedule}
                courseDimension={ctrl.courseDimension}
            />
        );
    }

    // 4. Default Steps Selection (Estado 0 & 1)
    return <SelectionView ctrl={ctrl} />;
};

const CoursePageWithController = () => {
    const ctrl = useGeraGradeController();
    return <GeraGradeView ctrl={ctrl} />;
}

export default function GeraGradeClient() {
    return (
        <Suspense fallback={<LoadingSpinner message="Carregando..." />}>
            <CoursePageWithController />
        </Suspense>
    );
}
