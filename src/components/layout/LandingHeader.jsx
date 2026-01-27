'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import ROUTES from '../../routes';
import ThemeToggle from '../shared/ThemeToggle';

const LandingHeader = () => {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        if (confirm('Deseja realmente sair?')) {
            logout();
            router.push('/');
        }
    };

    return (
        <nav className="sticky top-0 z-50 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary rounded-lg p-1.5 flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-xl">school</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">Horários CEFET</span>
                    </div>
                    <div className="hidden md:flex space-x-8">
                        <a
                            href="#funcionalidades"
                            className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition"
                        >
                            Funcionalidades
                        </a>
                        <a
                            href="#cursos"
                            className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition"
                        >
                            Cursos
                        </a>
                        <a
                            href="#depoimentos"
                            className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition"
                        >
                            Depoimentos
                        </a>
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
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

                        {/* Admin Link logic */}
                        {user && (user.role === 'admin' || user.role === 'curso') && (
                            <Link
                                href={user.role === 'curso' && user.courses?.code
                                    ? `/${user.courses.code}/edit`
                                    : (user.courses?.code ? `/${user.courses.code}/edit` : '#')
                                }
                                className="flex items-center gap-2 text-sm text-text-light-secondary dark:text-text-dark-secondary hover:text-primary transition-colors"
                                title="Gerenciar disciplinas"
                            >
                                <span className="material-symbols-outlined text-lg">settings</span>
                                <span className="hidden sm:block">Admin</span>
                            </Link>
                        )}

                        {!user && (
                            <Link
                                href={ROUTES.LOGIN}
                                className="hidden sm:inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
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
