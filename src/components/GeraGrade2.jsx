import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Comum from './Comum';
import Grafos from '../model/util/Grafos';
import Escolhe from '../model/util/Escolhe';
import { ativas } from '../model/Filtro.jsx';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../asd/components/ui/accordion';


let _cur = '';
let gr = [];

const GeraGrade2 = () => {
    const { cur = 'engcomp' } = useParams(); // Use useParams para obter 'cur'
    const [state, setState] = useState({
        names: [],
        keys: [],
        estado: 0,
        x: [],
        crs: []
    });

    useEffect(() => {
        if (cur !== _cur) {
            _cur = cur;
            setState({ names: [], keys: [], crs: [], estado: 0, x: [] });
        }
    }, [cur]);

    const arr = ativas(cur);

    function handleCheck(e) {
        const r = e.target;

        if (r.classList.contains('period-toggle')) {
            const isChecked = r.checked;
            const subjectGroup = document.getElementById(r.value);

            if (subjectGroup) {
                const subjectCheckboxes = subjectGroup.getElementsByClassName("subject-checkbox");
                
                for (const mat of subjectCheckboxes) {
                    // A lógica aqui já estava correta: ela atualiza o estado de verdade.
                    // O problema era apenas visual no 'period-toggle'.
                    const idNoEstado = (state.estado === 0) 
                        ? state.keys.indexOf(parseInt(mat.value)) 
                        : state.x.indexOf(mat.id);

                    if (isChecked && idNoEstado === -1) {
                        altera(true, mat);
                    } else if (!isChecked && idNoEstado > -1) {
                        altera(false, mat);
                    }
                }
            }
        } 
        else if (r.classList.contains('subject-checkbox')) {
            altera(r.checked, r);
        }
    }

    function altera(add, target) {
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
    
    function remove(m) {
        const aux = [];
        const e = new Set();
        for (const i of m) {
            if (!e.has(i._re)) {
                e.add(i._re);
                if (i._di.includes(" - A") || i._di.includes(" - B")) {
                    i._di = i._di.substring(0, i._di.length - 4);
                } else if (!i._el && !i._di.includes(" - OPT")) {
                    i._di += " - OPT";
                }
                aux.push(i);
            }
        }
        return aux;
    }

    // ### MUDANÇA 1: Simplificamos a função 'periodo' ###
    // Ela agora agrupa os OBJETOS de matéria, não os componentes JSX.
    // Isso nos permite analisar os dados antes de renderizar.
    function periodo(m) {
        const aux = {};
        for (const item of m) {
            if (!aux[item._se]) {
                aux[item._se] = [];
            }
            aux[item._se].push(item);
        }
        return aux;
    }

    function renderPeriodoItem(key, itemData) {
        const isChecked = (state.estado === 0)
            ? state.names.includes(itemData._re)
            : state.x.includes(itemData._re);

        return (
            <div className="subject-item" key={itemData._re}>
                <input
                    type="checkbox"
                    name={String(itemData._ap + itemData._at)}
                    checked={isChecked}
                    className="subject-checkbox"
                    id={itemData._re}
                    value={key}
                    onChange={handleCheck}
                />
                <label htmlFor={itemData._re}>{itemData._di}</label>
            </div>
        );
    }
    
    // ### MUDANÇA 2: O componente 'IPeriodDivs' agora é mais inteligente ###
    // Ele recebe os dados das matérias e calcula se o 'period-toggle' deve estar marcado.
    function IPeriodDivs({ periodKey, subjectsData }) {

        const allSubjectIdsInPeriod = subjectsData.map(s => s._re);
        const selectedSubjects = (state.estado === 0) ? state.names : state.x;
        const areAllSelected = allSubjectIdsInPeriod.length > 0 &&
                               allSubjectIdsInPeriod.every(id => selectedSubjects.includes(id));
        
        return (
            <AccordionItem value={`item-${periodKey}`} className="tab">
                <AccordionTrigger className="tab__label">
                    <input
                        type="checkbox"
                        className="period-toggle"
                        id={`t_${periodKey}`}
                        value={periodKey}
                        onChange={handleCheck}
                        checked={areAllSelected}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <span className="period-label">
                        {`${periodKey}º Período`}
                    </span>
                </AccordionTrigger>
                <AccordionContent className="tab__content">
                    <div className="subject-group" id={String(periodKey)}>
                        {subjectsData.map(item => {
                            const originalIndex = arr.findIndex(i => i._re === item._re);
                            const key = (state.estado === 0) ? originalIndex : item._re;
                            return renderPeriodoItem(key, item);
                        })}
                    </div>
                </AccordionContent>
            </AccordionItem>
        );
    }

    function mudaTela(i) {
        setState(e => ({ ...e, estado: i }));
        window.scrollTo(0, 0);
    }

    function tela() {
        if (state.estado === 0) {
            // A função 'periodo' agora retorna um objeto com arrays de DADOS.
            const pe = periodo(remove(arr));

            return (
                <section className="card">
                    <h2 className="card-title">Quais matérias você já fez?</h2>
                    <div className="status-info">
                        <p>Você selecionou <span className="highlight">{state.names.length} matéria(s)</span></p>
                        <p>Totalizando <span className="highlight">{state.crs.reduce((a, b) => a + b, 0)} crédito(s)</span></p>
                    </div>
                    <div className="period-list">
                        <Accordion type="multiple" className="accordion w-full">
                            {Object.keys(pe).map(key => (
                                <IPeriodDivs key={key} periodKey={key} subjectsData={pe[key]} />
                            ))}
                        </Accordion>
                    </div>
                    <div className="button-container">
                        <button onClick={() => mudaTela(1)} className="primary-button">Próximo</button>
                    </div>
                </section>
            );
        } else if (state.estado === 1) {
            const cr = state.crs.reduce((a, b) => a + b, 0);
            gr = new Grafos(arr, cr, state.names).matriz();
            const pe = periodo(remove(gr));
            const str = `Você não deseja fazer ${state.x.length} matéria(s)`;

            return (
                <section className="card">
                    <h2 className="card-title">Quais matérias você não quer fazer?</h2>
                    <div className="status-info"><p>{str}</p></div>
                    <div className="period-list">
                        <Accordion type="multiple" className="accordion w-full">
                            {Object.keys(pe).length > 0 ?
                                Object.keys(pe).map(key => (
                                    <IPeriodDivs key={key} periodKey={key} subjectsData={pe[key]} />
                                )) :
                                <h3>Parabéns, você concluiu todas as matérias!</h3>
                            }
                        </Accordion>
                    </div>
                    <div className="button-container">
                        <button onClick={() => mudaTela(0)} className="secondary-button">Voltar</button>
                        {Object.keys(pe).length > 0 && <button onClick={() => mudaTela(2)} className="primary-button">Gerar Grades</button>}
                    </div>
                </section>
            );
        } else {
             const m = gr.filter(item => !state.x.includes(item._re));
             let gp = new Escolhe(m, cur).exc();
             gp = gp.slice(0, 50);

            const b = <button onClick={() => mudaTela(1)} className="secondary-button">Voltar</button>;
            return <Comum materias={gp} tela={2} fun={b} cur={cur} separa={false} g={"ª"} f={" Grade Possível"} />;
        }
    }

    return tela();
};

export default GeraGrade;