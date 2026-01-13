import React from 'react';
import { Course } from './CoursesManager';

interface CoursesTableProps {
    courses: Course[];
    selectedCourseId?: number;
    onEdit: (course: Course) => void;
    onDelete: (id: number) => void;
}

export default function CoursesTable({ courses, selectedCourseId, onEdit, onDelete }: CoursesTableProps) {
    if (courses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-2">search_off</span>
                <p>Nenhum curso encontrado.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                        <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">CÓDIGO</th>
                        <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">NOME</th>
                        <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">TURNO</th>
                        <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 text-right">AÇÕES</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {courses.map((course) => {
                        const isSelected = selectedCourseId === course.id;
                        return (
                            <tr
                                key={course.id}
                                className={`group transition-colors ${isSelected
                                        ? 'bg-primary/5 dark:bg-primary/10'
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                    }`}
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium font-mono text-slate-600 dark:text-slate-400">
                                    {course.code}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                                    {course.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                    {course.shift || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onEdit(course)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors dark:text-blue-400 dark:hover:bg-blue-900/30"
                                            title="Editar"
                                        >
                                            <span className="material-symbols-outlined text-xl">edit</span>
                                        </button>
                                        <button
                                            onClick={() => onDelete(course.id)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:text-red-400 dark:hover:bg-red-900/30"
                                            title="Excluir"
                                        >
                                            <span className="material-symbols-outlined text-xl">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
