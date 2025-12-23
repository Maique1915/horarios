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

    // Props opcionais para dimensão e horários -- Mantendo compatibilidade se necessário, mas priorizando DB
    const { courseSchedule: propsSchedule, courseDimension: propsDimension } = props;

    // Desestruturando a prop 'separa' para fácil acesso
    let { cur: _cur, fun: _fun, separa: _separa, g, f } = props;
    _cur = _cur || window.location.href.split("/")[3] || "engcomp";

    // Sincroniza state.materias quando props.materias muda
    useEffect(() => {
        if (props.materias && props.materias.length > 0) {
            console.log('Comum: Props materias mudou, atualizando state', props.materias.length);
            setState(prevState => ({
                ...prevState,
                materias: props.materias,
                id: 0, // Reset para primeira página
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

                // Se não houver matérias via props, carrega do DB
                if (!props.materias || props.materias.length === 0) {
                    const gridData = await loadClassesForGrid();
                    const filteredData = gridData.filter(item => item._cu === _cur);
                    setState(prevState => ({
                        ...prevState,
                        materias: filteredData
                    }));
                }

            } catch (error) {
                console.error("Erro ao carregar dados do cronograma:", error);
            } finally {
                setScheduleLoading(false);
            }
        };
        fetchScheduleData();
    }, [_cur]); // Adicionado dependência de _cur e removido props.materias para evitar loop se fosse dependência, mas a lógica interna cuida disso

    // Determina se está carregando (prioridade para dados do DB)
    const loading = scheduleLoading;
    const error = null; // Simplificação por enquanto

    const th = dbTimeSlots.length;
    const td = dbDays.length;

    // Usando nomes dos dias do banco
    const dias = dbDays.map(d => d.name);

    // Só mostra loading se Context existe E está carregando
    if (loading && !th) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-text-light-secondary dark:text-text-dark-secondary">
                        Carregando horários...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-red-500">
                    Erro ao carregar configuração do curso: {error}
                </div>
            </div>
        );
    }

    function separarPorSemestre(arr) {
        const aux = [];
        const aux2 = arr[0] || [];
        for (const i of aux2) {
            while (aux.length < i._se) {
                aux.push([]);
            }
            aux[i._se - 1].push(i);
        }
        return aux.filter(e => e.length > 0);
    }

    const bd = _separa ? separarPorSemestre([...state.materias]) : [...state.materias];

    console.log('Comum: Criando grades');
    console.log('Comum: state.materias.length:', state.materias.length);
    console.log('Comum: bd.length:', bd.length);
    console.log('Comum: _separa:', _separa);

    function criarGrade() {
        const grades = [];
        const coresGrade = [];

        for (const semestre of bd) {
            const gradeVazia = Array.from({ length: th }, () => Array(td).fill(""));
            const coresVazias = Array.from({ length: th }, () => Array(td).fill(""));

            semestre.forEach((disciplina, index) => {
                const opt = !disciplina._el && !disciplina._di.includes(" - OPT") ? " - OPT" : "";

                if (Array.isArray(disciplina._ho)) {
                    disciplina._ho.forEach(([dayId, slotId], i) => {
                        // Encontra índices baseados nos IDs do banco
                        const numDia = dbDays.findIndex(d => d.id === dayId);
                        const numHorario = dbTimeSlots.findIndex(s => s.id === slotId);

                        if (numDia !== -1 && numHorario !== -1) {
                            const nomeMateria = (disciplina._da && disciplina._da[i])
                                ? `${disciplina._di}\n${disciplina._da[i]}`
                                : disciplina._di;

                            // Verifica limites (embora findIndex já ajude, th/td são baseados nos lengths)
                            if (numHorario < th && numDia < td) {
                                if (gradeVazia[numHorario][numDia] === "") {
                                    gradeVazia[numHorario][numDia] = nomeMateria + opt;
                                } else {
                                    gradeVazia[numHorario][numDia] += ` / ${nomeMateria}${opt}`;
                                }
                                coresVazias[numHorario][numDia] = cores[(index + rand) % cores.length];
                            }
                        }
                    });
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
            }, 500); // Duração da animação
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

        // Dados da grade "nova" (a que está na tela ou para a qual estamos transicionando)
        const conteudoNovo = grades[newGradeId]?.[numLinha]?.[numCelula] || "";
        const corNova = coresGrade[newGradeId]?.[numLinha]?.[numCelula] || "transparent";

        // Dados da grade anterior (só existem durante a transição)
        const conteudoAnterior = previousGrade?.grade?.[numLinha]?.[numCelula] || "";
        const corAnterior = previousGrade?.cores?.[numLinha]?.[numCelula] || "transparent";

        return (
            <td key={key} className="relative border p-0 text-center text-xs" style={{ minHeight: '50px' }}>
                {/* Conteúdo Antigo (saindo) */}
                {isTransitioning && (
                    <div className="absolute inset-0 p-1 animate-fade-out" style={{ backgroundColor: corAnterior }}>
                        {conteudoAnterior.split('\n').map((line, i) => <div key={i}>{line}</div>)}
                    </div>
                )}

                {/* Conteúdo Novo (entrando) */}
                <div className={`absolute inset-0 p-1 ${isTransitioning ? 'animate-fade-in' : ''}`} style={{ backgroundColor: corNova }}>
                    {conteudoNovo.split('\n').map((line, i) => <div key={i}>{line}</div>)}
                </div>
            </td>
        );
    }

    function renderLinha(numLinha) {
        if (!grades[state.id]) return null;

        const slot = dbTimeSlots[numLinha];
        const labelHorario = slot ? `${slot.start_time.substring(0, 5)} - ${slot.end_time.substring(0, 5)}` : "???";

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
        console.log('Comum: renderTabela chamado');
        console.log('Comum: grades.length:', grades?.length);
        console.log('Comum: state.id:', state.id);
        console.log('Comum: grades[state.id]:', grades?.[state.id]);

        if (!grades || grades.length === 0 || !grades[state.id]) {
            console.log('Comum: Sem grades para exibir');
            return <p className="text-center my-4">Não há grades para exibir.</p>;
        }

        const corpoTabela = [];
        for (let i = 0; i < th; i++) {
            // Verifica se há um intervalo entre o fim do horário anterior e o início do atual
            if (i > 0 && dbTimeSlots[i] && dbTimeSlots[i - 1]) {
                const prevEnd = dbTimeSlots[i - 1].end_time;
                const currStart = dbTimeSlots[i].start_time;
                if (prevEnd !== currStart) {
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

    function renderPaginacao() {
        const totalPages = grades.length;
        if (totalPages <= 1) return null;

        const showNavButtons = !_separa && totalPages > 10;

        const { pageBlockStart } = state;
        const pagesToRender = showNavButtons
            ? grades.slice(pageBlockStart, pageBlockStart + 10)
            : grades;

        const startIndex = showNavButtons ? pageBlockStart : 0;

        return (
            <div className={`flex justify-center items-center my-4 ${isPrinting ? 'invisible' : ''}`}>
                {showNavButtons && (
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-l"
                        onClick={handlePrevBlock}
                        disabled={pageBlockStart === 0}
                    >
                        {"<<"}
                    </button>
                )}

                {pagesToRender.map((_, index) => {
                    const actualPageIndex = startIndex + index;
                    return (
                        <button
                            key={actualPageIndex}
                            onClick={() => handlePageChange(actualPageIndex)}
                            className={`py-2 px-4 w-12 h-10 ${state.id === actualPageIndex ? 'bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-700 text-white'}`}
                        >
                            {actualPageIndex + 1}
                        </button>
                    );
                })}

                {showNavButtons && (
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r"
                        onClick={handleNextBlock}
                        disabled={pageBlockStart + 10 >= totalPages}
                    >
                        {'>>'}
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className={'flex flex-col items-center p-4  mx-auto min-w-[calc(1312px)]'}>
            {renderPaginacao()}
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
