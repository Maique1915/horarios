'use client';

import React, { useState, useEffect, startTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import ROUTES from '../../routes';
import { loadDbData } from '../../services/disciplinaService';
import Header from './Header';
import LandingFooter from './LandingFooter';
import ThemeToggle from '../shared/ThemeToggle';

const AppLayout = ({ children }) => {
    const params = useParams();
    const cur = params?.cur; // Handle potential undefined
    const pathname = usePathname();
    const { user, isExpired } = useAuth();

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

    if (pathname === '/') {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans antialiased text-text-light dark:text-text-dark">
                <Header />
                <main>
                    {children}
                </main>
                <LandingFooter />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
            <Header />

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
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
};

export default AppLayout;
