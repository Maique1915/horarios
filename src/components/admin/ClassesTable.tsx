import React, { useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
    ColumnDef
} from '@tanstack/react-table';

// We can define the shape of the data here or import it.
// Based on ClassesManager, the data is GroupedClass.
export interface ClassTableData {
    className: string;
    subjectId: number;
    rows: any[]; // We can be more specific if needed, but this is for counting slots
    subjectName?: string;
    subjectAcronym?: string;
    subjectSemester?: number;
}

interface ClassesTableProps {
    data: ClassTableData[];
    handleEditClass: (cls: ClassTableData) => void;
    handleDeleteClass: (className: string) => void;
    selectedClassName?: string | null;
    getSubjectName: (id: number) => string;
    getSubjectAcronym: (id: number) => string;
    getSubjectSemester: (id: number) => number;
}

const ClassesTable = ({ data, handleEditClass, handleDeleteClass, selectedClassName, getSubjectName, getSubjectAcronym, getSubjectSemester }: ClassesTableProps) => {
    const columns = useMemo<ColumnDef<ClassTableData>[]>(
        () => [
            {
                accessorFn: row => getSubjectAcronym(row.subjectId),
                id: 'subjectAcronym',
                header: 'Código',
                cell: info => <span className="font-bold text-slate-700 dark:text-slate-300">{info.getValue() as string}</span>
            },
            {
                accessorFn: row => getSubjectSemester(row.subjectId),
                id: 'subjectSemester',
                header: 'Período',
                cell: info => <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400">{info.getValue() as number}º Período</span>,
            },
            {
                accessorKey: 'className',
                header: 'Turma',
                cell: info => <span className="font-bold text-primary dark:text-blue-400">{info.getValue() as string}</span>
            },
            {
                id: 'slots',
                header: 'Horários',
                accessorFn: row => row.rows.length,
                cell: info => {
                    const row = info.row.original;
                    const days = [...new Set(row.rows.map((r: any) => r.day_id))].sort();

                    return (
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                {info.getValue() as number} slots
                            </span>
                            <div className="flex flex-wrap gap-1">
                                {days.map((d: any) => (
                                    <span key={d} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] uppercase font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                                        Dia {d}
                                    </span>
                                ))}
                            </div>
                        </div>
                    );
                }
            },
            {
                id: 'actions',
                header: '',
                cell: ({ row }) => (
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                            className="p-1.5 rounded-lg hover:bg-primary/10 text-primary dark:text-blue-400 transition-colors"
                            onClick={(e) => { e.stopPropagation(); handleEditClass(row.original); }}
                            title="Editar"
                        >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                            onClick={(e) => { e.stopPropagation(); handleDeleteClass(row.original.className); }}
                            title="Excluir"
                        >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                    </div>
                ),
            },
        ],
        [handleEditClass, handleDeleteClass, getSubjectName, getSubjectAcronym, getSubjectSemester]
    );

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: {
            pagination: {
                pageSize: 10,
            }
        },
        autoResetPageIndex: false,
    });

    return (
        <div className="w-full flex-1 flex flex-col">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left align-middle">
                    <thead className="text-xs uppercase bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-border-light dark:border-border-dark sticky top-0 backdrop-blur-sm">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="px-5 py-3 font-semibold tracking-wider" scope="col">
                                        <div
                                            className={`flex items-center gap-1 ${header.column.getCanSort() ? 'cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-300 transition-colors' : ''}`}
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {{
                                                asc: <span className="material-symbols-outlined text-sm">arrow_upward</span>,
                                                desc: <span className="material-symbols-outlined text-sm">arrow_downward</span>,
                                            }[header.column.getIsSorted() as string] ?? null}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-border-light dark:divide-border-dark bg-background-light dark:bg-background-dark">
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map(row => {
                                const isSelected = selectedClassName === row.original.className;
                                return (
                                    <tr
                                        key={row.id}
                                        className={`group transition-all duration-200 cursor-pointer text-text-light-secondary dark:text-text-dark-secondary
                        ${isSelected
                                                ? 'bg-primary/5 dark:bg-primary/10 border-l-2 border-l-primary'
                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/30 border-l-2 border-l-transparent'
                                            }
                    `}
                                        onClick={() => handleEditClass(row.original)}
                                    >
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="px-5 py-3 align-middle whitespace-nowrap">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                )
                            })
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="text-center py-12 text-slate-400 dark:text-slate-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="material-symbols-outlined text-4xl opacity-50">search_off</span>
                                        <span>Nenhuma turma encontrada.</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Página <span className="text-slate-800 dark:text-slate-200">{table.getState().pagination.pageIndex + 1}</span> de <span className="text-slate-800 dark:text-slate-200">{table.getPageCount()}</span>
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="p-1.5 px-3 rounded-lg border border-border-light dark:border-border-dark hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium text-slate-600 dark:text-slate-300"
                    >
                        Anterior
                    </button>
                    <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="p-1.5 px-3 rounded-lg border border-border-light dark:border-border-dark hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium text-slate-600 dark:text-slate-300"
                    >
                        Próxima
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClassesTable;
