import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import AppLayout from '../components/layout/AppLayout';
import './globals.css';
import { Lexend } from 'next/font/google';

const lexend = Lexend({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-lexend',
});

export const metadata = {
    title: 'Horários CEFET',
    description: 'Sistema de Grade Horária e Planejamento',
};

import QueryProvider from '@/components/layout/QueryProvider';

import { SpeedInsights } from "@vercel/speed-insights/next"

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-BR" className={lexend.variable}>
            <head>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap&v=2" crossOrigin="anonymous" />
            </head>
            <body className={lexend.className}>
                <QueryProvider>
                    <AuthProvider>
                        <AppLayout>
                            {children}
                            <SpeedInsights />
                        </AppLayout>
                    </AuthProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
