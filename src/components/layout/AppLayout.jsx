'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import ROUTES from '../../routes';
import { loadDbData } from '../../services/disciplinaService';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';

const AppLayout = ({ children }) => {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const params = useParams();
    const cur = params?.cur; // Handle potential undefined
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout, isExpired } = useAuth();

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

    // Get effective course (URL param > localStorage > user preference)
    const [effectiveCur, setEffectiveCur] = useState(cur);

    useEffect(() => {
        if (cur) {
            setEffectiveCur(cur);
        } else {
            const stored = localStorage.getItem('last_active_course');
            if (stored && stored !== 'admin') {
                setEffectiveCur(stored);
            } else if (user?.courses?.code && user.courses.code !== 'admin') {
                // Fallback to user's registered course if available
                setEffectiveCur(user.courses.code);
                localStorage.setItem('last_active_course', user.courses.code);
            }
        }
    }, [cur, user]);

    const hasCourseSelected = !!effectiveCur;

    const handleLogout = () => {
        if (confirm('Deseja realmente sair?')) {
            logout();
            router.push('/');
        }
    };

    const menuItems = [
        { to: `/${effectiveCur}`, icon: 'add_task', label: 'Gera Grade', exact: true },
        { to: ROUTES.GRADES(effectiveCur), icon: 'grid_on', label: 'Horários' },
        { to: ROUTES.FLOW(effectiveCur), icon: 'timeline', label: 'Cronograma' },
        // Show Prediction only if confirmed paid and not expired
        ...((!isExpired && user?.is_paid) ? [{ to: ROUTES.PREDICTION, icon: 'neurology', label: 'Previsão', divider: true }] : []),
    ];

    const isActiveLink = (to, exact) => {
        if (!to) return false;
        if (exact) {
            return pathname === to;
        }
        return pathname.startsWith(to);
    };

    if (pathname === '/') {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans antialiased text-text-light dark:text-text-dark">
                <LandingHeader />
                <main>
                    {children}
                </main>
                <LandingFooter />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex">
            {/* Desktop Sidebar */}
            {hasCourseSelected && (
                <aside
                    className={`fixed left-0 top-0 h-screen bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark transition-all duration-300 ease-in-out z-50 hidden md:flex flex-col ${isSidebarExpanded ? 'w-64' : 'w-20'
                        }`}
                >
                    {/* Header da Sidebar */}
                    <div className="flex items-center justify-between h-16 px-4 border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-white/5">
                        <button
                            onClick={() => router.push('/')}
                            className="hover:opacity-80 cursor-pointer transition-opacity flex items-center gap-3 w-full"
                            title="Voltar para página inicial"
                        >
                            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                                <span className="material-symbols-outlined text-white text-xl">school</span>
                            </div>
                            {/* Label que só aparece quando o menu está expandido */}
                            <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ml-2 font-semibold text-text-light-primary dark:text-text-dark-primary ${isSidebarExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden md:block'}`}>
                                Horários CEFET
                            </span>
                        </button>
                    </div>

                    {/* Menu Items */}
                    <nav className="flex flex-col z-50 gap-1 p-3 mt-4">
                        {menuItems.map((item) => (
                            <React.Fragment key={item.to}>
                                {item.divider && (
                                    <div className="h-px bg-border-light dark:bg-border-dark my-3 mx-2" />
                                )}
                                <Link
                                    href={item.to}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${isActiveLink(item.to, item.exact)
                                        ? 'bg-blue-50 dark:bg-primary/20 text-primary dark:text-blue-300'
                                        : 'text-text-light-secondary dark:text-text-dark-secondary hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-text-light-primary dark:hover:text-text-dark-primary'
                                        }`}
                                    title={!isSidebarExpanded ? item.label : ''}
                                >
                                    <span className={`material-symbols-outlined text-2xl flex-shrink-0 ${isActiveLink(item.to, item.exact) ? 'fill-current' : ''}`}>
                                        {item.icon}
                                    </span>
                                    <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 invisible'
                                        }`}>
                                        {item.label}
                                    </span>

                                    {/* Tooltip para quando está recolhido */}
                                    {!isSidebarExpanded && (
                                        <div className="absolute left-full ml-2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">
                                            {item.label}
                                            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800"></div>
                                        </div>
                                    )}
                                </Link>
                            </React.Fragment>
                        ))}
                    </nav>

                    {/* Botão de Expandir/Recolher */}
                    <button
                        onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 p-2 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-light-secondary hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                        title={isSidebarExpanded ? 'Recolher menu' : 'Expandir menu'}
                    >
                        <span className="material-symbols-outlined text-xl">
                            {isSidebarExpanded ? 'chevron_left' : 'chevron_right'}
                        </span>
                    </button>
                </aside>
            )}

            {/* Mobile Sidebar Overlay */}
            {hasCourseSelected && isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar Drawer */}
            {hasCourseSelected && (
                <aside
                    className={`fixed inset-y-0 left-0 bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark transition-transform duration-300 ease-in-out z-50 w-64 md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                >
                    <div className="flex items-center justify-between h-16 px-4 border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-white/5">
                        <button
                            onClick={() => router.push('/')}
                            className="hover:opacity-80 cursor-pointer transition-opacity flex items-center gap-3"
                        >
                            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                                <span className="material-symbols-outlined text-white text-xl">school</span>
                            </div>
                            <span className="font-semibold text-text-light-primary dark:text-text-dark-primary ml-2">
                                Horários CEFET
                            </span>
                        </button>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <nav className="flex flex-col gap-1 p-3 mt-4">
                        {menuItems.map((item) => (
                            <React.Fragment key={item.to}>
                                {item.divider && <div className="h-px bg-border-light dark:bg-border-dark my-3 mx-2" />}
                                <Link
                                    href={item.to}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActiveLink(item.to, item.exact)
                                        ? 'bg-blue-50 dark:bg-primary/20 text-primary dark:text-blue-300'
                                        : 'text-text-light-secondary dark:text-text-dark-secondary hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <span className={`material-symbols-outlined text-2xl ${isActiveLink(item.to, item.exact) ? 'fill-current' : ''}`}>
                                        {item.icon}
                                    </span>
                                    <span>{item.label}</span>
                                </Link>
                            </React.Fragment>
                        ))}
                    </nav>
                </aside>
            )}

            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 min-w-0 ${hasCourseSelected ? (isSidebarExpanded ? 'md:ml-64' : 'md:ml-20') : 'md:ml-0'
                }`}>
                {/* Top Bar */}
                <header className="sticky top-0 z-40 h-16 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark shadow-sm">
                    <div className="h-full px-4 md:px-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {hasCourseSelected && (
                                <button
                                    onClick={() => setIsMobileMenuOpen(true)}
                                    className="md:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-text-light-secondary dark:text-text-dark-secondary"
                                >
                                    <span className="material-symbols-outlined">menu</span>
                                </button>
                            )}
                            <h1 className="text-lg md:text-xl font-bold text-text-light-primary dark:text-text-dark-primary truncate max-w-[200px] md:max-w-none">
                                Horários CEFET {hasCourseSelected && effectiveCur ? `- ${effectiveCur.toUpperCase()}` : ''}
                            </h1>
                        </div>


                        <div className="flex items-center gap-4">
                            {user && (
                                <div className="flex items-center gap-3">
                                    <Link
                                        href={ROUTES.PROFILE}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors cursor-pointer group"
                                        title="Ver Perfil"
                                    >
                                        <span className="material-symbols-outlined text-lg text-primary group-hover:scale-110 transition-transform">account_circle</span>
                                        <span className="text-sm font-medium text-primary hidden sm:block">{user.name || user.username}</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                        title="Sair"
                                    >
                                        <span className="material-symbols-outlined text-lg">logout</span>
                                        <span className="hidden sm:block">Sair</span>
                                    </button>
                                </div>
                            )}

                            {/* Admin Link logic - Independent of hasCourseSelected for 'curso' role */}
                            {user && (user.role === 'admin' || user.role === 'curso') && (
                                <Link
                                    href={user.role === 'curso' && user.courses?.code
                                        ? `/${user.courses.code}/edit`
                                        : (effectiveCur ? `/${effectiveCur}/edit` : '#')
                                    }
                                    className={`flex items-center gap-2 text-sm text-text-light-secondary dark:text-text-dark-secondary hover:text-primary transition-colors ${(!effectiveCur && user.role !== 'curso') ? 'opacity-50 cursor-not-allowed hidden' : ''
                                        }`}
                                    title={(!effectiveCur && user.role !== 'curso') ? "Selecione um curso primeiro" : "Gerenciar disciplinas"}
                                    onClick={(e) => {
                                        if (!effectiveCur && user.role !== 'curso') e.preventDefault();
                                    }}
                                >
                                    <span className="material-symbols-outlined text-lg">settings</span>
                                    <span className="hidden sm:block">Admin</span>
                                </Link>
                            )}

                            {/* Login Link - Always visible if not logged in */}
                            {!user && (
                                <Link
                                    href={ROUTES.LOGIN}
                                    className="flex items-center gap-2 text-sm text-text-light-secondary dark:text-text-dark-secondary hover:text-primary transition-colors"
                                    title="Fazer login"
                                >
                                    <span className="material-symbols-outlined text-lg">login</span>
                                    <span className="hidden sm:block">Logar</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </header>

                {/* Trial Notification Banner */}
                {user && !user.is_paid && !isExpired && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800/50 px-4 py-2.5 flex items-center justify-center gap-2 text-amber-800 dark:text-amber-200 text-sm font-medium">
                        <span className="material-symbols-outlined text-lg">timer</span>
                        <span>
                            Você está usando a versão de teste.
                            {user.subscription_expires_at && (
                                <span className="ml-1">
                                    Restam {Math.ceil((new Date(user.subscription_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dias.
                                </span>
                            )}
                        </span>
                        <Link href={ROUTES.PLANS} className="ml-2 px-3 py-1 bg-amber-200 dark:bg-amber-800 rounded-full text-amber-900 dark:text-amber-100 text-xs hover:bg-amber-300 dark:hover:bg-amber-700 transition-colors">
                            Assinar Agora
                        </Link>
                    </div>
                )}

                {/* Content Area */}
                <main className="">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
