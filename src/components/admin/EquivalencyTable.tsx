'use client';
import React from 'react';
import { DbEquivalency } from '../../services/disciplinaService';

interface EquivalencyTableProps {
    equivalencies: DbEquivalency[];
    selectedId?: number;
    onEdit: (equiv: DbEquivalency) => void;
    onDelete: (id: number) => void;
}

export default function EquivalencyTable({ equivalencies, selectedId, onEdit, onDelete }: EquivalencyTableProps) {
    if (equivalencies.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <span className="material-symbols-outlined text-4xl mb-2">info</span>
                <p>Nenhuma equivalência encontrada.</p>
            </div>
        );
    }

    // Grouping by equivalence_group_id can be helpful but for a simple table let's just show rows
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Disciplina Alvo</th>
                        <th className="px-6 py-4">Disciplina Origem</th>
                        <th className="px-6 py-4 text-center">Abrangência</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {equivalencies.map((equiv) => (
                        <tr
                            key={equiv.id}
                            className={`group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${selectedId === equiv.id ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                }`}
                        >
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${equiv.target_subject && equiv.source_subject
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                    }`}>
                                    {equiv.target_subject && equiv.source_subject ? 'Válida' : 'Incompleta'}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm font-bold text-slate-900 dark:text-white">
                                    {equiv.target_subject?.acronym || 'ID: ' + equiv.target_subject_id}
                                </div>
                                <div className="text-xs text-slate-500 truncate max-w-[200px]">
                                    {equiv.target_subject?.name || 'N/A'}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm font-bold text-slate-900 dark:text-white">
                                    {equiv.source_subject?.acronym || 'ID: ' + equiv.source_subject_id}
                                </div>
                                <div className="text-xs text-slate-500 truncate max-w-[200px]">
                                    {equiv.source_subject?.name || 'N/A'}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <div className="flex justify-center">
                                    <span
                                        className={`material-symbols-outlined text-sm ${equiv.course_id ? 'text-primary' : 'text-emerald-500'}`}
                                        title={equiv.course_id ? "Regional (Apenas para este curso)" : "Global (Válido para todos os cursos)"}
                                    >
                                        {equiv.course_id ? 'location_on' : 'public'}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end items-center gap-2">
                                    <button
                                        onClick={() => onEdit(equiv)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                        title="Editar"
                                    >
                                        <span className="material-symbols-outlined text-xl">edit</span>
                                    </button>
                                    <button
                                        onClick={() => onDelete(equiv.id)}
                                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                        title="Excluir"
                                    >
                                        <span className="material-symbols-outlined text-xl">delete</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table >
        </div >
    );
}
