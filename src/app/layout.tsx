import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import AppLayout from '../components/AppLayout';
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-BR" className={lexend.variable}>
            <head>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" />
            </head>
            <body className={lexend.className}>
                <AuthProvider>
                    <AppLayout>
                        {children}
                    </AppLayout>
                </AuthProvider>
            </body>
        </html>
    );
}
