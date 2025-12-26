'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    const { login, register } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // In Next.js, we will use query param 'from' instead of state for redirects
    const from = searchParams.get('from') || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegistering) {
                if (password !== confirmPassword) {
                    setError('As senhas não coincidem.');
                    setLoading(false);
                    return;
                }
                // 1. Cadastro no Supabase
                const result = await register(username, password, fullName);

                if (result.success) {
                    // Registration successful, redirect to home or login
                    // If supabase returns a session, we can redirect immediately
                    if (result.session) {
                        router.push(from);
                    } else {
                        // Probably waiting for email confirmation if enabled, 
                        // but assuming immediate access for now given the context.
                        // If no session, they might need to log in.
                        // Let's try auto-login or just redirect to login mode
                        setIsRegistering(false);
                        setError('Conta criada com sucesso! Faça login para continuar.');
                    }
                } else {
                    setError(result.error);
                }
            } else {
                // Login
                const result = await login(username, password);

                if (result.success) {
                    router.push(from);
                } else {
                    setError(result.error);
                }
            }
        } catch (err) {
            setError('Ocorreu um erro inesperado. Tente novamente.');
            console.error(err);
        }

        setLoading(false);
    };

    if (loading) {
        return <LoadingSpinner message={isRegistering ? "Criando sua conta..." : "Autenticando..."} />;
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark overflow-hidden transition-all">
                    {/* Header */}
                    <div className="p-8 text-center border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-white/5">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                            <span className="material-symbols-outlined text-4xl">
                                {isRegistering ? 'person_add' : 'lock'}
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold text-text-light-primary dark:text-text-dark-primary mb-2 tracking-tight">
                            {isRegistering ? 'Criar Conta' : 'Área Restrita'}
                        </h1>
                        <p className="text-text-light-secondary dark:text-text-dark-secondary text-sm">
                            {isRegistering ? 'Preencha os dados para se cadastrar' : 'Acesso exclusivo para administradores'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Error Message */}
                        {error && (
                            <div className={`border rounded-lg p-3 flex items-start gap-3 ${error.includes('sucesso') ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                <span className={`material-symbols-outlined text-lg ${error.includes('sucesso') ? 'text-green-600' : 'text-red-500'}`}>
                                    {error.includes('sucesso') ? 'check_circle' : 'error'}
                                </span>
                                <div className="flex-1">
                                    <p className={`text-sm font-medium ${error.includes('sucesso') ? 'text-green-700' : 'text-red-600'}`}>
                                        {error}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Username */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase text-text-light-secondary dark:text-text-dark-secondary tracking-wider">
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
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-text-light-primary dark:text-text-dark-primary focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400"
                                    placeholder="Seu usuário"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Name Field for Registration */}
                        {isRegistering && (
                            <div className="space-y-1.5 animate-fadeIn">
                                <label className="block text-xs font-semibold uppercase text-text-light-secondary dark:text-text-dark-secondary tracking-wider">
                                    Nome Completo
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-light-secondary dark:text-text-dark-secondary text-xl">
                                        badge
                                    </span>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-text-light-primary dark:text-text-dark-primary focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400"
                                        placeholder="Seu nome completo"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase text-text-light-secondary dark:text-text-dark-secondary tracking-wider">
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
                                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-text-light-primary dark:text-text-dark-primary focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400"
                                    placeholder="Sua senha"
                                    required
                                    minLength={6}
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

                        {/* Confirm Password */}
                        {isRegistering && (
                            <div className="space-y-1.5 animate-fadeIn">
                                <label className="block text-xs font-semibold uppercase text-text-light-secondary dark:text-text-dark-secondary tracking-wider">
                                    Confirmar Senha
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-light-secondary dark:text-text-dark-secondary text-xl">
                                        lock_clock
                                    </span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-text-light-primary dark:text-text-dark-primary focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400"
                                        placeholder="Confirme a senha"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:translate-y-px"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                                    <span className="text-sm">{isRegistering ? 'Cadastrando...' : 'Autenticando...'}</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-sm">{isRegistering ? 'Cadastrar' : 'Entrar'}</span>
                                    <span className="material-symbols-outlined text-lg">
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
                                className="text-xs text-text-light-secondary hover:text-primary font-medium transition-colors"
                            >
                                {isRegistering
                                    ? 'Já tem uma conta? Faça login'
                                    : 'Não tem conta? Cadastre-se'}
                            </button>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="px-8 pb-6 text-center border-t border-border-light dark:border-border-dark pt-6 bg-slate-50/30">
                        <button
                            onClick={() => router.push('/')}
                            className="text-xs text-text-light-secondary dark:text-text-dark-secondary hover:text-primary transition-colors flex items-center gap-1.5 mx-auto font-medium"
                        >
                            <span className="material-symbols-outlined text-sm">
                                arrow_back
                            </span>
                            <span>Voltar para Home</span>
                        </button>
                    </div>
                </div>

                {/* Info Card - Simpler */}
                {!isRegistering && (
                    <div className="mt-6 text-center">
                        <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">
                                lock
                            </span>
                            <span>Acesso restrito administrativas</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
