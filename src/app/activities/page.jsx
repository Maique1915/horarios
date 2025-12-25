import React, { useState } from 'react';
import AppLayout from '../../components/AppLayout';
import ComplementaryActivitiesTable from '../../components/ComplementaryActivitiesTable';
import UserActivitiesManager from '../../components/UserActivitiesManager';

export default function ActivitiesPage() {
    const [activeTab, setActiveTab] = useState('user'); // 'user' or 'catalog'

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto p-6 md:p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-text-light-primary dark:text-text-dark-primary mb-2">
                        Gerenciamento de Atividades Complementares
                    </h1>
                    <p className="text-text-light-secondary dark:text-text-dark-secondary mb-6">
                        Acompanhe seu progresso e consulte o regulamento.
                    </p>

                    <div className="flex border-b border-border-light dark:border-border-dark">
                        <button
                            onClick={() => setActiveTab('user')}
                            className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'user'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-text-light-secondary hover:text-text-light-primary dark:text-text-dark-secondary dark:hover:text-text-dark-primary'
                                }`}
                        >
                            Minhas Atividades
                        </button>
                        <button
                            onClick={() => setActiveTab('catalog')}
                            className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'catalog'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-text-light-secondary hover:text-text-light-primary dark:text-text-dark-secondary dark:hover:text-text-dark-primary'
                                }`}
                        >
                            Catálogo Completo
                        </button>
                    </div>
                </header>

                <div className="animate-fadeIn">
                    {activeTab === 'user' ? (
                        <UserActivitiesManager />
                    ) : (
                        <ComplementaryActivitiesTable />
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
