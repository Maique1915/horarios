'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Comum from './Comum';
import Grafos from '../model/util/Grafos';
import Escolhe from '../model/util/Escolhe';
import { ativas, horarios, dimencao } from '../model/Filtro.jsx';

import MapaMental from './MapaMental'; // Importar o MapaMental
import LoadingSpinner from './LoadingSpinner';

const GeraGrade = () => {
    const params = useParams();
    const cur = params?.cur || 'engcomp';
    // const navigate = useNavigate(); // Não é mais necessário para o mapa
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
    const [arr, setArr] = useState([]);
    const [possibleGrades, setPossibleGrades] = useState([]);
    const [courseSchedule, setCourseSchedule] = useState([]);
    const [courseDimension, setCourseDimension] = useState([0, 0]);
    const [loading, setLoading] = useState(true);

    const _cur = useRef(cur);
    const [cacheInfo, setCacheInfo] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Reset do estado se o curso mudou
                if (cur !== _cur.current) {
                    _cur.current = cur;
                    setState({ names: [], keys: [], crs: [], estado: 0, x: [] });
                }

                const [data, schedule, dimension] = await Promise.all([
                    ativas(cur),
                    horarios(cur),
                    dimencao(cur)
                ]);
                setArr(data);
                setCourseSchedule(schedule);
                setCourseDimension(dimension);
            } catch (error) {
                console.error("Error fetching data for GeraGrade:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [cur]);

    useEffect(() => {
        const calculatePossibleGrades = async () => {
            if (state.estado === 2 && gradesResult.length > 0) {
                console.log('GeraGrade: Calculando grades possíveis...');
                console.log('GeraGrade: gradesResult length:', gradesResult.length);
                console.log('GeraGrade: state.x:', state.x);

                const m = gradesResult.filter(item => !state.x.includes(item._re));
                console.log('GeraGrade: Matérias após filtro:', m.length);

                const escolhe = await new Escolhe(m, cur).init();
                let gp = escolhe.exc();
                console.log('GeraGrade: Grades geradas:', gp.length);

                setPossibleGrades(gp.slice(0, 50));
                console.log('GeraGrade: possibleGrades atualizado com', gp.slice(0, 50).length, 'grades');
            } else {
                console.log('GeraGrade: Não calculando grades. Estado:', state.estado, 'gradesResult:', gradesResult.length);
            }
        };
        calculatePossibleGrades();
    }, [state.estado, state.x, gradesResult, cur]);

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
            console.log('mudaTela(1): Créditos totais:', cr);
            console.log('mudaTela(1): Matérias feitas (state.names):', state.names);
            console.log('mudaTela(1): Total de disciplinas (arr):', arr.length);
            const calculatedGr = new Grafos(arr, cr, state.names).matriz();
            console.log('mudaTela(1): Matérias que pode fazer (calculatedGr):', calculatedGr.length);
            console.log('mudaTela(1): Primeiras 3 matérias calculadas:', calculatedGr.slice(0, 3).map(m => ({ _re: m._re, _di: m._di, _pr: m._pr })));
            setGradesResult(calculatedGr);
            setState(e => ({ ...e, estado: i }));
        } else {
            setState(e => ({ ...e, estado: i }));
        }
        window.scrollTo(0, 0);
    }

    const handleOpenMapaMental = () => {
        setState(e => ({ ...e, estado: 4 })); // Mudar para o estado do mapa
    };

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
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Nenhuma matéria selecionada
                </p>
            )
        return (
            <div className="flex flex-row sm:flex-row gap-3 sm:gap-6 items-center">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        Matérias:
                    </p>
                    <p className="text-lg font-bold text-primary">
                        {state.names.length}
                    </p>
                </div>
                <div className="hidden sm:block w-px h-6 bg-border-light dark:bg-border-dark"></div>
                <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        Créditos:
                    </p>
                    <p className="text-lg font-bold text-primary">
                        {state.crs.reduce((a, b) => a + b, 0)}
                    </p>
                </div>
            </div>
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
            const pe = periodo(remove(gradesResult));

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
            const b = <button onClick={() => mudaTela(1)} className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 py-2 px-4 bg-gray-300 text-gray-800 text-base font-bold leading-normal tracking-[0.015em] hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:outline-none">Voltar</button>;

            // Mostra loading enquanto as grades estão sendo calculadas
            if (possibleGrades.length === 0 && gradesResult.length > 0) {
                return (
                    <div className="flex flex-col items-center justify-center min-h-screen">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                        <p className="text-text-light-secondary dark:text-text-dark-secondary mb-2">
                            Calculando grades possíveis...
                        </p>
                        <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
                            Processando {gradesResult.length} disciplinas
                        </p>
                    </div>
                );
            }

            return (
                <Comum
                    materias={possibleGrades}
                    tela={2}
                    fun={b}
                    cur={cur}
                    separa={false}
                    g={"ª"}
                    f={" Grade Possível"}
                    courseSchedule={courseSchedule}
                    courseDimension={courseDimension}
                />
            );
        }
    }

    if (loading) {
        return (
            <LoadingSpinner
                message="Carregando dados da grade..."
            />
        );
    }

    if (state.estado === 4) {
        return (
            <MapaMental
                subjectStatus={{
                    feitas: state.names,
                    podeFazer: gradesResult.map(d => d._re),
                }}
                onVoltar={() => setState(e => ({ ...e, estado: 1 }))}
            />
        );
    }

    if (state.estado === 2)
        return renderStepContent()
    return (

        <>
            <aside className="flex flex-col items-center p-4  mx-auto ">
                <div className="px-4 py-4 w-full">
                    {/* Primeira Linha: Título e Botões */}
                    <div className="flex w-full lg:flex-row sm:flex-col  lg:justify-between sm:justify-center sm:align-center sm:gap-3 lg:gap-4">
                        {/* Título */}
                        <h1 className="text-2xl font-bold text-text-light-primary dark:text-text-dark-primary lg:text-left">
                            {getStepTitle()}
                        </h1>

                        {/* Botões */}
                        <div className="flex flex-wrap gap-2 justify-right sm:justify-center lg:justify-end items-center">
                            {state.estado === 1 && (
                                <button
                                    onClick={() => mudaTela(0)}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark hover:bg-surface-light dark:hover:bg-surface-dark"
                                >
                                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                                    <span>Voltar</span>
                                </button>
                            )}

                            {state.estado === 0 && (
                                <button
                                    onClick={() => mudaTela(1)}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors bg-primary text-white hover:bg-primary/90 shadow-sm"
                                >
                                    <span>Avançar</span>
                                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                </button>
                            )}

                            {state.estado === 1 && (
                                <>
                                    <button
                                        onClick={handleOpenMapaMental}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors bg-blue-500 text-white hover:bg-blue-600 shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-lg">account_tree</span>
                                        <span>Cronograma</span>
                                    </button>
                                    <button
                                        onClick={() => mudaTela(2)}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors bg-primary text-white hover:bg-primary/90 shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-lg">grid_view</span>
                                        <span>Gerar Grades</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Segunda Linha: Descrição/Contadores - Centralizado */}
                    <div className="flex justify-center items-center mt-4">
                        {getStepDescription()}
                    </div>
                </div>
            </aside>


            <div className="font-display bg-background-light dark:bg-background-dark min-h-screen">
                <div className="max-w-7xl mx-auto">
                    <div className="px-4 py-6">
                        <div className="layout-content-container flex flex-col w-full">
                            {renderStepContent()}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GeraGrade;