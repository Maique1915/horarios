'use client';

import React from 'react';

const LandingFooter = () => {
    return (
        <footer className="bg-[#0F172A] text-white pt-12 pb-12 overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[100px] -ml-32 -mb-32"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs text-gray-500">© 2026 Horários CEFET. Desenvolvido para a comunidade acadêmica.</p>
                    <div className="flex items-center gap-6 text-xs text-gray-500">
                        <a href="#" className="hover:text-white transition-colors">Privacidade</a>
                        <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
                        <div className="h-4 w-px bg-white/10"></div>
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Sistema Online</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default LandingFooter;
