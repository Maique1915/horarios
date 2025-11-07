import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Comum from './Comum';
import Grafos from '../model/util/Grafos';
import Escolhe from '../model/util/Escolhe';
import { ativas } from '../model/Filtro.jsx';

const GeraGrade = () => {
    const { cur = 'engcomp' } = useParams();
    const [state, setState] = useState({
        names: [],
        keys: [],
        estado: 0,
        x: [],
        crs: []
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [openPeriodKey, setOpenPeriodKey] = useState(null);
    const [gradesResult, setGradesResult] = useState([]);

    useEffect(() => {
        if (cur !== _cur) {
            _cur = cur;
            setState({ names: [], keys: [], crs: [], estado: 0, x: [] });
        }
    }, [cur]);

    const arr = ativas(cur);
    let _cur = '';
    let gr = [];

    function handleCheck(e) {
        const r = e.target;

        if (r.classList.contains('period-toggle')) {
            const isChecked = r.checked;
            const subjectGroup = document.getElementById(r.value);

            if (subjectGroup) {
                const subjectCheckboxes = subjectGroup.getElementsByClassName("subject-checkbox");

                for (const mat of subjectCheckboxes) {
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

    function renderSubjectItem(key, itemData) {
        const isChecked = (state.estado === 0)
            ? state.names.includes(itemData._re)
            : state.x.includes(itemData._re);

        return (
            <label key={itemData._re} className="flex items-center gap-x-4 py-3 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                <input
                    type="checkbox"
                    name={String(itemData._ap + itemData._at)}
                    checked={isChecked}
                    className="subject-checkbox h-5 w-5 rounded border-slate-300 dark:border-slate-600 border-2 bg-transparent text-primary checked:bg-primary checked:border-primary checked:bg-[image:url('data:image/svg+xml,%3csvg viewBox=%270 0 16 16%27 fill=%27rgb(255,255,255)%27 xmlns=%27http://www.w3.org/2000/svg%27%3e%3cpath d=%27M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z%27/%3e%3c/svg%3e')] focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900/50 focus:ring-primary/50 focus:outline-none"
                    id={itemData._re}
                    value={key}
                    onChange={handleCheck}
                />
                <div className="flex flex-col flex-1">
                    <p className="text-slate-800 dark:text-slate-200 text-base font-normal leading-normal">
                        {itemData._re} - {itemData._di}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        {itemData._ap + itemData._at} créditos
                    </p>
                </div>
            </label>
        );
    }

    function PeriodAccordion({ periodKey, subjectsData, openPeriodKey, setOpenPeriodKey }) {
        const allSubjectIdsInPeriod = subjectsData.map(s => s._re);
        const selectedSubjects = (state.estado === 0) ? state.names : state.x;
        const areAllSelected = allSubjectIdsInPeriod.length > 0 &&
            allSubjectIdsInPeriod.every(id => selectedSubjects.includes(id));

        const selectedCount = subjectsData.filter(subject =>
            selectedSubjects.includes(subject._re)
        ).length;

        const isOpen = openPeriodKey === periodKey;

        const handleSummaryClick = (e) => {
            if (isOpen) {
                setOpenPeriodKey(null); // Close if already open
            } else {
                setOpenPeriodKey(periodKey); // Open this one
            }
        };

        return (
            <details className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 group" open={isOpen}>
                <summary className="flex cursor-pointer items-center justify-between gap-6 py-3 px-4" onClick={handleSummaryClick}>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            className="period-toggle h-5 w-5 rounded border-slate-300 dark:border-slate-600 border-2 bg-transparent text-primary checked:bg-primary checked:border-primary checked:bg-[image:url('data:image/svg+xml,%3csvg viewBox=%270 0 16 16%27 fill=%27rgb(255,255,255)%27 xmlns=%27http://www.w3.org/2000/svg%27%3e%3cpath d=%27M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z%27/%3e%3c/svg%3e')] focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900/50 focus:ring-primary/50 focus:outline-none"
                            checked={areAllSelected}
                            onChange={handleCheck}
                            onClick={(e) => e.stopPropagation()}
                            value={periodKey}
                        />
                        <p className="text-slate-900 dark:text-white text-base font-semibold leading-normal">
                            {`${periodKey}º Período | ${selectedCount} matéria(s) selecionada(s)`}
                        </p>
                    </div>
                    <div className="text-slate-900 dark:text-white group-open:rotate-180 transition-transform">
                        <span className="material-symbols-outlined">expand_more</span>
                    </div>
                </summary>
                <div className="border-t border-slate-200 dark:border-slate-800">
                    <div id={periodKey} className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 px-4 divide-y divide-slate-200 dark:divide-slate-800">
                        {subjectsData.map(item => {
                            const originalIndex = arr.findIndex(i => i._re === item._re);
                            const key = (state.estado === 0) ? originalIndex : item._re;
                            return renderSubjectItem(key, item);
                        })}
                    </div>
                </div>
            </details>
        );
    }

    function mudaTela(i) {
        if (i === 1) {
            const cr = state.crs.reduce((a, b) => a + b, 0);
            const calculatedGr = new Grafos(arr, cr, state.names).matriz();
            setState(e => ({ ...e, estado: i, gradesResult: calculatedGr }));
        } else {
            setState(e => ({ ...e, estado: i }));
        }
        window.scrollTo(0, 0);
    }

    function getStepTitle() {
        if (state.estado === 0)
            return "Selecione as máterias já cursadas";
        else if (state.estado === 1)
            return "Exclua as matérias que não deseja fazer agora";
    }

    function getStepDescription() {
        const totalCredits = state.crs.reduce((a, b) => a + b, 0);
        if (state.estado === 0 && state.names.length === 0)
            return (
                <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-2">
                    Nenhuma matéria selecionada
                </p>
            )
        return (
            <>
                <div className="flex justify-between items-center">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                        Matérias Selecionadas:
                    </p>
                    <p className="text-lg font-bold text-primary">
                        {`${state.names.length} CP`}
                    </p>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                        Total de Crédios:
                    </p>
                    <p className="text-lg font-bold text-primary">
                        {`${state.crs.reduce((a, b) => a + b, 0)} CP`}
                    </p>
                </div>
            </>
        )
    }

    function renderStepContent() {
        if (state.estado === 0) {
            const filteredArr = arr.filter(item =>
                item._di.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item._re.toLowerCase().includes(searchTerm.toLowerCase())
            );
            const pe = periodo(remove(filteredArr));

            return (
                <div className="flex flex-col py-4 gap-4">
                    {Object.keys(pe).map(key => (
                        <PeriodAccordion
                            key={key}
                            periodKey={key}
                            subjectsData={pe[key]}
                            openPeriodKey={openPeriodKey}
                            setOpenPeriodKey={setOpenPeriodKey}
                        />
                    ))}
                </div>
            );
        } else if (state.estado === 1) {
            const pe = periodo(remove(state.gradesResult));

            if (Object.keys(pe).length === 0) {
                return (
                    <div className="flex flex-col py-4 gap-4">
                        <details className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 px-4 group">
                            <summary className="flex cursor-pointer items-center justify-between gap-6 py-3">
                                <p className="text-slate-900 dark:text-white text-base font-semibold leading-normal">
                                    Períodos Disponíveis
                                </p>
                                <div className="text-slate-900 dark:text-white group-open:rotate-180 transition-transform">
                                    <span className="material-symbols-outlined">expand_more</span>
                                </div>
                            </summary>
                            <div className="border-t border-slate-200 dark:border-slate-800 -mx-4">
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal p-4">
                                    Parabéns, você concluiu todas as matérias!
                                </p>
                            </div>
                        </details>
                    </div>
                );
            }

            return (
                <div className="flex flex-col py-4 gap-4">
                    {Object.keys(pe).map(key => (
                        <PeriodAccordion
                            key={key}
                            periodKey={key}
                            subjectsData={pe[key]}
                            openPeriodKey={openPeriodKey}
                            setOpenPeriodKey={setOpenPeriodKey}
                        />
                    ))}
                </div>
            );
        } else { // This block is for state.estado === 2
            const m = state.gradesResult.filter(item => !state.x.includes(item._re));
            let gp = new Escolhe(m, cur).exc();
            console.log(gp);

            gp = gp.slice(0, 50);
            const b = <button onClick={() => mudaTela(1)} className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 py-2 px-4 bg-gray-300 text-gray-800 text-base font-bold leading-normal tracking-[0.015em] hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:outline-none">Voltar</button>;
            return <Comum materias={gp} tela={2} fun={b} cur={cur} separa={false} g={"ª"} f={" Grade Possível"} />;
        }
    }


    if (state.estado === 2)
        return renderStepContent()
    return (
        <div className="font-display bg-background-light dark:bg-background-dark h-full flex-grow">
            <div className="layout-container flex h-full grow flex-col">
                <div className="flex flex-1 flex-row">
                    <main className="w-full lg:w-2/3 p-4 sm:p-6 lg:p-8">
                        <div className="layout-content-container flex flex-col w-full">
                            <div className="flex flex-wrap justify-between gap-3 pb-4">
                                <p className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">
                                    {getStepTitle()}
                                </p>
                            </div>

                            <div className="status-info pb-6">
                            </div>

                            {renderStepContent()}
                        </div>
                    </main>

                    <aside className="w-full lg:w-1/3 lg:min-w-[380px] lg:max-w-[420px] p-4 sm:p-6 lg:p-8 lg:border-l lg:border-slate-200 dark:lg:border-slate-800">
                        <div className="sticky top-24">
                            <div className="flex flex-col gap-6 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Sumário</h3>
                                {getStepDescription()}
                                <div className="flex flex-col gap-3">
                                    {state.estado === 1 && (
                                        <button
                                            onClick={() => mudaTela(0)}
                                            className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 bg-primary/20 dark:bg-primary/20 text-primary dark:text-primary-300 gap-2 text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/30 focus:ring-2 focus:ring-primary/50 focus:outline-none"
                                        >
                                            Voltar
                                        </button>
                                    )}
                                    {state.estado === 0 && (
                                        <button
                                            onClick={() => mudaTela(1)}
                                            className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 bg-primary text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 focus:ring-2 focus:ring-primary/50 focus:outline-none"
                                        >
                                            Avançar
                                        </button>
                                    )}
                                    {state.estado === 1 && (
                                        <button
                                            onClick={() => mudaTela(2)}
                                            className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 bg-primary text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 focus:ring-2 focus:ring-primary/50 focus:outline-none"
                                        >
                                            Gerar Grades
                                        </button>
                                    )}
                                </div>                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default GeraGrade;