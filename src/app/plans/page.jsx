"use client";

import React from 'react';
import useMercadoPago from '@/hooks/useMercadoPago';
import { useAuth } from '@/contexts/AuthContext';

export default function PlansPage() {
    const { createMercadoPagoCheckout } = useMercadoPago();
    const { user } = useAuth();

    const handleSubscribe = () => {
        if (!user) {
            alert("Você precisa estar logado para assinar.");
            return;
        }

        createMercadoPagoCheckout({
            testeId: user.id, // ID do usuário para o webhook
            userEmail: user.username, // Assumindo username como email, se não for, ajustar
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Planos e Preços
                    </h2>
                    <p className="mt-4 text-xl text-gray-600">
                        Escolha o plano ideal para você e desbloqueie todo o potencial do gerador de horários.
                    </p>
                </div>

                <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-2">
                    {/* Plano Gratuito */}
                    <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white">
                        <div className="p-6">
                            <h2 className="text-lg leading-6 font-medium text-gray-900">Gratuito</h2>
                            <p className="mt-4 text-sm text-gray-500">Para quem está começando e quer testar.</p>
                            <p className="mt-8">
                                <span className="text-4xl font-extrabold text-gray-900">R$0</span>
                                <span className="text-base font-medium text-gray-500">/mês</span>
                            </p>
                            <button
                                type="button"
                                disabled
                                className="mt-8 block w-full bg-gray-300 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center cursor-not-allowed"
                            >
                                Plano Atual
                            </button>
                        </div>
                        <div className="pt-6 pb-8 px-6">
                            <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">O que está incluído</h3>
                            <ul role="list" className="mt-6 space-y-4">
                                <li className="flex space-x-3">
                                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm text-gray-500">Visualização de Horários</span>
                                </li>
                                <li className="flex space-x-3">
                                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm text-gray-500">Acesso Básico</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Plano Premium */}
                    <div className="border border-indigo-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white relative">
                        <div className="absolute top-0 right-0 -mt-4 mr-4 bg-indigo-500 rounded-full px-3 py-1 text-xs font-semibold text-white uppercase tracking-wide">
                            Popular
                        </div>
                        <div className="p-6">
                            <h2 className="text-lg leading-6 font-medium text-gray-900">Semestral</h2>
                            <p className="mt-4 text-sm text-gray-500">Acesso ilimitado por um semestre.</p>
                            <p className="mt-8">
                                <span className="text-4xl font-extrabold text-gray-900">R$3,00</span>
                                <span className="text-base font-medium text-gray-500">/semestre</span>
                            </p>
                            <button
                                onClick={handleSubscribe}
                                className="mt-8 block w-full bg-indigo-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-indigo-700"
                            >
                                Assinar Agora
                            </button>
                        </div>
                        <div className="pt-6 pb-8 px-6">
                            <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">O que está incluído</h3>
                            <ul role="list" className="mt-6 space-y-4">
                                <li className="flex space-x-3">
                                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm text-gray-500">Geração Automática de Grade</span>
                                </li>
                                <li className="flex space-x-3">
                                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm text-gray-500">Prioridade no Suporte</span>
                                </li>
                                <li className="flex space-x-3">
                                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm text-gray-500">Acesso a novas Features</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
