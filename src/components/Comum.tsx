import React, { useState, useEffect } from 'react';
import { getDays, getTimeSlots } from '../services/scheduleService';
// Services
import { loadClassesForGrid, saveCurrentEnrollments, saveCompletedSubjects } from '../services/disciplinaService';
import { useAuth } from '../contexts/AuthContext';
import { toPng } from 'html-to-image';
import { Subject } from '../types/Subject';

interface Day {
    id: number;
    name: string;
}

interface TimeSlot {
    id: number;
    start_time: string;
    end_time: string;
}

interface ComumProps {
    materias?: Subject[] | Subject[][];
    // tela 2 means "Generation Mode" (multiple grades), others mean "View Mode" (single list)
    tela: number;
    cur?: string;
    hideSave?: boolean;
    fun?: React.ReactNode;
    g?: string;
    f?: string;
    separa?: boolean;
    feitas?: string[]; // Array of acronyms
    onSaveAction?: () => Promise<void>;
    completedSubjectsList?: string[];
    // These might be passed from parent to avoid re-fetching, though Comum fetches its own if missing?
    // Looking at code, it fetches only if props.materias is missing. 
    courseSchedule?: any;
    courseDimension?: any;
}

interface ComumState {
    id: number;
    pageBlockStart: number;
    materias: Subject[] | Subject[][];
    feitas: string[];
}

interface PreviousGradeState {
    grade: string[][];
    cores: string[][];
}

// Cores mais suaves e modernas para o design system
const cores = [
    "#FFADAD", // Pastel Red
    "#FFD6A5", // Pastel Orange
    "#FDFFB6", // Pastel Yellow
    "#CAFFBF", // Pastel Green
    "#9BF6FF", // Pastel Cyan
    "#A0C4FF", // Pastel Blue
    "#BDB2FF", // Pastel Indigo
    "#FFC6FF", // Pastel Violet
    "#E6C9A8", // Pastel Brown
    "#DCDCDC", // Pastel Gray
];
const rand = Math.floor(Math.random() * cores.length);

const dataAtual = new Date();
const mesAtual = dataAtual.getMonth() + 1;
const anoAtual = dataAtual.getFullYear();
const periodoAtual = `${anoAtual}.${mesAtual > 6 ? "2" : "1"}`;

const Comum: React.FC<ComumProps> = (props) => {
    const [state, setState] = useState<ComumState>({
        id: 0,
        pageBlockStart: 0,
        materias: props.materias || [],
        feitas: props.feitas || [],
    });
    const [isPrinting, setIsPrinting] = useState(false);
    const [transitioningTo, setTransitioningTo] = useState<number | null>(null);
    const [previousGrade, setPreviousGrade] = useState<PreviousGradeState | null>(null);

    // Auth
    const { user, isExpired } = useAuth();
    const [saving, setSaving] = useState(false);

    // Dynamic Schedule Data
    const [dbDays, setDbDays] = useState<Day[]>([]);
    const [dbTimeSlots, setDbTimeSlots] = useState<TimeSlot[]>([]);
    const [scheduleLoading, setScheduleLoading] = useState(true);

    // Desestruturando a prop 'separa' para fácil acesso
    let { cur: _cur, fun: _fun, separa: _separa, g, f } = props;
    _cur = _cur || (typeof window !== 'undefined' ? window.location.href.split("/")[3] : "engcomp") || "engcomp";

    // Sincroniza state.materias quando props.materias muda
    useEffect(() => {
        if (props.materias && props.materias.length > 0) {
            setState(prevState => ({
                ...prevState,
                materias: props.materias!,
                id: 0,
                pageBlockStart: 0
            }));
        }
    }, [props.materias]);

    useEffect(() => {
        const fetchScheduleData = async () => {
            try {
                const [d, t] = await Promise.all([getDays(), getTimeSlots()]);
                setDbDays(d);
                setDbTimeSlots(t);

                // Se não houver matérias via props, carrega do Serviço
                if (!props.materias || props.materias.length === 0) {
                    const gridData: Subject[] = await loadClassesForGrid(_cur);
                    console.log("Comum: Loaded grid data from service", gridData.length);

                    const filteredData = gridData.filter(item => item._ag === true && item._cu === _cur);

                    setState(prevState => ({
                        ...prevState,
                        materias: filteredData,
                        id: 0,
                        pageBlockStart: 0
                    }));
                }

            } catch (error) {
                console.error("Erro ao carregar dados do cronograma:", error);
            } finally {
                setScheduleLoading(false);
            }
        };
        fetchScheduleData();
    }, [_cur, props.materias]); // Added props.materias dependency to avoid stale closure or race conditions

    // Determina se está carregando 
    const loading = scheduleLoading;

    const th = dbTimeSlots.length;
    const td = dbDays.length;

    // Usando nomes dos dias do banco
    const dias = dbDays.map(d => d.name);

    const separarPorSemestre = (arr: Subject[]): Subject[][] => {
        // Find max semester
        let maxSem = 0;
        arr.forEach(s => { if (s._se > maxSem) maxSem = s._se; });

        const aux: Subject[][] = Array.from({ length: maxSem }, () => []);

        for (const i of arr) {
            if (i._se > 0 && i._se <= maxSem) {
                aux[i._se - 1].push(i);
            }
        }
        return aux.filter(e => e && e.length > 0);
    };

    const bd = React.useMemo(() => {
        if (props.tela === 2) {
            return state.materias as Subject[][];
        } else if (props.separa) {
            return separarPorSemestre(state.materias as Subject[]);
        } else {
            return Array.isArray(state.materias[0])
                ? state.materias as Subject[][]
                : [state.materias as Subject[]];
        }
    }, [state.materias, props.tela, props.separa]);

    const { grades, coresGrade } = React.useMemo(() => {
        if (state.materias.length > 0) {
            console.log("Comum: Starting grade creation with", state.materias.length, "disciplines");
        }

        const gradesOut: string[][][] = [];
        const coresGradeOut: string[][][] = [];

        // bd is Subject[][] - each item is a "Semester" or a "Schedule Option"
        for (const semestre of bd) {
            const gradeVazia = Array.from({ length: th }, () => Array(td).fill(""));
            const coresVazias = Array.from({ length: th }, () => Array(td).fill(""));

            semestre.forEach((disciplina, index) => {
                const opt = !disciplina._el && disciplina._di && !disciplina._di.includes(" - OPT") ? " - OPT" : "";

                if (Array.isArray(disciplina._ho)) {
                    disciplina._ho.forEach(([dayId, slotId], i) => {
                        // ROBUST MAPPING: Find index by ID
                        const numDia = dbDays.findIndex(d => d.id === dayId);
                        const numHorario = dbTimeSlots.findIndex(s => s.id === slotId);

                        // Cast _da to string array safely if it exists
                        const daArray = (Array.isArray(disciplina._da) ? disciplina._da : []) as number[];

                        const nomeMateria = (daArray && daArray[i])
                            ? `${disciplina._di}\n${daArray[i]}`
                            : disciplina._di;

                        if (numHorario >= 0 && numHorario < th && numDia >= 0 && numDia < td) {
                            if (gradeVazia[numHorario][numDia] === "") {
                                gradeVazia[numHorario][numDia] = nomeMateria + opt;
                            } else {
                                gradeVazia[numHorario][numDia] += ` / ${nomeMateria}${opt}`;
                            }
                            coresVazias[numHorario][numDia] = cores[(index + rand) % cores.length];
                        }
                    });
                }
            });
            gradesOut.push(gradeVazia);
            coresGradeOut.push(coresVazias);
        }
        return { grades: gradesOut, coresGrade: coresGradeOut };
    }, [bd, dbDays, dbTimeSlots, th, td]);

    const handlePageChange = (newId: number) => {
        if (newId !== state.id && transitioningTo === null) {
            setTransitioningTo(newId);
            setPreviousGrade({ grade: grades[state.id], cores: coresGrade[state.id] });
            setTimeout(() => {
                setState(s => ({ ...s, id: newId }));
                setTransitioningTo(null);
                setPreviousGrade(null);
            }, 200);
        }
    };

    const handleNextBlock = () => {
        setState(s => ({ ...s, pageBlockStart: s.pageBlockStart + 10 }));
    };

    const handlePrevBlock = () => {
        setState(s => ({ ...s, pageBlockStart: s.pageBlockStart - 10 }));
    };

    // Função de exportação para imagem
    const handleExportImage = async () => {
        setIsPrinting(true);
        // Timeout to allow UI updates
        await new Promise(resolve => setTimeout(resolve, 100));

        const element = document.getElementById('schedule-card');
        if (!element) {
            setIsPrinting(false);
            return;
        }

        try {
            const dataUrl = await toPng(element, {
                cacheBust: true,
                backgroundColor: '#ffffff',
                width: element.scrollWidth,
                height: element.scrollHeight,
                style: {
                    margin: '0',
                },
                filter: (node) => {
                    return !node.classList || !node.classList.contains('export-ignore');
                }
            });

            // Create link and download
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `grade_horaria_${new Date().getTime()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error("Erro ao exportar imagem:", error);
            alert("Erro ao salvar imagem. Tente novamente.");
        } finally {
            setIsPrinting(false);
        }
    };




    const handleSave = async () => {
        if (!user) return;
        setSaving(true);

        let materiasParaSalvar: Subject[] | Subject[][];

        // Se tiver mais de uma grade (modo de geração), salva a grade ATUAL (state.id)
        if (grades.length > 1 && bd[state.id]) {
            materiasParaSalvar = bd[state.id];
        } else if (bd[0]) {
            // Modo normal ou array simples
            materiasParaSalvar = bd[0];
        } else {
            // Fallback
            materiasParaSalvar = state.materias;
        }

        try {
            // Flatten if needed (separa por semestre return array of arrays)
            let flatMaterias: Subject[] = [];

            if (Array.isArray(materiasParaSalvar)) {
                if (materiasParaSalvar.length > 0 && Array.isArray(materiasParaSalvar[0])) {
                    // It is Subject[][]
                    flatMaterias = (materiasParaSalvar as Subject[][]).flat();
                } else {
                    // It is Subject[]
                    flatMaterias = materiasParaSalvar as Subject[];
                }
            }

            console.log("Saving enrollments:", flatMaterias);

            await saveCurrentEnrollments(user.id, flatMaterias, periodoAtual);
            if (props.feitas) {
                await saveCompletedSubjects(user.id, props.feitas);
            }
            alert("Grade salva com sucesso!");
        } catch (error) {
            console.error("Erro ao salvar grade:", error);
            alert("Erro ao salvar grade. Tente novamente.");
        } finally {
            setSaving(false);
        }
    };

    function renderCelula(numLinha: number, numCelula: number, key: string) {
        const isTransitioning = transitioningTo !== null;
        const newGradeId = transitioningTo !== null ? transitioningTo : state.id;

        // Dados da grade "nova" 
        const conteudoNovo = grades[newGradeId]?.[numLinha]?.[numCelula] || "";
        // Use darker background for dark mode cells if they have content
        const baseCorNova = coresGrade[newGradeId]?.[numLinha]?.[numCelula] || "transparent";

        // Dados da grade anterior 
        const conteudoAnterior = previousGrade?.grade?.[numLinha]?.[numCelula] || "";
        const baseCorAnterior = previousGrade?.cores?.[numLinha]?.[numCelula] || "transparent";

        const hasContent = conteudoNovo && conteudoNovo.trim() !== "";

        return (
            <td key={key} className="relative p-1 align-middle h-auto min-w-[120px] transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/20">
                {/* Empty State visual helper (optional) */}
                {!hasContent && !conteudoAnterior && (
                    <div className="w-full min-h-[3.5rem] rounded-md bg-transparent"></div>
                )}

                {/* Conteúdo Antigo (Transition Out) */}
                {isTransitioning && conteudoAnterior && (
                    <div
                        className="absolute inset-1 p-1 rounded-md shadow-sm animate-fade-out overflow-hidden text-center flex flex-col justify-center items-center z-10"
                        style={{ backgroundColor: baseCorAnterior, color: '#1e293b' }}
                    >
                        {conteudoAnterior.split('\n').map((line, i) => (
                            <div key={i} className={`text-[10px] leading-tight ${i === 0 ? 'font-bold mb-0.5' : 'opacity-80'}`}>
                                {line}
                            </div>
                        ))}
                    </div>
                )}

                {/* Conteúdo Novo (Transition In) */}
                {hasContent && (
                    <div
                        className={`relative w-full min-h-[3.5rem] px-1 py-1 rounded-md shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col justify-center items-center text-center cursor-default group border border-black/5 dark:border-white/5 ${isTransitioning ? 'animate-fade-in' : ''}`}
                        style={{ backgroundColor: baseCorNova }}
                    >
                        {conteudoNovo.split('\n').map((line, i) => (
                            <div key={i} className={`text-[10px] text-slate-800 break-words w-full leading-tight ${i === 0 ? 'font-bold text-[11px] mb-0.5 uppercase tracking-tight' : 'font-medium text-slate-600'}`}>
                                {line}
                            </div>
                        ))}
                    </div>
                )}
            </td>
        );
    }

    function renderLinha(numLinha: number) {
        if (!grades || !grades[state.id]) return null;

        const slot = dbTimeSlots[numLinha];
        const labelHorario = slot ? `${slot.start_time ? slot.start_time.substring(0, 5) : ""} - ${slot.end_time ? slot.end_time.substring(0, 5) : ""}` : "???";

        const celulas = Array.from({ length: td }).map((_, numCelula) =>
            renderCelula(numLinha, numCelula, `cell-${numLinha}-${numCelula}`)
        );
        return (
            <tr key={`row-${numLinha}`} className="group min-h-[4rem] h-auto hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                <td className="p-1 px-2 text-[10px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap text-center bg-background-light dark:bg-background-dark sticky left-0 z-20 group-hover:text-primary transition-colors">
                    <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded tracking-wide border border-slate-200 dark:border-slate-700">{labelHorario}</span>
                </td>
                {celulas}
            </tr>
        );
    }

    function renderIntervalo(key: string) {
        return (
            <tr key={key}>
                <td colSpan={td + 1} className="py-2 px-0 bg-transparent">
                    <div className="flex items-center justify-center relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-border-light/60 dark:border-border-dark/60 border-dashed"></div>
                        </div>
                        <span className="relative z-10 bg-background-light dark:bg-background-dark text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-widest font-bold px-3 py-0.5 rounded-full border border-border-light dark:border-border-dark">
                            Intervalo
                        </span>
                    </div>
                </td>
            </tr>
        );
    }

    function renderTabela() {
        if (!grades || grades.length === 0 || !grades[state.id]) {
            if (loading) {
                return (
                    <div className="flex justify-center items-center h-64 w-full bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-border-light dark:border-border-dark">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
                    </div>
                );
            }
            return (
                <div className="flex flex-col justify-center items-center h-64 w-full bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-border-light dark:border-border-dark text-text-light-secondary dark:text-text-dark-secondary">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">event_busy</span>
                    <p className="font-medium">Não há grades para exibir.</p>
                </div>
            );
        }

        const corpoTabela = [];
        for (let i = 0; i < th; i++) {
            if (i > 0) {
                const prevEnd = dbTimeSlots[i - 1].end_time;
                const currStart = dbTimeSlots[i].start_time;
                if (prevEnd && currStart && prevEnd !== currStart) {
                    corpoTabela.push(renderIntervalo(`interval-${i}`));
                }
            }
            corpoTabela.push(renderLinha(i));
        }
        return (
            <div className="rounded-2xl border border-border-light dark:border-border-dark overflow-hidden bg-white dark:bg-slate-900 shadow-sm ring-1 ring-black/5 dark:ring-white/5">
                <div className={`${isPrinting ? 'overflow-visible' : 'overflow-auto max-h-[70vh]'} scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent`}>
                    <table className="w-full border-collapse table-fixed min-w-[1000px]">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-30">
                                <th className="p-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider w-24 bg-slate-50 dark:bg-slate-800 sticky left-0 z-50">
                                    Horário
                                </th>
                                {dias.map(dia => (
                                    <th key={dia} className="p-3 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest w-full text-center">
                                        {dia}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-background-light dark:bg-background-dark">
                            {corpoTabela}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div id="schedule-grid" className="w-full h-[calc(100vh-64px)] relative">
            <div className="absolute inset-0 overflow-y-auto p-6 flex flex-col items-center scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
                <div className="w-full max-w-[1400px]">
                    {(grades && grades.length > 1) && (
                        <div className={`flex justify-center items-center gap-1 mb-6 ${isPrinting ? 'invisible' : ''}`}>
                            {(!_separa && grades.length > 10) && (
                                <button
                                    className="bg-surface-light dark:bg-surface-dark hover:bg-slate-100 dark:hover:bg-slate-800 text-text-light-secondary dark:text-text-dark-secondary font-bold p-2.5 rounded-xl border border-border-light dark:border-border-dark shadow-sm transition-all hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => setState(s => ({ ...s, pageBlockStart: Math.max(0, s.pageBlockStart - 10) }))}
                                    disabled={state.pageBlockStart === 0}
                                >
                                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                                </button>
                            )}
                            <div className="flex gap-1 bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-xl border border-border-light/50 dark:border-border-dark/50">
                                {
                                    grades.slice(state.pageBlockStart, state.pageBlockStart + 10).map((_, i) => {
                                        const idx = state.pageBlockStart + i;
                                        const isActive = (transitioningTo !== null ? transitioningTo : state.id) === idx;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handlePageChange(idx)}
                                                className={`w-9 h-9 rounded-lg text-sm font-bold transition-all duration-200 ${isActive
                                                    ? 'bg-primary text-white shadow-md shadow-primary/25 scale-105'
                                                    : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 hover:shadow-sm'}`}
                                            >
                                                {idx + 1}
                                            </button>
                                        )
                                    })
                                }
                            </div>
                            {(!_separa && grades.length > 10) && (
                                <button
                                    className="bg-surface-light dark:bg-surface-dark hover:bg-slate-100 dark:hover:bg-slate-800 text-text-light-secondary dark:text-text-dark-secondary font-bold p-2.5 rounded-xl border border-border-light dark:border-border-dark shadow-sm transition-all hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => setState(s => ({ ...s, pageBlockStart: s.pageBlockStart + 10 }))}
                                    disabled={state.pageBlockStart + 10 >= grades.length}
                                >
                                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                                </button>
                            )}
                        </div>
                    )}

                    <div id="schedule-card" className={`bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-3xl p-6 flex flex-col w-full border border-border-light dark:border-border-dark transition-all duration-500 ${isPrinting ? 'shadow-none border-none p-0' : ''}`}>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 pb-4 border-b border-dashed border-border-light dark:border-border-dark gap-4 md:gap-0">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-primary tracking-widest uppercase mb-1">{periodoAtual}</span>
                                <h3 className="text-2xl font-display font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                                    {isPrinting ? "Grade Curricular" : `${state.id + 1}${g} ${f}`}
                                </h3>
                            </div>
                            <div className={`flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-3 w-full md:w-auto export-ignore ${isPrinting ? 'invisible' : ''}`}>

                                {(g === "ª" && user && !isExpired && !props.hideSave) && (
                                    <button
                                        onClick={handleSave}
                                        disabled={saving || isExpired}
                                        title={isExpired ? "Conta expirada. Renove para salvar." : "Salvar Grade"}
                                        className={`group flex items-center gap-2 bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 dark:hover:bg-primary/30 text-primary dark:text-primary-light text-sm font-bold py-2.5 px-5 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isExpired ? 'cursor-not-allowed opacity-50' : ''}`}
                                    >
                                        {saving ? (
                                            <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                                        ) : (
                                            <span className="material-symbols-outlined text-lg">save</span>
                                        )}
                                        Salvar
                                    </button>
                                )}

                                {g !== "ª" ? "" : (
                                    <button
                                        onClick={handleExportImage}
                                        className="group hidden md:flex items-center gap-2 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium py-2.5 px-5 rounded-xl transition-all shadow-lg shadow-slate-900/20 dark:shadow-white/10 active:scale-95"
                                    >
                                        <span className="material-symbols-outlined text-lg opacity-70 group-hover:opacity-100 transition-opacity">image</span>
                                        Salvar Imagem
                                    </button>
                                )}

                                {/* Render 'fun' (Custom Button/Component) at the end */}
                                {_fun && _fun}
                            </div>
                        </div>

                        {renderTabela()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Comum;
