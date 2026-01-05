import React from 'react';
import Select from 'react-select';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { useClassManagerController } from './useClassManagerController';

// --- Views ---

// Custom styles for react-select
const customSelectStyles = {
    control: (base: any) => ({
        ...base,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderWidth: 0,
        boxShadow: 'none',
    })
};

const ClassesListView = ({ ctrl }: { ctrl: ReturnType<typeof useClassManagerController> }) => {
    return (
        <div className="space-y-4">
            {ctrl.classes.length === 0 ? (
                <div className="text-center py-12 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">class</span>
                    <p className="text-slate-500 font-medium">Nenhuma turma cadastrada</p>
                    <p className="text-sm text-slate-400">Clique em "Nova Turma" para adicionar</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
                    {ctrl.classes.map((turma, index) => (
                        <div key={index} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{turma.turma}</h3>
                                    <p className="text-sm text-slate-500 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">person</span>
                                        {turma.professor || 'Sem professor'}
                                    </p>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => ctrl.handleEditClass(index)}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                    </button>
                                    <button
                                        onClick={() => ctrl.handleDeleteClass(turma.id)}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg">
                                    <span className="material-symbols-outlined text-base">location_on</span>
                                    {turma.sala || 'Sem sala'}
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {turma.horario.map((h: any, i: number) => (
                                        <span key={i} className="px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30">
                                            {h.day.substring(0, 3)} {h.time.substring(0, 5)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const EditorView = ({ ctrl }: { ctrl: ReturnType<typeof useClassManagerController> }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden animate-slideUp">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                    {ctrl.editingClassIndex !== null ? 'Editar Turma' : 'Nova Turma'}
                </h3>
            </div>

            <form onSubmit={ctrl.handleSaveClass} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Turma / Código</label>
                        <input
                            required
                            type="text"
                            value={ctrl.currentClass.turma}
                            onChange={e => ctrl.setCurrentClass({ ...ctrl.currentClass, turma: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="Ex: T01"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Professor</label>
                        <input
                            type="text"
                            value={ctrl.currentClass.professor}
                            onChange={e => ctrl.setCurrentClass({ ...ctrl.currentClass, professor: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="Nome do professor"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Sala</label>
                        <input
                            type="text"
                            value={ctrl.currentClass.sala}
                            onChange={e => ctrl.setCurrentClass({ ...ctrl.currentClass, sala: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="Ex: 101"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Horários</label>
                    <div className="overflow-x-auto border rounded-xl border-slate-200 dark:border-slate-700">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 text-left">
                                    <th className="p-2 border-b border-slate-200 dark:border-slate-700 font-medium text-slate-500">Horário</th>
                                    {ctrl.days.map(d => (
                                        <th key={d.id} className="p-2 border-b border-slate-200 dark:border-slate-700 font-medium text-slate-500 text-center">{d.name.substring(0, 3)}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {ctrl.slots.map(slot => (
                                    <tr key={slot.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                        <td className="p-2 font-medium text-slate-600 dark:text-slate-400 text-xs whitespace-nowrap">
                                            {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                                        </td>
                                        {ctrl.days.map(day => {
                                            const isSelected = ctrl.currentClass.horario.some(h => h.day === day.id && h.time === slot.id);
                                            return (
                                                <td key={`${day.id}-${slot.id}`} className="p-0 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => ctrl.toggleScheduleSlot(day.id, slot.id)}
                                                        className={`w-full h-10 transition-colors ${isSelected ? 'bg-primary text-white' : 'hover:bg-primary/10'}`}
                                                    >
                                                        {isSelected && <span className="material-symbols-outlined text-sm">check</span>}
                                                    </button>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                        type="button"
                        onClick={ctrl.handleCancelEdit}
                        className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={ctrl.saving}
                        className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white hover:bg-primary-dark font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
                    >
                        {ctrl.saving ? (
                            <>
                                <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                                Salvando...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-sm">save</span>
                                Salvar Turma
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default function ClassManagerView({ ctrl }: { ctrl: ReturnType<typeof useClassManagerController> }) {
    if (ctrl.loading) return <LoadingSpinner message="Carregando turmas..." />;

    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark p-6 lg:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-text-light-primary dark:text-text-dark-primary mb-1">
                            Gerenciador de Turmas
                        </h1>
                        <p className="text-text-light-secondary dark:text-text-dark-secondary">
                            Curso: <span className="font-semibold text-primary uppercase">{ctrl.cur}</span>
                        </p>
                    </div>
                </div>

                {/* Filters / Selection */}
                <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex items-center gap-2 min-w-[200px]">
                        <span className="text-sm font-bold text-slate-500 uppercase">Semestre:</span>
                        <div className="flex gap-1 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
                            {ctrl.semesters.map(s => (
                                <button
                                    key={s}
                                    onClick={() => ctrl.setSemestre(s)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${ctrl.semestre === s ? 'bg-primary text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 w-full relative z-20">
                        <Select
                            placeholder="Selecione a disciplina..."
                            options={ctrl.disciplinaOptions}
                            value={ctrl.selectedDisciplina}
                            onChange={(opt: any) => ctrl.setSelectedDisciplina(opt)}
                            classNamePrefix="select"
                            classNames={{
                                control: () => '!border-slate-300 dark:!border-slate-700 !bg-white dark:!bg-slate-900 !rounded-lg !text-sm !min-h-[44px]',
                                menu: () => '!bg-white dark:!bg-slate-800 !border !border-slate-200 dark:!border-slate-700 !rounded-lg !mt-1 !shadow-xl !z-50',
                                option: () => '!text-sm hover:!bg-slate-100 dark:hover:!bg-slate-700 !text-slate-800 dark:!text-slate-200',
                                singleValue: () => '!text-slate-800 dark:!text-slate-200 !font-medium',
                                placeholder: () => '!text-slate-400'
                            }}
                            styles={customSelectStyles}
                        />
                    </div>
                </div>

                {/* Content Area */}
                {ctrl.selectedDisciplina ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* List */}
                        <div className={`lg:col-span-2 ${ctrl.isEditing ? 'hidden lg:block' : ''}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">groups</span>
                                    Turmas Cadastradas
                                </h2>
                                {!ctrl.isEditing && (
                                    <button
                                        onClick={ctrl.handleNewClass}
                                        className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold"
                                    >
                                        <span className="material-symbols-outlined text-sm">add</span>
                                        Nova Turma
                                    </button>
                                )}
                            </div>
                            <ClassesListView ctrl={ctrl} />
                        </div>

                        {/* Editor (Sidebar or Full on Mobile) */}
                        {ctrl.isEditing && (
                            <div className="lg:col-span-1 lg:sticky lg:top-8 z-10">
                                <EditorView ctrl={ctrl} />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                        <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">school</span>
                        <h2 className="text-2xl font-bold text-slate-400">Selecione uma disciplina</h2>
                        <p className="text-slate-500">Escolha uma disciplina acima para gerenciar as turmas</p>
                    </div>
                )}
            </div>
        </main>
    );
}

