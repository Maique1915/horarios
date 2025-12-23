import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import AppLayout from '../components/AppLayout';
import './globals.css';

export const metadata = {
    title: 'Sistema de Matrículas',
    description: 'Sistema de Matrículas CEFET-PET',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-BR">
            <head>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap" rel="stylesheet" />
            </head>
            <body>
                <AuthProvider>
                    <AppLayout>
                        {children}
                    </AppLayout>
                </AuthProvider>
            </body>
        </html>
    );
}
