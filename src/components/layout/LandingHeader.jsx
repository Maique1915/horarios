'use client';

import React, { startTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import ROUTES from '../../routes';
import ThemeToggle from '../shared/ThemeToggle';

const LandingHeader = () => {
    const { user, logout, isExpired } = useAuth();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false); // User Dropdown
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false); // Mobile Nav Toggle
    const [isLoggingOut, setIsLoggingOut] = React.useState(false);
    const [effectiveCur, setEffectiveCur] = React.useState(null);
    const menuRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    React.useEffect(() => {
        const stored = localStorage.getItem('last_active_course');
        if (stored && stored !== 'admin') {
            setEffectiveCur(stored);
        } else if (user?.courses?.code && user.courses.code !== 'admin') {
            setEffectiveCur(user.courses.code);
        }
    }, [user]);

    const handleLogout = async () => {
        if (confirm('Deseja realmente sair?')) {
            // Immediate UI feedback
            setIsLoggingOut(true);
            setIsMenuOpen(false);
            
            // Defer heavy operations to not block the UI
            startTransition(async () => {
                try {
                    await logout(); // logout already handles navigation
                } catch (error) {
                    console.error('Logout error:', error);
                    setIsLoggingOut(false);
                }
            });
        }
    };

    return (
        <>
            <nav className="sticky top-0 z-50 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <div className="bg-primary rounded-lg p-1.5 flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-xl">school</span>
                            </div>
                            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">Horários CEFET</span>
                        </Link>

                        <div className="hidden md:flex space-x-8 text-center">
                            <a href="#funcionalidades" className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition">Funcionalidades</a>
                            <a href="#cursos" className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition">Cursos</a>
                            <a href="#precos" className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition">Planos</a>
                        </div>

                        <div className="flex items-center gap-4">
                            <ThemeToggle />

                            {user ? (
                            <div className="hidden md:block relative" ref={menuRef}>
                                    <button
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-xl hover:bg-primary/20 transition-all border border-primary/20 group"
                                    >
                                        <span className="material-symbols-outlined text-xl text-primary group-hover:scale-110 transition-transform">account_circle</span>
                                        <span className="text-sm font-bold text-primary hidden md:block">{user.name?.split(' ')[0] || user.username}</span>
                                        <span className={`material-symbols-outlined text-sm text-primary transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}>expand_more</span>
                                    </button>

                                    {isMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
                                            <div className="px-4 py-3 border-b border-gray-50 dark:border-slate-800 mb-2">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Conectado como</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name || user.username}</p>
                                            </div>

                                            <Link
                                                href={ROUTES.PROFILE}
                                                onClick={() => setIsMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-primary dark:hover:text-blue-400 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-lg">person</span>
                                                Meu Perfil
                                            </Link>

                                            {effectiveCur && (
                                                <>
                                                    <div className="h-px bg-gray-50 dark:bg-slate-800 my-1" />
                                                    <Link
                                                        href={`/${effectiveCur}`}
                                                        onClick={() => setIsMenuOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-primary dark:hover:text-blue-400 transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">add_task</span>
                                                        Gera Grade
                                                    </Link>
                                                    <Link
                                                        href={ROUTES.GRADES(effectiveCur)}
                                                        onClick={() => setIsMenuOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-primary dark:hover:text-blue-400 transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">grid_on</span>
                                                        Horários
                                                    </Link>
                                                    <Link
                                                        href={ROUTES.FLOW(effectiveCur)}
                                                        onClick={() => setIsMenuOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-primary dark:hover:text-blue-400 transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">timeline</span>
                                                        Cronograma
                                                    </Link>
                                                    {!isExpired && user?.is_paid && (
                                                        <Link
                                                            href={ROUTES.PREDICTION}
                                                            onClick={() => setIsMenuOpen(false)}
                                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-primary dark:hover:text-blue-400 transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">neurology</span>
                                                            Previsão
                                                        </Link>
                                                    )}
                                                    <div className="h-px bg-gray-50 dark:bg-slate-800 my-1" />
                                                </>
                                            )}

                                            {user && (user.role === 'admin' || user.role === 'curso') && (
                                                <Link
                                                    href={user.role === 'curso' && user.courses?.code
                                                        ? `/${user.courses.code}/edit`
                                                        : (effectiveCur ? `/${effectiveCur}/edit` : '#')
                                                    }
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-primary dark:hover:text-blue-400 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-lg">dashboard</span>
                                                    Painel Admin
                                                </Link>
                                            )}

                                            <div className="h-px bg-gray-50 dark:bg-slate-800 my-2" />

                                            <button
                                                onClick={handleLogout}
                                                disabled={isLoggingOut}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span className="material-symbols-outlined text-lg">{isLoggingOut ? 'hourglass_empty' : 'logout'}</span>
                                                {isLoggingOut ? 'Saindo...' : 'Sair'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    href={ROUTES.LOGIN}
                                    className="hidden md:inline-flex items-center justify-center px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    Entrar
                                </Link>
                            )}
                            <div className="flex md:hidden">
                                <button
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all border border-primary/20"
                                >
                                    <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation Drawer */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-[9999]">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-slate-900 shadow-2xl animate-in slide-in-from-right duration-300 border-l border-gray-100 dark:border-slate-800 overflow-y-auto">
                        <div className="p-6 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary rounded-lg p-1.5 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white text-xl">school</span>
                                    </div>
                                    <span className="font-bold text-lg dark:text-white">Menu</span>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                >
                                    <span className="material-symbols-outlined text-gray-500">close</span>
                                </button>
                            </div>

                            <nav className="flex flex-col gap-2">
                                <a
                                    href="#funcionalidades"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-primary/5 hover:text-primary rounded-xl transition-all"
                                >
                                    <span className="material-symbols-outlined">auto_awesome_motion</span>
                                    Funcionalidades
                                </a>
                                <a
                                    href="#cursos"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-primary/5 hover:text-primary rounded-xl transition-all"
                                >
                                    <span className="material-symbols-outlined">school</span>
                                    Cursos
                                </a>
                                <a
                                    href="#precos"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-primary/5 hover:text-primary rounded-xl transition-all"
                                >
                                    <span className="material-symbols-outlined">payments</span>
                                    Planos
                                </a>

                                {user && effectiveCur && (
                                    <>
                                        <div className="h-px bg-gray-50 dark:bg-slate-800 my-4" />
                                        <p className="px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Plataforma</p>
                                        <Link
                                            href={`/${effectiveCur}`}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-primary/5 hover:text-primary rounded-xl transition-all"
                                        >
                                            <span className="material-symbols-outlined">add_task</span>
                                            Gera Grade
                                        </Link>
                                        <Link
                                            href={ROUTES.GRADES(effectiveCur)}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-primary/5 hover:text-primary rounded-xl transition-all"
                                        >
                                            <span className="material-symbols-outlined">grid_on</span>
                                            Horários
                                        </Link>
                                        <Link
                                            href={ROUTES.FLOW(effectiveCur)}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-primary/5 hover:text-primary rounded-xl transition-all"
                                        >
                                            <span className="material-symbols-outlined">timeline</span>
                                            Cronograma
                                        </Link>
                                        {!isExpired && user?.is_paid && (
                                            <Link
                                                href={ROUTES.PREDICTION}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-primary/5 hover:text-primary rounded-xl transition-all"
                                            >
                                                <span className="material-symbols-outlined">neurology</span>
                                                Previsão
                                            </Link>
                                        )}
                                    </>
                                )}
                            </nav>

                            <div className="mt-auto pt-6 border-t border-gray-100 dark:border-slate-800">
                                {user ? (
                                    <div className="flex flex-col gap-3">
                                        <div className="px-4 py-3 bg-gray-50 dark:bg-slate-800/50 rounded-2xl">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Conectado como</p>
                                            <p className="text-sm font-black text-gray-900 dark:text-white truncate">{user.name || user.username}</p>
                                        </div>
                                        <Link
                                            href={ROUTES.PROFILE}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-primary/5 hover:text-primary rounded-xl transition-all"
                                        >
                                            <span className="material-symbols-outlined">person</span>
                                            Meu Perfil
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setIsMobileMenuOpen(false);
                                                handleLogout();
                                            }}
                                            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                                        >
                                            <span className="material-symbols-outlined">logout</span>
                                            Sair
                                        </button>
                                    </div>
                                ) : (
                                    <Link
                                        href={ROUTES.LOGIN}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/25 hover:bg-primary-hover transition-all"
                                    >
                                        <span className="material-symbols-outlined">login</span>
                                        Entrar para começar
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default LandingHeader;
