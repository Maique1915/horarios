import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Comum from './Comum';
import Grafos from '../model/util/Grafos';
import Escolhe from '../model/util/Escolhe';
import { ativas } from '../model/Filtro.jsx';

let _cur = '';
let gr = [];

const GeraGrade = () => {
    const { cur = 'engcomp' } = useParams();
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

    // ### CORREÇÃO PRINCIPAL: Função handleCheck simplificada ###
    function handleCheck(e) {
        const target = e.target;
        const isChecked = target.checked;

        if (target.classList.contains('period-toggle')) {
            const periodKey = target.value;
            const subjectsInPeriod = arr.filter(item => item._se == periodKey); // Changed === to == for potential type coercion issues
            
            setState(prevState => {
                if (prevState.estado === 0) {
                    if (isChecked) {
                        // Adiciona todas as matérias do período
                        const newKeys = [...prevState.keys];
                        const newNames = [...prevState.names];
                        const newCrs = [...prevState.crs];
                        
                        subjectsInPeriod.forEach(subject => {
                            if (!newKeys.includes(subject._re)) {
                                newKeys.push(subject._re);
                                newNames.push(subject._re);
                                newCrs.push(parseInt(subject._ap + subject._at));
                            }
                        });
                        
                        return { ...prevState, keys: newKeys, names: newNames, crs: newCrs };
                    } else {
                        // Remove todas as matérias do período
                        const subjectIds = subjectsInPeriod.map(s => s._re);
                        const newKeys = prevState.keys.filter(key => !subjectIds.includes(key));
                        const newNames = prevState.names.filter(name => !subjectIds.includes(name));
                        const newCrs = prevState.crs.filter((cr, index) => !subjectIds.includes(prevState.keys[index]));
                        
                        return { ...prevState, keys: newKeys, names: newNames, crs: newCrs };
                    }
                } else if (prevState.estado === 1) {
                    if (isChecked) {
                        // Adiciona todas as matérias do período à lista de exclusão
                        const subjectIds = subjectsInPeriod.map(s => s._re);
                        const newX = [...new Set([...prevState.x, ...subjectIds])];
                        return { ...prevState, x: newX };
                    } else {
                        // Remove todas as matérias do período da lista de exclusão
                        const subjectIds = subjectsInPeriod.map(s => s._re);
                        const newX = prevState.x.filter(id => !subjectIds.includes(id));
                        return { ...prevState, x: newX };
                    }
                }
                return prevState;
            });
        } 
        else if (target.classList.contains('subject-checkbox')) {
            // Lógica para checkboxes individuais (mantida similar)
            if (state.estado === 0) {
                setState(prevState => {
                    const keys = [...prevState.keys];
                    const names = [...prevState.names];
                    const crs = [...prevState.crs];

                    if (isChecked) {
                        if (!keys.includes(target.value)) {
                            keys.push(target.value);
                            names.push(target.id);
                            crs.push(parseInt(target.name));
                        }
                    } else {
                        const i = keys.indexOf(target.value);
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
                    x: isChecked 
                        ? [...prevState.x, target.id] 
                        : prevState.x.filter(id => id !== target.id)
                }));
            }
        }
    }

    // ### CORREÇÃO: Função IPeriodDivs atualizada ###
    function IPeriodDivs({ periodKey, subjectsData }) {
        const allSubjectIdsInPeriod = subjectsData.map(s => s._re);
        
        const areAllSelected = allSubjectIdsInPeriod.length > 0 &&
            allSubjectIdsInPeriod.every(id => {
                if (state.estado === 0) {
                    return state.keys.includes(id); // Changed from .names to .keys
                } else {
                    return state.x.includes(id);
                }
            });

        const areSomeSelected = allSubjectIdsInPeriod.length > 0 &&
            allSubjectIdsInPeriod.some(id => {
                if (state.estado === 0) {
                    return state.keys.includes(id); // Changed from .names to .keys
                } else {
                    return state.x.includes(id);
                }
            });

        return (
            <details className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 px-4 group" open>
                <summary className="flex cursor-pointer items-center justify-between gap-6 py-3">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            className="period-toggle h-5 w-5 rounded border-slate-300 dark:border-slate-600 border-2 bg-transparent text-primary checked:bg-primary checked:border-primary checked:bg-[image:var(--checkbox-tick-svg)] focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900/50 focus:ring-primary/50 focus:outline-none"
                            id={`t_${periodKey}`}
                            value={periodKey}
                            onChange={handleCheck}
                            checked={areAllSelected}
                            ref={input => {
                                if (input) {
                                    input.indeterminate = areSomeSelected && !areAllSelected;
                                }
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-slate-900 dark:text-white text-base font-semibold leading-normal">{`${periodKey}º Período`}</span>
                    </div>
                    <div className="text-slate-900 dark:text-white group-open:rotate-180 transition-transform">
                        <span className="material-symbols-outlined">expand_more</span>
                    </div>
                </summary>
                <div className="border-t border-slate-200 dark:border-slate-800 -mx-4">
                    <div id={`subject-group-${periodKey}`} className="px-4 divide-y divide-slate-200 dark:divide-slate-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4">
                        {subjectsData.map(item => {
                            const isChecked = (state.estado === 0)
                                ? state.keys.includes(item._re) // Changed from .names to .keys
                                : state.x.includes(item._re);

                            return (
                                <label className="flex items-center gap-x-4 py-4 cursor-pointer" key={item._re}>
                                    <input
                                        type="checkbox"
                                        name={String(item._ap + item._at)}
                                        checked={isChecked}
                                        className="subject-checkbox h-5 w-5 rounded border-slate-300 dark:border-slate-600 border-2 bg-transparent text-primary checked:bg-primary checked:border-primary checked:bg-[image:var(--checkbox-tick-svg)] focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900/50 focus:ring-primary/50 focus:outline-none"
                                        id={item._re}
                                        value={item._re}
                                        onChange={handleCheck}
                                    />
                                    <p className="text-slate-800 dark:text-slate-200 text-base font-normal leading-normal flex-1">
                                        {item._re} - {item._di} ({item._ap + item._at} CP)
                                    </p>
                                </label>
                            );
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
            const pe = periodo(remove(arr));

            return (
                <section>
                    <div className="flex flex-wrap justify-between gap-3 pb-4">
                        <p className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">Quais matérias você já fez?</p>
                    </div>
                    <div className="mb-4 text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
                        <p>Você selecionou <span className="font-semibold text-primary">{state.keys.length} matéria(s)</span></p>
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
                <div className="flex flex-1 flex-col-4 lg:flex-row">
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
}; 

export default GeraGrade;