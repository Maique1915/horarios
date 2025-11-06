import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Comum from './Comum';
import Grafos from '../model/util/Grafos';
import Escolhe from '../model/util/Escolhe';
import { ativas } from '../model/Filtro.jsx';

let _cur = '';
let gr = [];

const GeraGrade = () => {
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
            <label className="flex items-center gap-x-4 py-4 cursor-pointer" key={itemData._re}>
                <input
                    type="checkbox"
                    name={String(itemData._ap + itemData._at)}
                    checked={isChecked}
                    className="h-5 w-5 rounded border-slate-300 dark:border-slate-600 border-2 bg-transparent text-primary checked:bg-primary checked:border-primary checked:bg-[image:var(--checkbox-tick-svg)] focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900/50 focus:ring-primary/50 focus:outline-none"
                    id={itemData._re}
                    value={key}
                    onChange={handleCheck}
                />
                <p className="text-slate-800 dark:text-slate-200 text-base font-normal leading-normal flex-1">{itemData._re} - {itemData._di} ({itemData._ap + itemData._at} CP)</p>
            </label>
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
            <details className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 px-4 group" open="">
                <summary className="flex cursor-pointer items-center justify-between gap-6 py-3">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            className="period-toggle h-5 w-5 rounded border-slate-300 dark:border-slate-600 border-2 bg-transparent text-primary checked:bg-primary checked:border-primary checked:bg-[image:var(--checkbox-tick-svg)] focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900/50 focus:ring-primary/50 focus:outline-none"
                            id={`t_${periodKey}`}
                            value={periodKey}
                            onChange={handleCheck}
                            checked={areAllSelected}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-slate-900 dark:text-white text-base font-semibold leading-normal">{`${periodKey}º Período`}</span>
                    </div>
                    <div className="text-slate-900 dark:text-white group-open:rotate-180 transition-transform">
                        <span className="material-symbols-outlined">expand_more</span>
                    </div>
                </summary>
                <div className="border-t border-slate-200 dark:border-slate-800 -mx-4">
                    <div className="px-4 divide-y divide-slate-200 dark:divide-slate-800">
                        {subjectsData.map(item => {
                            const originalIndex = arr.findIndex(i => i._re === item._re);
                            const key = (state.estado === 0) ? originalIndex : item._re;
                            return renderPeriodoItem(key, item);
                        })}
                    </div>
                </div>
            </details>
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
                <section>
                    <div className="flex flex-wrap justify-between gap-3 pb-4">
                        <p className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">Quais matérias você já fez?</p>
                    </div>
                    <div className="mb-4 text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
                        <p>Você selecionou <span className="font-semibold text-primary">{state.names.length} matéria(s)</span></p>
                        <p>Totalizando <span className="font-semibold text-primary">{state.crs.reduce((a, b) => a + b, 0)} crédito(s)</span></p>
                    </div>
                    <div className="flex flex-col py-4 gap-4">
                        {Object.keys(pe).map(key => (
                            <IPeriodDivs key={key} periodKey={key} subjectsData={pe[key]} />
                        ))}
                    </div>
                    <div className="flex justify-end mt-6">
                        <button onClick={() => mudaTela(1)} className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors">Próximo</button>
                    </div>
                </section>
            );
        } else if (state.estado === 1) {
            const cr = state.crs.reduce((a, b) => a + b, 0);
            gr = new Grafos(arr, cr, state.names).matriz();
            const pe = periodo(remove(gr));
            const str = `Você não deseja fazer ${state.x.length} matéria(s)`;

            return (
                <section>
                    <div className="flex flex-wrap justify-between gap-3 pb-4">
                        <p className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">Quais matérias você não quer fazer?</p>
                    </div>
                    <div className="mb-4 text-slate-500 dark:text-slate-400 text-base font-normal leading-normal"><p>{str}</p></div>
                    <div className="flex flex-col py-4 gap-4">
                        {Object.keys(pe).length > 0 ?
                            Object.keys(pe).map(key => (
                                <IPeriodDivs key={key} periodKey={key} subjectsData={pe[key]} />
                            )) :
                            <h3 className="text-lg font-semibold text-center text-slate-900 dark:text-white">Parabéns, você concluiu todas as matérias!</h3>
                        }
                    </div>
                    <div className="flex justify-between mt-6">
                        <button onClick={() => mudaTela(0)} className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-base font-bold leading-normal tracking-[0.015em] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Voltar</button>
                        {Object.keys(pe).length > 0 && <button onClick={() => mudaTela(2)} className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-4 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors">Gerar Grades</button>}
                    </div>
                </section>
            );
        } else {
             const m = gr.filter(item => !state.x.includes(item._re));
             let gp = new Escolhe(m, cur).exc();
             gp = gp.slice(0, 50);

            const b = <button onClick={() => mudaTela(1)} className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-base font-bold leading-normal tracking-[0.015em] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Voltar</button>;
            return <Comum materias={gp} tela={2} fun={b} cur={cur} separa={false} g={"ª"} f={" Grade Possível"} />;
        }
    }

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root">
            {/* Top Navigation Bar */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 px-6 sm:px-10 py-3 bg-white dark:bg-background-dark sticky top-0 z-10">
                <div className="flex items-center gap-4 text-slate-900 dark:text-white">
                    <div className="size-6 text-primary">
                        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path clipRule="evenodd" d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z" fill="currentColor" fillRule="evenodd"></path>
                        </svg>
                    </div>
                    <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">University Course Selection</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
                        <span className="material-symbols-outlined text-lg">person</span>
                    </button>
                    <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
                        <span className="material-symbols-outlined text-lg">logout</span>
                    </button>
                </div>
            </header>
            {/* Main Content Area */}
            <div className="layout-container flex h-full grow flex-col">
                <div className="flex flex-1 flex-col lg:flex-row">
                    {/* Left Column: Course Selection */}
                    <main className="w-full lg:w-2/3 p-4 sm:p-6 lg:p-8">
                        <div className="layout-content-container flex flex-col w-full">
                            {/* Page Heading */}
                            <div className="flex flex-wrap justify-between gap-3 pb-4">
                                <p className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">Course &amp; Subject Selection</p>
                            </div>
                            {/* Search Bar */}
                            <div className="py-3">
                                <label className="flex flex-col min-w-40 h-12 w-full">
                                    <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                                        <div className="text-slate-500 dark:text-slate-400 flex border-none bg-slate-100 dark:bg-slate-800 items-center justify-center pl-4 rounded-l-lg border-r-0">
                                            <span className="material-symbols-outlined">search</span>
                                        </div>
                                        <input className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-slate-100 dark:bg-slate-800 h-full placeholder:text-slate-500 dark:placeholder:text-slate-400 px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal" placeholder="Search by subject name or code" value=""/>
                                    </div>
                                </label>
                            </div>
                            {/* Accordions for Semesters */}
                            <div className="flex flex-col py-4 gap-4">
                                {tela()}
                            </div>
                        </div>
                    </main>
                    {/* Right Column: Selection Summary Sidebar */}
                    <aside className="w-full lg:w-1/3 lg:min-w-[380px] lg:max-w-[420px] p-4 sm:p-6 lg:p-8 lg:border-l lg:border-slate-200 dark:lg:border-slate-800">
                        <div className="sticky top-24">
                            <div className="flex flex-col gap-6 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">My Selection Summary</h3>
                                {/* Selected Subjects List */}
                                <div className="flex flex-col gap-3 border-t border-b border-slate-200 dark:border-slate-800 py-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <p className="text-slate-800 dark:text-slate-200">COMP101 - Intro to Programming</p>
                                        <p className="text-slate-500 dark:text-slate-400">15 CP</p>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <p className="text-slate-800 dark:text-slate-200">MATH105 - Calculus &amp; Apps 1</p>
                                        <p className="text-slate-500 dark:text-slate-400">15 CP</p>
                                    </div>
                                </div>
                                {/* Total Credit Points */}
                                <div className="flex justify-between items-center">
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">Total Credit Points:</p>
                                    <p className="text-lg font-bold text-primary">30 CP</p>
                                </div>
                                {/* Action Buttons */}
                                <div className="flex flex-col gap-3 pt-2">
                                    <button className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 bg-primary text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 focus:ring-2 focus:ring-primary/50 focus:outline-none">
                                        Confirm &amp; Enroll
                                    </button>
                                    <button className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 bg-primary/20 dark:bg-primary/20 text-primary dark:text-primary-300 gap-2 text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/30 focus:ring-2 focus:ring-primary/50 focus:outline-none">
                                        Save as Draft
                                    </button>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );

export default GeraGrade;