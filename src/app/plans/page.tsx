"use client";

import React, { Suspense, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import PixPayment from '@/components/PixPayment';

// --- Controller ---

const usePlansController = () => {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const alertType = searchParams.get('alert');
    const [showPix, setShowPix] = useState(false);

    const handleSubscribe = () => {
        if (!user) {
            alert("Você precisa estar logado para assinar.");
            return;
        }
        setShowPix(true);
    };

    return {
        user,
        alertType,
        showPix,
        setShowPix,
        handleSubscribe
    };
};

// --- View Components ---

const ExpiredAlertView = () => (
    <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
        <div className="flex">
            <div className="flex-shrink-0">
                <span className="material-symbols-outlined text-red-500">priority_high</span>
            </div>
            <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Sua conta expirou</h3>
                <div className="mt-1 text-sm text-red-700">
                    <p>Para continuar acessando todas as funcionalidades, por favor, renove sua assinatura escolhendo um dos planos abaixo.</p>
                </div>
            </div>
        </div>
    </div>
);

const PlansView = ({ ctrl }: { ctrl: ReturnType<typeof usePlansController> }) => {
    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {ctrl.alertType === 'expired' && <ExpiredAlertView />}

                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Escolha seu Plano</h2>
                    <p className="mt-4 text-xl text-gray-600">Liberte todo o potencial da sua organização acadêmica.</p>
                </div>

                <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-2">
                    {/* Free Plan */}
                    <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white flex flex-col">
                        <div className="p-6">
                            <h2 className="text-lg leading-6 font-medium text-gray-900">Gratuito</h2>
                            <p className="mt-4 text-sm text-gray-500">O básico para visualizar sua grade.</p>
                            <p className="mt-8">
                                <span className="text-4xl font-extrabold text-gray-900">R$0</span>
                            </p>
                        </div>
                        <div className="pt-6 pb-8 px-6 flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">O que está incluído</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    {["Visualização de grade de horários", "Acesso ao mapa de atividades", "Gerador de possíveis grades"].map((feature, index) => (
                                        <li key={index} className="flex space-x-3">
                                            <span className="material-symbols-outlined text-green-500 shrink-0">check</span>
                                            <span className="text-sm text-gray-500">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-8">
                                <button type="button" disabled className="block w-full bg-gray-100 border border-transparent rounded-md py-2 text-sm font-semibold text-gray-400 text-center cursor-not-allowed">
                                    Plano Atual
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Semester Plan */}
                    <div className="border-2 border-indigo-500 rounded-lg shadow-lg divide-y divide-gray-200 bg-white relative flex flex-col">
                        <div className="absolute top-0 right-0 -mt-4 mr-4 bg-indigo-500 rounded-full px-3 py-1 text-xs font-semibold text-white uppercase tracking-wide shadow-sm">
                            Recomendado
                        </div>
                        <div className="p-6">
                            <h2 className="text-lg leading-6 font-bold text-indigo-600">Semestral</h2>
                            <p className="mt-4 text-sm text-gray-500">A experiência completa de organização.</p>
                            <p className="mt-8">
                                <span className="text-4xl font-extrabold text-gray-900">R$3,00</span>
                                <span className="text-base font-medium text-gray-500">/semestre</span>
                            </p>
                        </div>
                        <div className="pt-6 pb-8 px-6 flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">Tudo do Gratuito, mais:</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    {[
                                        "Salva matérias já cursadas (Histórico)",
                                        "Salva seus horários escolhidos",
                                        "Organizador de Atividades Complementares",
                                        "Visão geral do progresso no curso",
                                        "Acesso sem expiração por 6 meses"
                                    ].map((feature, index) => (
                                        <li key={index} className="flex space-x-3">
                                            <span className="material-symbols-outlined text-indigo-500 shrink-0">star</span>
                                            <span className="text-sm text-gray-900 font-medium">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-8">
                                <button
                                    onClick={ctrl.handleSubscribe}
                                    className="block w-full bg-indigo-600 border border-transparent rounded-md py-3 text-sm font-semibold text-white text-center hover:bg-indigo-700 shadow-md transition-all hover:scale-[1.02]"
                                >
                                    Pagar com PIX
                                </button>
                                <p className="mt-2 text-xs text-center text-gray-500 font-medium">Valor do PIX: R$ 3,00</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

function PlansContent() {
    const ctrl = usePlansController();

    if (ctrl.showPix) {
        return <PixPayment />;
    }

    return <PlansView ctrl={ctrl} />;
}

export default function PlansPage() {
    return (
        <Suspense fallback={<LoadingSpinner message="Carregando planos..." />}>
            <PlansContent />
        </Suspense>
    );
}
