import React, { useState, useEffect } from 'react';
import { useCourseDimension, useCourseSchedule, useCourseConfig } from '../model/CourseConfigContext';

const cores = ["#E3F2FD", "#E8F5E9", "#FFFDE7", "#FBE9E7", "#F3E5F5", "#E0F7FA", "#F1F8E9", "#FFF3E0", "#EDE7F6", "#FFEBEE"];
const diasSemana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const rand = Math.floor(Math.random() * cores.length);

const dataAtual = new Date();
const mesAtual = dataAtual.getMonth() + 1;
const anoAtual = dataAtual.getFullYear();
const periodoAtual = `${anoAtual}.${mesAtual > 6 ? "2" : "1"}`;

const Comum = (props) => {
    const [state, setState] = useState({
        id: 0,
        pageBlockStart: 0,
        materias: props.materias
    });
    const [isPrinting, setIsPrinting] = useState(false);
    const [transitioningTo, setTransitioningTo] = useState(null);
    const [previousGrade, setPreviousGrade] = useState(null);

    // Props opcionais para dimensão e horários
    const { courseSchedule: propsSchedule, courseDimension: propsDimension } = props;

    // Sincroniza state.materias quando props.materias muda
    useEffect(() => {
        console.log('Comum: Props materias mudou, atualizando state', props.materias.length);
        setState(prevState => ({
            ...prevState,
            materias: props.materias,
            id: 0, // Reset para primeira página
            pageBlockStart: 0
        }));
    }, [props.materias]);

    // Tenta usar o Context se disponível, senão usa props ou infere dos dados
    let th, td, h, loading, error;
    
    try {
        const dimension = useCourseDimension();
        const schedule = useCourseSchedule();
        const config = useCourseConfig();
        
        th = dimension[0];
        td = dimension[1];
        h = schedule;
        loading = config.loading;
        error = config.error;
        
        console.log('Comum: Usando dados do Context');
    } catch (e) {
        // Context não disponível, tenta usar props
        if (propsDimension && propsSchedule) {
            console.log('Comum: Usando dados das props');
            [th, td] = propsDimension;
            h = propsSchedule;
            loading = false;
            error = null;
        } else {
            // Infere dimensão dos dados de horários das matérias
            console.log('Comum: Inferindo dimensão dos dados das matérias');
            
            const allMaterias = props.materias.flat();
            if (allMaterias.length > 0 && allMaterias[0]._ho) {
                const maxDia = Math.max(...allMaterias.flatMap(m => m._ho?.map(h => h[0]) || []));
                const maxHorario = Math.max(...allMaterias.flatMap(m => m._ho?.map(h => h[1]) || []));
                td = maxDia + 1;
                th = maxHorario + 1;
                
                // Gera horários genéricos
                h = Array.from({ length: th }, (_, i) => [`${7 + i}:00`, `${8 + i}:00`]);
            } else {
                // Valores padrão
                th = 6;
                td = 5;
                h = [
                    ['07:00', '08:00'],
                    ['08:00', '09:00'],
                    ['09:00', '10:00'],
                    ['10:00', '11:00'],
                    ['11:00', '12:00'],
                    ['12:00', '13:00']
                ];
            }
            
            loading = false;
            error = null;
        }
    }

    // Desestruturando a prop 'separa' para fácil acesso
    let { cur: _cur, fun: _fun, separa: _separa, g, f } = props;
    _cur = _cur || window.location.href.split("/")[3] || "engcomp";

    const dias = diasSemana.slice(0, td);

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
                    disciplina._ho.forEach(([dia, horario], i) => {
                        if (dia < td && horario < th) {
                            const nomeMateria = (disciplina._da && disciplina._da[i])
                                ? `${disciplina._di}\n${disciplina._da[i]}`
                                : disciplina._di;
                            if (gradeVazia[horario][dia] === "") {
                                gradeVazia[horario][dia] = nomeMateria + opt;
                            } else {
                                gradeVazia[horario][dia] += ` / ${nomeMateria}${opt}`;
                            }
                            coresVazias[horario][dia] = cores[(index + rand) % cores.length];
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
        if (!grades[state.id] || !h[numLinha]) return null;
        const celulas = Array.from({ length: td }).map((_, numCelula) =>
            renderCelula(numLinha, numCelula, `cell-${numLinha}-${numCelula}`)
        );
        return (
            <tr key={`row-${numLinha}`}>
                <td className="border p-1 py-4 text-xs whitespace-nowrap">{`${h[numLinha][0]} - ${h[numLinha][1]}`}</td>
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
            if (i > 0 && h[i] && h[i-1] && h[i][0] !== h[i - 1][1]) {
                 corpoTabela.push(renderIntervalo(`interval-${i}`));
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
