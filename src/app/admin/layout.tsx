'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { tableConfigs } from '../../components/admin/tableConfig';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user } = useAuth();

    // Simple protection check (can make stricter if needed)
    if (!user) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p>Acesso restrito. Faça login.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-light dark:bg-surface-dark text-text-light-primary dark:text-text-dark-primary flex flex-col">
            {/* Horizontal Submenu */}
            <nav className="w-full border-b border-border-light dark:border-border-dark bg-white dark:bg-gray-800 shadow-sm shrink-0 sticky top-0 z-40">
                <div className="flex items-center px-4 py-2 gap-2 overflow-x-auto no-scrollbar">
                    <span className="font-bold text-sm text-gray-500 uppercase tracking-wider mr-2 hidden md:block whitespace-nowrap">
                        Gerenciar Tabelas
                    </span>
                    <Link
                        href="/admin"
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap ${pathname === '/admin'
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-text-light-secondary dark:text-text-dark-secondary hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                    >
                        Dashboard
                    </Link>
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

                    {Object.values(tableConfigs).map(config => {
                        const isActive = pathname === `/admin/${config.tableName}`;
                        return (
                            <Link
                                key={config.tableName}
                                href={`/admin/${config.tableName}`}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap ${isActive
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'text-text-light-secondary dark:text-text-dark-secondary hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {config.displayName}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            <main className="flex-1 p-4 overflow-auto relative">
                {children}
            </main>
        </div>
    );
}
