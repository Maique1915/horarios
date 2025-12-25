import React, { useState, useEffect } from 'react';
import { getDays, getTimeSlots } from '../services/scheduleService';
import { loadClassesForGrid } from '../services/disciplinaService';

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
    if (_separa) {
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

    function renderCelula(numLinha, numCelula, key) {
        const isTransitioning = transitioningTo !== null;
        const newGradeId = transitioningTo !== null ? transitioningTo : state.id;

        // Dados da grade "nova" 
        const conteudoNovo = grades[newGradeId]?.[numLinha]?.[numCelula] || "";
        const corNova = coresGrade[newGradeId]?.[numLinha]?.[numCelula] || "transparent";

        // Dados da grade anterior 
        const conteudoAnterior = previousGrade?.grade?.[numLinha]?.[numCelula] || "";
        const corAnterior = previousGrade?.cores?.[numLinha]?.[numCelula] || "transparent";

        return (
            <td key={key} className="relative border p-0 text-center text-xs" style={{ minHeight: '50px' }}>
                {/* Conteúdo Antigo */}
                {isTransitioning && (
                    <div className="absolute inset-0 p-1 animate-fade-out" style={{ backgroundColor: corAnterior }}>
                        {conteudoAnterior.split('\n').map((line, i) => <div key={i}>{line}</div>)}
                    </div>
                )}

                {/* Conteúdo Novo */}
                <div className={`absolute inset-0 p-1 ${isTransitioning ? 'animate-fade-in' : ''}`} style={{ backgroundColor: corNova }}>
                    {conteudoNovo.split('\n').map((line, i) => <div key={i}>{line}</div>)}
                </div>
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
            <tr key={`row-${numLinha}`}>
                <td className="border p-1 py-4 text-xs whitespace-nowrap">{labelHorario}</td>
                {celulas}
            </tr>
        );
    }

    function renderIntervalo(key) {
        return <tr key={key}><td colSpan={td + 1} className="bg-gray-800 text-white text-center p-1 text-xs">Intervalo</td></tr>;
    }

    function renderTabela() {
        if (!grades || grades.length === 0 || !grades[state.id]) {
            // Show loading or empty state properly
            if (loading) {
                return (
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                );
            }
            return <p className="text-center my-4">Não há grades para exibir.</p>;
        }

        const corpoTabela = [];
        for (let i = 0; i < th; i++) {
            // Logic to check for intervals
            if (i > 0) {
                const prevEnd = dbTimeSlots[i - 1].end_time;
                const currStart = dbTimeSlots[i].start_time;

                // Robust check: ensure times exist and are different
                if (prevEnd && currStart && prevEnd !== currStart) {
                    corpoTabela.push(renderIntervalo(`interval-${i}`));
                }
            }
            corpoTabela.push(renderLinha(i));
        }
        return (
            <div className="overflow-x-auto overflow-y-auto ">
                <table className="w-full border-collapse table-fixed">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border p-1 text-xs w-24">Horário</th>
                            {dias.map(dia => <th key={dia} className="border p-1 text-xs">{dia}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {corpoTabela}
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <div className={'flex flex-col items-center p-4  mx-auto min-w-[calc(1312px)]'}>

            {(grades && grades.length > 1) && (
                <div className={`flex justify-center items-center my-4 ${isPrinting ? 'invisible' : ''}`}>
                    {(!_separa && grades.length > 10) && (
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-l" onClick={() => setState(s => ({ ...s, pageBlockStart: Math.max(0, s.pageBlockStart - 10) }))} disabled={state.pageBlockStart === 0}>{"<<"}</button>
                    )}
                    {
                        grades.slice(state.pageBlockStart, state.pageBlockStart + 10).map((_, i) => {
                            const idx = state.pageBlockStart + i;
                            return (
                                <button key={idx} onClick={() => handlePageChange(idx)} className={`py-2 px-4 w-12 h-10 ${state.id === idx ? 'bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-700 text-white'}`}>{idx + 1}</button>
                            )
                        })
                    }
                    {(!_separa && grades.length > 10) && (
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r" onClick={() => setState(s => ({ ...s, pageBlockStart: s.pageBlockStart + 10 }))} disabled={state.pageBlockStart + 10 >= grades.length}>{">>"}</button>
                    )}
                </div>
            )}

            <div className="bg-white shadow-md rounded-lg p-4 flex flex-col flex-1 w-full max-w-7xl">

                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">{isPrinting ? `${"Grade"} - ${periodoAtual}` : `${state.id + 1}${g} ${f} - ${periodoAtual}`}</h3>
                    <div className={`flex items-center gap-2 ${isPrinting ? 'invisible' : ''}`}>
                        {_fun}
                        {g !== "ª" ? "" : <button onClick={handlePrint} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Printe</button>}
                    </div>
                </div>

                {renderTabela()}
            </div>
        </div>
    );
};

export default Comum;
