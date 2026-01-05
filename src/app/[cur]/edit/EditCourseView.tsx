import React from 'react';
import Select from 'react-select';
import DisciplinaForm from '../../../components/DisciplinaForm';
import DisciplinaTable from '../../../components/DisciplinaTable';
import LoadingSpinner, { SavingSpinner } from '../../../components/LoadingSpinner';
import { useEditCourseController } from './useEditCourseController';

// --- Views ---

const LoadingView = () => <LoadingSpinner message="Carregando disciplinas do curso..." />;

const ErrorView = ({ error }: { error: any }) => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
            <p className="text-xl font-bold text-red-500 mb-2">Erro ao carregar dados</p>
            <p className="text-text-light-secondary dark:text-text-dark-secondary">{error?.message || error}</p>
        </div>
    </div>
);

// Custom styles for react-select to match the design system
const customSelectStyles = {
    control: (base: any) => ({
        ...base,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderWidth: 0,
        boxShadow: 'none',
    })
};

const FiltersView = ({ ctrl }: { ctrl: ReturnType<typeof useEditCourseController> }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-900/20">
            <div className="sm:col-span-3">
                <Select
                    placeholder="Período"
                    options={ctrl.opcoesPeriodo}
                    onChange={(opt: any) => ctrl.setFiltroPeriodo(opt)}
                    isClearable
                    classNamePrefix="select"
                    classNames={{
                        control: () => '!border-slate-300 dark:!border-slate-700 !bg-white dark:!bg-slate-900 !rounded-lg !text-sm !min-h-[40px]',
                        menu: () => '!bg-white dark:!bg-slate-800 !border !border-slate-200 dark:!border-slate-700 !rounded-lg !mt-1',
                        option: () => '!text-sm hover:!bg-slate-100 dark:hover:!bg-slate-700 !text-slate-800 dark:!text-slate-200',
                        singleValue: () => '!text-slate-800 dark:!text-slate-200',
                        placeholder: () => '!text-slate-400'
                    }}
                    styles={customSelectStyles}
                />
            </div>
            <div className="sm:col-span-2">
                <Select
                    placeholder="Tipo"
                    options={ctrl.opcoesEl}
                    onChange={(opt: any) => ctrl.setFiltroEl(opt)}
                    isClearable
                    classNamePrefix="select"
                    classNames={{
                        control: () => '!border-slate-300 dark:!border-slate-700 !bg-white dark:!bg-slate-900 !rounded-lg !text-sm !min-h-[40px]',
                        menu: () => '!bg-white dark:!bg-slate-800 !border !border-slate-200 dark:!border-slate-700 !rounded-lg !mt-1',
                        option: () => '!text-sm hover:!bg-slate-100 dark:hover:!bg-slate-700 !text-slate-800 dark:!text-slate-200',
                        singleValue: () => '!text-slate-800 dark:!text-slate-200',
                        placeholder: () => '!text-slate-400'
                    }}
                    styles={customSelectStyles}
                />
            </div>
            <div className="sm:col-span-3">
                <Select
                    placeholder="Status"
                    options={ctrl.opcoesStatus}
                    onChange={(opt: any) => ctrl.setFiltroStatus(opt)}
                    isClearable
                    classNamePrefix="select"
                    classNames={{
                        control: () => '!border-slate-300 dark:!border-slate-700 !bg-white dark:!bg-slate-900 !rounded-lg !text-sm !min-h-[40px]',
                        menu: () => '!bg-white dark:!bg-slate-800 !border !border-slate-200 dark:!border-slate-700 !rounded-lg !mt-1',
                        option: () => '!text-sm hover:!bg-slate-100 dark:hover:!bg-slate-700 !text-slate-800 dark:!text-slate-200',
                        singleValue: () => '!text-slate-800 dark:!text-slate-200',
                        placeholder: () => '!text-slate-400'
                    }}
                    styles={customSelectStyles}
                />
            </div>
            <div className="sm:col-span-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <span className="material-symbols-outlined text-xl">search</span>
                    </div>
                    <input
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm shadow-sm transition-all h-[40px]"
                        placeholder="Pesquisar disciplina..."
                        value={ctrl.filtroTexto}
                        onChange={(e) => ctrl.setFiltroTexto(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};

export default function EditCourseView({ ctrl }: { ctrl: ReturnType<typeof useEditCourseController> }) {
    if (ctrl.loading) return <LoadingView />;
    if (ctrl.error) return <ErrorView error={ctrl.error} />;

    return (
        <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark min-h-screen">
            {/* Overlay de salvamento */}
            {ctrl.syncing && <SavingSpinner message="Salvando dados..." />}

            <div className="mx-auto max-w-[1920px] p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-display font-bold leading-tight tracking-tight text-text-light-primary dark:text-text-dark-primary">
                            Editar Curso: {ctrl.cur?.toUpperCase()}
                        </h1>
                        <p className="text-base font-normal leading-normal text-text-light-secondary dark:text-text-dark-secondary">
                            Gerencie a grade curricular e disciplinas específicas deste curso.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            className={`flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-11 px-5 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light-primary dark:text-text-dark-primary text-sm font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed group`}
                            onClick={ctrl.onRefreshClick}
                            disabled={ctrl.syncing}
                        >
                            <span className="material-symbols-outlined text-xl group-hover:rotate-180 transition-transform duration-500">refresh</span>
                            <span className="truncate">Recarregar</span>
                        </button>

                        <button
                            className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-11 px-5 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light-primary dark:text-text-dark-primary text-sm font-bold shadow-sm hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => window.location.href = `/${ctrl.cur}/turmas`}
                            disabled={ctrl.syncing}
                        >
                            <span className="material-symbols-outlined text-xl text-primary">calendar_month</span>
                            <span className="truncate">Ver Grades</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Left Column: Table and Filters */}
                    <div className="lg:col-span-3 flex flex-col gap-6">
                        <div className="rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm overflow-hidden">
                            {/* Filters Header */}
                            <FiltersView ctrl={ctrl} />

                            <DisciplinaTable
                                data={ctrl.disciplinasFiltradas}
                                handleEditDisciplina={ctrl.handleEditDisciplinaInteraction}
                                removeDisciplina={ctrl.handleRemoveDisciplinaInteraction}
                                handleToggleStatus={ctrl.toggleStatus}
                                selectedId={ctrl.editingDisciplineId}
                            />
                        </div>
                    </div>

                    {/* Right Column: Form */}
                    <div className="lg:col-span-2">
                        <div className="sticky top-6">
                            <DisciplinaForm
                                disciplina={ctrl.editingDisciplina || ctrl.newDisciplina}
                                onSubmit={ctrl.editingDisciplina ? ctrl.handleSaveDisciplinaInteraction : ctrl.handleAddDisciplinaInteraction}
                                onCancel={ctrl.handleCancelFormInteraction}
                                cur={ctrl.cur}
                                isReviewing={false}
                                disciplinas={ctrl.disciplinas}
                            />
                        </div>
                    </div>
                </div>
            </div >
        </main >
    );
};
