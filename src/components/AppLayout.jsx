'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { loadDbData } from '../services/disciplinaService';

const AppLayout = ({ children }) => {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const params = useParams();
    const cur = params?.cur; // Handle potential undefined
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout } = useAuth();

    useEffect(() => {
        // Ensure this only runs on client and if needed
        if (typeof window !== 'undefined') {
            loadDbData();
        }
    }, []);

    // Persist last active course
    useEffect(() => {
        if (cur) {
            localStorage.setItem('last_active_course', cur);
        }
    }, [cur]);

    // Get effective course (URL param > localStorage)
    const [effectiveCur, setEffectiveCur] = useState(cur);

    useEffect(() => {
        if (cur) {
            setEffectiveCur(cur);
        } else {
            const stored = localStorage.getItem('last_active_course');
            if (stored) setEffectiveCur(stored);
        }
    }, [cur]);

    const hasCourseSelected = !!effectiveCur;

    const handleLogout = () => {
        if (confirm('Deseja realmente sair?')) {
            logout();
            router.push('/');
        }
    };

    const menuItems = [
        { to: `/${effectiveCur}`, icon: 'add_task', label: 'Gera Grade', exact: true },
        { to: `/${effectiveCur}/grades`, icon: 'grid_on', label: 'Horários' },
        { to: `/${effectiveCur}/cronograma`, icon: 'timeline', label: 'Cronograma' },
    ];

    const isActiveLink = (to, exact) => {
        if (!to) return false;
        if (exact) {
            return pathname === to;
        }
        return pathname.startsWith(to);
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex">
            {/* Sidebar */}
            {hasCourseSelected && (
                <aside
                    className={`fixed left-0 top-0 h-screen bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark shadow-lg transition-all duration-300 ease-in-out z-50 ${isSidebarExpanded ? 'w-64' : 'w-20'
                        }`}
                >
                    {/* Header da Sidebar */}
                    <div className="flex items-center justify-between h-16 px-4 border-b border-border-light dark:border-border-dark">
                        <button
                            onClick={() => router.push('/')}
                            className="hover:opacity-80 cursor-pointer transition-opacity flex items-center gap-3"
                            title="Voltar para página inicial"
                        >
                            <Image
                                src="/logo.png"
                                alt="Logo"
                                width={40}
                                height={40}
                                className="rounded-full flex-shrink-0"
                                unoptimized
                            />
                            {/* Label que só aparece quando o menu está expandido */}
                            <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ml-2 ${isSidebarExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 invisible'}`}>
                                Horários CEFET
                            </span>
                        </button>
                    </div>

                    {/* Menu Items */}
                    <nav className="flex flex-col z-50 gap-1 p-3 mt-4">
                        {menuItems.map((item) => (
                            <React.Fragment key={item.to}>
                                {item.divider && (
                                    <div className="h-px bg-border-light dark:bg-border-dark my-3" />
                                )}
                                <Link
                                    href={item.to}
                                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all group relative ${isActiveLink(item.to, item.exact)
                                        ? 'bg-primary text-white shadow-md'
                                        : 'text-text-light-primary dark:text-text-dark-primary hover:bg-primary/10'
                                        }`}
                                    title={!isSidebarExpanded ? item.label : ''}
                                >
                                    <span className="material-symbols-outlined text-2xl flex-shrink-0">
                                        {item.icon}
                                    </span>
                                    <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 invisible'
                                        }`}>
                                        {item.label}
                                    </span>

                                    {/* Tooltip para quando está recolhido */}
                                    {!isSidebarExpanded && (
                                        <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                            {item.label}
                                            <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-gray-900 dark:border-r-gray-700"></div>
                                        </div>
                                    )}
                                </Link>
                            </React.Fragment>
                        ))}
                    </nav>

                    {/* Botão de Expandir/Recolher */}
                    <button
                        onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 p-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all shadow-lg"
                        title={isSidebarExpanded ? 'Recolher menu' : 'Expandir menu'}
                    >
                        <span className="material-symbols-outlined text-xl">
                            {isSidebarExpanded ? 'chevron_left' : 'chevron_right'}
                        </span>
                    </button>
                </aside>
            )}

            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 ${hasCourseSelected ? (isSidebarExpanded ? 'ml-64' : 'ml-20') : 'ml-0'
                }`}>
                {/* Top Bar */}
                <header className="sticky top-0 z-40 h-16 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark shadow-sm">
                    <div className="h-full px-6 flex items-center justify-between">
                        <h1 className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary">
                            Horários CEFET {hasCourseSelected && effectiveCur ? `- ${effectiveCur.toUpperCase()}` : ''}
                        </h1>

                        {/* Info adicional ou breadcrumbs podem ir aqui */}

                        <div className="flex items-center gap-4">
                            {user && (
                                <div className="flex items-center gap-3">
                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors cursor-pointer group"
                                        title="Ver Perfil"
                                    >
                                        <span className="material-symbols-outlined text-lg text-primary group-hover:scale-110 transition-transform">account_circle</span>
                                        <span className="text-sm font-medium text-primary">{user.name || user.username}</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                        title="Sair"
                                    >
                                        <span className="material-symbols-outlined text-lg">logout</span>
                                        <span>Sair</span>
                                    </button>
                                </div>
                            )}

                            {hasCourseSelected && (
                                user ? (
                                    <Link
                                        href={`/${effectiveCur}/edit`}
                                        className="flex items-center gap-2 text-sm text-text-light-secondary dark:text-text-dark-secondary hover:text-primary transition-colors"
                                        title="Gerenciar disciplinas"
                                    >
                                        <span className="material-symbols-outlined text-lg">settings</span>
                                        <span>Admin</span>
                                    </Link>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="flex items-center gap-2 text-sm text-text-light-secondary dark:text-text-dark-secondary hover:text-primary transition-colors"
                                        title="Fazer login"
                                    >
                                        <span className="material-symbols-outlined text-lg">login</span>
                                        <span>Logar</span>
                                    </Link>
                                )
                            )}
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="min-h-screen">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
