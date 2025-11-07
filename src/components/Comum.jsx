import React, { useState } from 'react';
import { horarios, dimencao } from '../model/Filtro';

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


    // Desestruturando a prop 'separa' para fácil acesso
    let { cur: _cur, fun: _fun, separa: _separa, g, f } = props;
    _cur = _cur || window.location.href.split("/")[3] || "engcomp";

    const h = horarios(_cur) || [];
    const [th, td] = dimencao(_cur);
    const dias = diasSemana.slice(0, td);

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


    function renderCelula(conteudo, cor, key) {
        return <td key={key} className="border p-2 text-center text-sm" style={{ backgroundColor: cor }}>{conteudo}</td>;
    }

    function renderLinha(numLinha) {
        if (!grades[state.id] || !h[numLinha]) return null;
        const celulas = grades[state.id][numLinha].map((conteudo, index) =>
            renderCelula(conteudo, coresGrade[state.id][numLinha][index], `cell-${numLinha}-${index}`)
        );
        return (
            <tr key={`row-${numLinha}`} className="h-16">
                <td className="border p-2 whitespace-nowrap">{`${h[numLinha][0]} - ${h[numLinha][1]}`}</td>
                {celulas}
            </tr>
        );
    }

    function renderIntervalo(key) {
        return <tr key={key}><td colSpan={td + 1} className="bg-gray-800 text-white text-center p-1">Intervalo</td></tr>;
    }

    function renderTabela() {
        if (!grades || grades.length === 0 || !grades[state.id]) return <p className="text-center my-4">Não há grades para exibir.</p>;
        const corpoTabela = [];
        for (let i = 0; i < th; i++) {
            if (i > 0 && h[i] && h[i-1] && h[i][0] !== h[i - 1][1]) {
                 corpoTabela.push(renderIntervalo(`interval-${i}`));
            }
            corpoTabela.push(renderLinha(i));
        }
        return (
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-237px)]">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border p-2">Horário</th>
                            {dias.map(dia => <th key={dia} className="border p-2 w-1/5">{dia}</th>)}
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
                            onClick={() => setState(s => ({ ...s, id: actualPageIndex }))}
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
        <div className={'flex flex-col items-center'}>
            {renderPaginacao()}
            <div className="bg-white shadow-md rounded-lg p-4 flex flex-col flex-1 w-[calc(100vw-30px)]">

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
