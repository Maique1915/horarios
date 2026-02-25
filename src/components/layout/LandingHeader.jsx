'use client';

import React, { startTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import ROUTES from '../../routes';
import ThemeToggle from '../shared/ThemeToggle';

const LandingHeader = () => {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isLoggingOut, setIsLoggingOut] = React.useState(false);
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
                            <div className="relative" ref={menuRef}>
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

                                        {user && (user.role === 'admin' || user.role === 'curso') && (
                                            <Link
                                                href={user.role === 'curso' && user.courses?.code
                                                    ? `/${user.courses.code}/edit`
                                                    : (user.courses?.code ? `/${user.courses.code}/edit` : '#')
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
                                className="inline-flex items-center justify-center px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                Entrar
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default LandingHeader;
