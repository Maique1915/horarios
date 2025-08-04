import React, { useState } from 'react';
import '../model/css/Comum.css';
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
                const nomeMateria = disciplina._da ? `${disciplina._di}\n${disciplina._da}` : disciplina._di;

                if (Array.isArray(disciplina._ho)) {
                    disciplina._ho.forEach(([dia, horario]) => {
                        if (dia < td && horario < th) {
                            if (gradeVazia[horario][dia] === "") {
                                gradeVazia[horario][dia] = nomeMateria + opt;
                            } else {
                                gradeVazia[horario][dia] += ` / ${disciplina._di}${opt}`;
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
        return <td key={key} className="grade-cell" style={{ backgroundColor: cor }}>{conteudo}</td>;
    }

    function renderLinha(numLinha) {
        if (!grades[state.id] || !h[numLinha]) return null;
        const celulas = grades[state.id][numLinha].map((conteudo, index) =>
            renderCelula(conteudo, coresGrade[state.id][numLinha][index], `cell-${numLinha}-${index}`)
        );
        return (
            <tr key={`row-${numLinha}`}>
                <td className="time-slot">{`${h[numLinha][0]} - ${h[numLinha][1]}`}</td>
                {celulas}
            </tr>
        );
    }

    function renderIntervalo(key) {
        return <tr key={key}><td colSpan={td + 1} className="interval-row">Intervalo</td></tr>;
    }

    function renderTabela() {
        if (!grades || grades.length === 0 || !grades[state.id]) return <p className="no-grades-message">Não há grades para exibir.</p>;
        const corpoTabela = [];
        for (let i = 0; i < th; i++) {
            if (i > 0 && h[i] && h[i-1] && h[i][0] !== h[i - 1][1]) {
                 corpoTabela.push(renderIntervalo(`interval-${i}`));
            }
            corpoTabela.push(renderLinha(i));
        }
        return (
            <div className="grade-container">
                <table className="grade-table">
                    <thead>
                        <tr>
                            <th className="time-slot-header">Horário</th>
                            {dias.map(dia => <th key={dia}>{dia}</th>)}
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

        // ### MUDANÇA PRINCIPAL AQUI ###
        // Criamos uma variável que define se os botões de navegação devem ser mostrados.
        // A condição é: a prop 'separa' deve ser falsa E o total de páginas deve ser maior que 10.
        const showNavButtons = !_separa && totalPages > 10;

        const { pageBlockStart } = state;
        const pagesToRender = showNavButtons
            ? grades.slice(pageBlockStart, pageBlockStart + 10)
            : grades;

        const startIndex = showNavButtons ? pageBlockStart : 0;

        return (
            <div className="pagination">
                {/* O botão de voltar só aparece se a condição for verdadeira */}
                {showNavButtons && (
                    <button
                        className="nav-button"
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
                            className={`page-button ${state.id === actualPageIndex ? 'active' : ''}`}
                        >
                            {actualPageIndex + 1}
                        </button>
                    );
                })}

                {/* O botão de avançar só aparece se a condição for verdadeira */}
                {showNavButtons && (
                    <button
                        className="nav-button"
                        onClick={handleNextBlock}
                        disabled={pageBlockStart + 10 >= totalPages}
                    >
                        {">>"}
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className={isPrinting ? 'printing-mode' : ''}>
            {renderPaginacao()}
            <div className="comum-container">

                <div className="grade-header">
                    <h3>{isPrinting ? `${"Grade"} - ${periodoAtual}` : `${state.id + 1}${g} ${f} - ${periodoAtual}`}</h3>
                    <div className="actions">
                        {_fun}
                        {isPrinting || g !== "ª" ? "" : <button onClick={handlePrint} className="print-button bi-camera">Printe</button>}
                    </div>
                </div>

                {renderTabela()}
            </div>
        </div>
    );
};

export default Comum;