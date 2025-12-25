import React, { useState, useEffect } from 'react';
import { getDays, getTimeSlots } from '../services/scheduleService';
// Services
import { loadClassesForGrid, saveCurrentEnrollments } from '../services/disciplinaService';
import { useAuth } from '../contexts/AuthContext';

const cores = ["#E3F2FD", "#E8F5E9", "#FFFDE7", "#FBE9E7", "#F3E5F5", "#E0F7FA", "#F1F8E9", "#FFF3E0", "#EDE7F6", "#FFEBEE"];
const rand = Math.floor(Math.random() * cores.length);

const dataAtual = new Date();
const mesAtual = dataAtual.getMonth() + 1;
const anoAtual = dataAtual.getFullYear();
const periodoAtual = `${anoAtual}.${mesAtual > 6 ? "2" : "1"}`;

const Comum = (props) => {
    const [state, setState] = useState({
        id: 0,
        pageBlockStart: 0,
        materias: props.materias || []
    });
    const [isPrinting, setIsPrinting] = useState(false);
    const [transitioningTo, setTransitioningTo] = useState(null);
    const [previousGrade, setPreviousGrade] = useState(null);

    // Auth
    const { user } = useAuth();
    const [saving, setSaving] = useState(false);

    // Dynamic Schedule Data
    const [dbDays, setDbDays] = useState([]);
    const [dbTimeSlots, setDbTimeSlots] = useState([]);
    const [scheduleLoading, setScheduleLoading] = useState(true);

    // Desestruturando a prop 'separa' para fácil acesso
    let { cur: _cur, fun: _fun, separa: _separa, g, f } = props;
    _cur = _cur || window.location.href.split("/")[3] || "engcomp";

    // Sincroniza state.materias quando props.materias muda
    useEffect(() => {
        if (props.materias && props.materias.length > 0) {
            setState(prevState => ({
                ...prevState,
                materias: props.materias,
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
                    const gridData = await loadClassesForGrid(_cur);
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
    }, [_cur]);

    // Determina se está carregando 
    const loading = scheduleLoading;

    const th = dbTimeSlots.length;
    const td = dbDays.length;

    // Usando nomes dos dias do banco
    const dias = dbDays.map(d => d.name);

    function separarPorSemestre(arr) {
        const aux = [];
        const aux2 = arr;
        for (const i of aux2) {
            while (aux.length < i._se) {
                aux.push([]);
            }
            if (aux[i._se - 1]) {
                aux[i._se - 1].push(i);
            }
        }
        return aux.filter(e => e && e.length > 0);
    }

    let bd;
    if (props.tela === 2) {
        bd = state.materias;
    } else if (_separa) {
        bd = separarPorSemestre(state.materias);
    } else {
        bd = [state.materias];
    }

    function criarGrade() {
        if (state.materias.length > 0) {
            console.log("Comum: Starting grade creation with", state.materias.length, "disciplines");
            console.log("Comum: Schedule Refs - Days:", dbDays, "Slots:", dbTimeSlots);
        }

        const grades = [];
        const coresGrade = [];

        for (const semestre of bd) {
            const gradeVazia = Array.from({ length: th }, () => Array(td).fill(""));
            const coresVazias = Array.from({ length: th }, () => Array(td).fill(""));

            semestre.forEach((disciplina, index) => {
                const opt = !disciplina._el && disciplina._di && !disciplina._di.includes(" - OPT") ? " - OPT" : "";

                if (Array.isArray(disciplina._ho)) {
                    disciplina._ho.forEach(([dayId, slotId], i) => {
                        // ROBUST MAPPING: Find index by ID instead of assuming direct index mapping
                        const numDia = dbDays.findIndex(d => d.id === dayId);
                        const numHorario = dbTimeSlots.findIndex(s => s.id === slotId);

                        // Debug mapping failures
                        if (numDia === -1 || numHorario === -1) {
                            console.warn(`Comum: Mapping failed for ${disciplina._di}. DayID: ${dayId} -> Idx: ${numDia}. SlotID: ${slotId} -> Idx: ${numHorario}`);
                        }

                        const nomeMateria = (disciplina._da && disciplina._da[i])
                            ? `${disciplina._di}\n${disciplina._da[i]}`
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
                } else {
                    console.warn(`Comum: Disciplina ${disciplina._di} has invalid _ho:`, disciplina._ho);
                }
            });
            grades.push(gradeVazia);
            coresGrade.push(coresVazias);
        }
        return { grades, coresGrade };
    }

    const { grades, coresGrade } = criarGrade();

    const handlePageChange = (newId) => {
        if (newId !== state.id && transitioningTo === null) {
            setTransitioningTo(newId);
            setPreviousGrade({ grade: grades[state.id], cores: coresGrade[state.id] });
            setTimeout(() => {
                setState(s => ({ ...s, id: newId }));
                setTransitioningTo(null);
                setPreviousGrade(null);
            }, 500);
        }
    };

    const handleNextBlock = () => {
        setState(s => ({ ...s, pageBlockStart: s.pageBlockStart + 10 }));
    };

    const handlePrevBlock = () => {
        setState(s => ({ ...s, pageBlockStart: s.pageBlockStart - 10 }));
    };

    const handlePrint = () => {
        setIsPrinting(true);
        setTimeout(() => {
            setIsPrinting(false);
        }, 7000);
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);

        let materiasParaSalvar;

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
            if (Array.isArray(materiasParaSalvar) && Array.isArray(materiasParaSalvar[0])) {
                materiasParaSalvar = materiasParaSalvar.flat();
            }

            console.log("Saving enrollments:", materiasParaSalvar);
            await saveCurrentEnrollments(user.id, materiasParaSalvar, periodoAtual);
            alert("Grade salva com sucesso em 'Grade Salva' no seu perfil!");
        } catch (error) {
            console.error("Erro ao salvar grade:", error);
            alert("Erro ao salvar grade. Tente novamente.");
        } finally {
            setSaving(false);
        }
    };

    function renderCelula(numLinha, numCelula, key) {
        const isTransitioning = transitioningTo !== null;
        const newGradeId = transitioningTo !== null ? transitioningTo : state.id;

        // Dados da grade "nova" 
        const conteudoNovo = grades[newGradeId]?.[numLinha]?.[numCelula] || "";
        const corNova = coresGrade[newGradeId]?.[numLinha]?.[numCelula] || "transparent";

        // Dados da grade anterior 
        const conteudoAnterior = previousGrade?.grade?.[numLinha]?.[numCelula] || "";
        const corAnterior = previousGrade?.cores?.[numLinha]?.[numCelula] || "transparent";

        const hasContent = conteudoNovo && conteudoNovo.trim() !== "";

        return (
            <td key={key} className="relative p-0.5 align-middle h-14 min-w-[120px] border border-dashed border-border-light/50 transition-all duration-200 hover:bg-background-light/50">
                {/* Empty State visual helper (optional) */}
                {!hasContent && !conteudoAnterior && (
                    <div className="w-full h-full rounded-lg bg-transparent"></div>
                )}

                {/* Conteúdo Antigo (Transition Out) */}
                {isTransitioning && conteudoAnterior && (
                    <div
                        className="absolute inset-0.5 p-1 rounded-lg shadow-sm animate-fade-out overflow-hidden text-center flex flex-col justify-center items-center z-10"
                        style={{ backgroundColor: corAnterior, color: '#333' }}
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
                        className={`absolute inset-0.5 px-1 py-1 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col justify-center items-center text-center cursor-default group border border-black/5 ${isTransitioning ? 'animate-fade-in' : ''}`}
                        style={{ backgroundColor: corNova }}
                    >
                        {conteudoNovo.split('\n').map((line, i) => (
                            <div key={i} className={`text-[10px] text-slate-800 break-words w-full leading-tight ${i === 0 ? 'font-bold text-[11px] mb-0.5' : 'font-medium text-slate-600'}`}>
                                {line}
                            </div>
                        ))}
                    </div>
                )}
            </td>
        );
    }

    function renderLinha(numLinha) {
        if (!grades || !grades[state.id]) return null;

        const slot = dbTimeSlots[numLinha];
        const labelHorario = slot ? `${slot.start_time ? slot.start_time.substring(0, 5) : ""} - ${slot.end_time ? slot.end_time.substring(0, 5) : ""}` : "???";

        const celulas = Array.from({ length: td }).map((_, numCelula) =>
            renderCelula(numLinha, numCelula, `cell-${numLinha}-${numCelula}`)
        );
        return (
            <tr key={`row-${numLinha}`} className="group h-14">
                <td className="p-1 px-2 text-[10px] font-semibold text-slate-500 whitespace-nowrap text-center bg-white border-r border-border-light sticky left-0 z-20 group-hover:text-primary transition-colors">
                    <span className="bg-slate-50 px-1.5 py-0.5 rounded tracking-wide border border-slate-100">{labelHorario}</span>
                </td>
                {celulas}
            </tr>
        );
    }

    function renderIntervalo(key) {
        return (
            <tr key={key}>
                <td colSpan={td + 1} className="py-2 px-0 bg-transparent">
                    <div className="flex items-center justify-center relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-slate-200 border-dashed"></div>
                        </div>
                        <span className="relative z-10 bg-white/80 backdrop-blur text-slate-400 text-[10px] uppercase tracking-widest font-bold px-3 py-0.5 rounded-full border border-slate-100 shadow-sm">
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
                    <div className="flex justify-center items-center h-64 w-full bg-white rounded-2xl shadow-sm border border-border-light">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                );
            }
            return (
                <div className="flex flex-col justify-center items-center h-64 w-full bg-white rounded-2xl shadow-sm border border-border-light text-slate-400">
                    <svg className="w-12 h-12 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
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
            <div className="rounded-2xl border border-border-light/60 overflow-hidden bg-white shadow-sm ring-1 ring-black/5">
                <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-340px)] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    <table className="w-full border-collapse table-fixed min-w-[1000px]">
                        <thead>
                            <tr className="bg-slate-50/80 backdrop-blur-sm border-b border-border-light sticky top-0 z-30">
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-28 bg-slate-50 border-r border-border-light">
                                    Horário
                                </th>
                                {dias.map(dia => (
                                    <th key={dia} className="p-4 text-xs font-bold text-slate-600 uppercase tracking-widest w-full text-center">
                                        {dia}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light/30">
                            {corpoTabela}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className={'flex flex-col items-center p-6 mx-auto w-full max-w-[1400px]'}>

            {(grades && grades.length > 1) && (
                <div className={`flex justify-center items-center gap-1 mb-6 ${isPrinting ? 'invisible' : ''}`}>
                    {(!_separa && grades.length > 10) && (
                        <button
                            className="bg-white hover:bg-slate-50 text-slate-600 font-bold p-2.5 rounded-xl border border-border-light shadow-sm transition-all hover:shadow hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:shadow-sm disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                            onClick={() => setState(s => ({ ...s, pageBlockStart: Math.max(0, s.pageBlockStart - 10) }))}
                            disabled={state.pageBlockStart === 0}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                        </button>
                    )}
                    <div className="flex gap-1 bg-slate-100/50 p-1 rounded-xl border border-border-light/50">
                        {
                            grades.slice(state.pageBlockStart, state.pageBlockStart + 10).map((_, i) => {
                                const idx = state.pageBlockStart + i;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handlePageChange(idx)}
                                        className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all duration-200 ${state.id === idx ? 'bg-primary text-white shadow-md shadow-primary/25 scale-105' : 'text-slate-500 hover:bg-white hover:text-slate-700 hover:shadow-sm'}`}
                                    >
                                        {idx + 1}
                                    </button>
                                )
                            })
                        }
                    </div>
                    {(!_separa && grades.length > 10) && (
                        <button
                            className="bg-white hover:bg-slate-50 text-slate-600 font-bold p-2.5 rounded-xl border border-border-light shadow-sm transition-all hover:shadow hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:shadow-sm disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                            onClick={() => setState(s => ({ ...s, pageBlockStart: s.pageBlockStart + 10 }))}
                            disabled={state.pageBlockStart + 10 >= grades.length}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                        </button>
                    )}
                </div>
            )}

            <div className={`bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 flex flex-col flex-1 w-full border border-border-light transition-all duration-500 ${isPrinting ? 'shadow-none border-none p-0' : ''}`}>

                <div className="flex justify-between items-end mb-6 border-b border-dashed border-border-light pb-4">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-primary tracking-widest uppercase mb-1">{periodoAtual}</span>
                        <h3 className="text-2xl font-display font-bold text-slate-800 tracking-tight">
                            {isPrinting ? "Grade Curricular" : `${state.id + 1}${g} ${f}`}
                        </h3>
                    </div>
                    <div className={`flex items-center gap-3 ${isPrinting ? 'invisible' : ''}`}>
                        {_fun}

                        {(g === "ª" && user) && (
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="group flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary-dark text-sm font-bold py-2.5 px-5 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                                )}
                                Salvar
                            </button>
                        )}

                        {g !== "ª" ? "" : (
                            <button
                                onClick={handlePrint}
                                className="group flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium py-2.5 px-5 rounded-xl transition-all shadow-lg shadow-slate-900/20 active:scale-95"
                            >
                                <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                Imprimir
                            </button>
                        )}
                    </div>
                </div>

                {renderTabela()}
            </div>
        </div>
    );
};

export default Comum;
