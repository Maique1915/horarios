import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';

const DisciplinaTable = ({ data, handleEditDisciplina, removeDisciplina, handleToggleStatus, selectedId }) => {
  const columns = useMemo(
    () => [
      {
        accessorKey: '_re',
        header: 'Código',
      },
      {
        accessorKey: '_se',
        header: 'Período',
        cell: info => `${info.getValue()}º Período`,
      },
      {
        accessorKey: '_pr',
        header: 'Pré-requisitos',
        cell: info => {
          const value = info.getValue();
          return (Array.isArray(value) && value.length > 0) ? value.join(', ') : 'Nenhum';
        },
      },
      {
        accessorKey: '_di',
        header: 'Nome da Disciplina',
      },
      {
        id: 'creditos',
        header: 'Créditos',
        accessorFn: row => row._at + row._ap,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <button
              className={`p-2 rounded-md hover:bg-gray-500/10 ${row.original._ag ? 'text-green-500' : 'text-red-500'} transition-colors`}
              onClick={() => handleToggleStatus(row.original)}
            >
              <span className="material-symbols-outlined text-xl">{row.original._ag ? 'visibility' : 'visibility_off'}</span>
            </button>
            <button
              className="p-2 rounded-md hover:bg-primary/10 text-primary transition-colors"
              onClick={() => handleEditDisciplina(row.original)}
            >
              <span className="material-symbols-outlined text-xl">edit</span>
            </button>
            <button
              className="p-2 rounded-md hover:bg-red-500/10 text-red-500 transition-colors"
              onClick={() => removeDisciplina(row.original)}
            >
              <span className="material-symbols-outlined text-xl">delete</span>
            </button>
          </div>
        ),
      },
    ],
    [handleEditDisciplina, removeDisciplina, handleToggleStatus]
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
    autoResetPageIndex: false, // Evita que a paginação seja reiniciada ao mudar os dados
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase text-text-light-secondary dark:text-text-dark-secondary">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} className="px-6 py-3" scope="col">
                  <div
                    className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: ' 🔼',
                      desc: ' 🔽',
                    }[header.column.getIsSorted()] ?? null}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map(row => {
              const isSelected = selectedId === row.original._re;
              return (
                <tr
                  key={row.id}
                  className={`border-b border-border-light dark:border-border-dark hover:bg-surface-hover-light dark:hover:bg-surface-hover-dark transition-colors cursor-pointer ${isSelected ? 'bg-primary/10 border-l-4 border-l-primary' : ''}`}
                  onClick={() => handleEditDisciplina(row.original)}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-2 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              )
            })
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center p-4">
                Nenhuma disciplina encontrada.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="flex items-center justify-between p-4">
        <span className="text-sm text-muted-foreground">
          Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="p-2 rounded-md hover:bg-primary/10 disabled:opacity-50"
          >
            Primeira
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-2 rounded-md hover:bg-primary/10 disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-2 rounded-md hover:bg-primary/10 disabled:opacity-50"
          >
            Próxima
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="p-2 rounded-md hover:bg-primary/10 disabled:opacity-50"
          >
            Última
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisciplinaTable;
