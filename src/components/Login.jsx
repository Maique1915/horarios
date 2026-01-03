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

    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const from = searchParams.get('from') || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(username, password);

            if (result.success) {
                // Check if user is expired
                let isExpired = false;
                if (result.user.subscription_expires_at) {
                    const expiresAt = new Date(result.user.subscription_expires_at);
                    if (new Date() > expiresAt) {
                        isExpired = true;
                    }
                }

                if (isExpired) {
                    router.push('/plans?alert=expired');
                } else {
                    router.push(from);
                }
            } else {
                setError(result.error);
                setLoading(false); // Only stop loading on error, on success we redirect
            }
        } catch (err) {
            setError('Ocorreu um erro inesperado. Tente novamente.');
            console.error(err);
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner message="Autenticando..." />;
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark overflow-hidden transition-all">
                    {/* Header */}
                    <div className="p-8 text-center border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-white/5">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                            <span className="material-symbols-outlined text-4xl">lock</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">
                            Login
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Acesse sua conta para continuar
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {error && (
                            <div className="border border-red-500/20 bg-red-500/10 rounded-lg p-3 flex items-start gap-3">
                                <span className="material-symbols-outlined text-lg text-red-500">error</span>
                                <p className="text-sm font-medium text-red-600">{error}</p>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 tracking-wider">
                                Usuário
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                                    person
                                </span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                                    placeholder="Seu usuário"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 tracking-wider">
                                Senha
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                                    key
                                </span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                                    placeholder="Sua senha"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary"
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm hover:translate-y-px"
                        >
                            <span className="text-sm">Entrar</span>
                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </button>

                        <div className="text-center pt-2">
                            <p className="text-xs text-slate-500">
                                Não tem uma conta?{' '}
                                <button
                                    type="button"
                                    onClick={() => router.push('/register')}
                                    className="text-primary hover:underline font-medium"
                                >
                                    Cadastre-se aqui
                                </button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
