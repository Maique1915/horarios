'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

const LandingHeader = () => {
    const [theme, setTheme] = useState('light');
    const { user } = useAuth();

    useEffect(() => {
        // Theme initialization
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('color-theme');
            if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                setTheme('dark');
                document.documentElement.classList.add('dark');
            } else {
                setTheme('light');
                document.documentElement.classList.remove('dark');
            }
        }
    }, []);

    const toggleTheme = () => {
        if (theme === 'light') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
            setTheme('dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
            setTheme('light');
        }
    };

    return (
        <nav className="sticky top-0 z-50 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-gray-400 transition-colors"
                        >
                            {theme === 'dark' ? (
                                <span className="material-symbols-outlined">light_mode</span>
                            ) : (
                                <span className="material-symbols-outlined">dark_mode</span>
                            )}
                        </button>
                        {!user && (
                            <Link
                                href="/login"
                                className="hidden sm:inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
                            >
                                Entrar
                            </Link>
                        )}
                        {user && (
                            <Link
                                href="/profile"
                                className="hidden sm:inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
                            >
                                Perfil
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default LandingHeader;
