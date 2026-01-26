import React from 'react';
import Script from 'next/script';
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
                <meta name="google-adsense-account" content="ca-pub-6346152303245774" />
                <meta name="c0412664d2920880eb8e455ba11ad4c45daa7826" content="c0412664d2920880eb8e455ba11ad4c45daa7826" />
                <meta name="referrer" content="no-referrer-when-downgrade" />
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
                <script
                    async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6346152303245774"
                    crossOrigin="anonymous"
                ></script>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
(function(tunyl){
var d = document,
    s = d.createElement('script'),
    l = d.scripts[d.scripts.length - 1];
s.settings = tunyl || {};
s.src = "\\/\\/unusualproject.com\\/bDX.VDsZdgGylE0TYgWLcA\\/MeSm\\/9BujZLU\\/lOkHPLTpYC3_NCTKcX2jOjT\\/citKNkjxcS1gNkzKYG5KOdA-";
s.async = true;
s.referrerPolicy = 'no-referrer-when-downgrade';
l.parentNode.insertBefore(s, l);
})({})
                        `
                    }}
                />
            </body>
        </html>
    );
}
