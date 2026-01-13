import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalItems, itemsPerPage, onPageChange }: PaginationProps) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
                >
                    Anterior
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
                >
                    Próxima
                </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> de <span className="font-medium">{totalItems}</span> resultados
                    </p>
                </div>
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed dark:ring-gray-600 dark:hover:bg-gray-700"
                        >
                            <span className="sr-only">Anterior</span>
                            <span className="material-symbols-outlined text-sm">chevron_left</span>
                        </button>

                        {/* Simple Logic: Show Current, Prev, Next if possible. For now just numbers */}
                        {Array.from({ length: totalPages }).map((_, i) => {
                            const pageNumber = i + 1;
                            // logic to show only some pages can be added here if needed, keeping it simple for < 10 pages
                            if (totalPages > 10 && Math.abs(pageNumber - currentPage) > 2 && pageNumber !== 1 && pageNumber !== totalPages) {
                                if (Math.abs(pageNumber - currentPage) === 3) return <span key={i} className="px-2 py-2 text-gray-400">...</span>;
                                return null;
                            }

                            return (
                                <button
                                    key={i}
                                    onClick={() => onPageChange(pageNumber)}
                                    aria-current={currentPage === pageNumber ? 'page' : undefined}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === pageNumber
                                            ? 'z-10 bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {pageNumber}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed dark:ring-gray-600 dark:hover:bg-gray-700"
                        >
                            <span className="sr-only">Próxima</span>
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
}
