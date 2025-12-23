'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // In Next.js, we will use query param 'from' instead of state for redirects
    const from = searchParams.get('from') || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (isRegistering) {
            // Mock registration or implement if backend supports
            setError('Cadastro ainda não implementado no sistema.');
            setLoading(false);
            return;
        }

        const result = await login(username, password);

        if (result.success) {
            router.push(from);
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    if (loading) {
        return <LoadingSpinner message="Autenticando..." />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background-light via-surface-light to-background-light dark:from-background-dark dark:via-surface-dark dark:to-background-dark flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl border border-border-light dark:border-border-dark overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary to-primary/80 p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <span className="material-symbols-outlined text-5xl text-white">
                                {isRegistering ? 'person_add' : 'lock'}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {isRegistering ? 'Criar Conta' : 'Área Restrita'}
                        </h1>
                        <p className="text-white/90 text-sm">
                            {isRegistering ? 'Preencha os dados para se cadastrar' : 'Acesso exclusivo para administradores'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
                                <span className="material-symbols-outlined text-red-500 text-xl">
                                    error
                                </span>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-red-500">
                                        {error}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Username */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-text-light-primary dark:text-text-dark-primary">
                                Usuário
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-light-secondary dark:text-text-dark-secondary text-xl">
                                    person
                                </span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    placeholder="Digite seu usuário"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Name Field for Registration */}
                        {isRegistering && (
                            <div className="space-y-2 animate-fadeIn">
                                <label className="block text-sm font-medium text-text-light-primary dark:text-text-dark-primary">
                                    Nome Completo
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-light-secondary dark:text-text-dark-secondary text-xl">
                                        badge
                                    </span>
                                    <input
                                        type="text"
                                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        placeholder="Digite seu nome"
                                    // Not enforcing required for mock
                                    />
                                </div>
                            </div>
                        )}

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-text-light-primary dark:text-text-dark-primary">
                                Senha
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-light-secondary dark:text-text-dark-secondary text-xl">
                                    key
                                </span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    placeholder="Digite sua senha"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light-secondary dark:text-text-dark-secondary hover:text-primary transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>{isRegistering ? 'Cadastrando...' : 'Autenticando...'}</span>
                                </>
                            ) : (
                                <>
                                    <span>{isRegistering ? 'Cadastrar' : 'Entrar'}</span>
                                    <span className="material-symbols-outlined text-xl">
                                        {isRegistering ? 'person_add' : 'arrow_forward'}
                                    </span>
                                </>
                            )}
                        </button>

                        <div className="text-center pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsRegistering(!isRegistering);
                                    setError('');
                                }}
                                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                            >
                                {isRegistering
                                    ? 'Já tem uma conta? Faça login'
                                    : 'Não tem conta? Cadastre-se'}
                            </button>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="px-8 pb-8 text-center">
                        <button
                            onClick={() => router.push('/')}
                            className="text-sm text-text-light-secondary dark:text-text-dark-secondary hover:text-primary transition-colors flex items-center gap-1 mx-auto"
                        >
                            <span className="material-symbols-outlined text-base">
                                arrow_back
                            </span>
                            <span>Voltar para Home</span>
                        </button>
                    </div>
                </div>

                {/* Info Card */}
                <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
                    <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-base">
                            info
                        </span>
                        <span>Entre em contato com o administrador para obter credenciais</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
