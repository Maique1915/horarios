'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import useMercadoPago from '../hooks/useMercadoPago';
import LoadingSpinner from './LoadingSpinner';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { register } = useAuth();
    const { createMercadoPagoCheckout } = useMercadoPago();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (password !== confirmPassword) {
                setError('As senhas não coincidem.');
                setLoading(false);
                return;
            }

            // 1. Criar conta no Supabase (status is_paid defaults to false)
            const result = await register(username, password, fullName);

            if (result.success && result.user) {
                // 2. Redirecionar para Pagamento
                console.log("Usuário criado, redirecionando para pagamento...", result.user.id);

                await createMercadoPagoCheckout({
                    testeId: result.user.id,
                    userEmail: username,
                });

                // O hook useMercadoPago já faz o redirect, mas por segurança:
                // setLoading(false);
            } else {
                setError(result.error || "Falha ao criar conta.");
                setLoading(false);
            }
        } catch (err) {
            setError('Ocorreu um erro inesperado. Tente novamente.');
            console.error(err);
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner message="Criando conta e gerando pagamento..." />;
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark overflow-hidden transition-all">
                    {/* Header */}
                    <div className="p-8 text-center border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-white/5">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                            <span className="material-symbols-outlined text-4xl">
                                person_add
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold text-text-light-primary dark:text-text-dark-primary mb-2 tracking-tight">
                            Criar Conta
                        </h1>
                        <p className="text-text-light-secondary dark:text-text-dark-secondary text-sm">
                            Cadastre-se e assine para acessar
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
                            <label className="block text-xs font-semibold uppercase text-text-light-secondary dark:text-text-dark-secondary tracking-wider">
                                Nome Completo
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                                placeholder="Seu nome completo"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase text-text-light-secondary dark:text-text-dark-secondary tracking-wider">
                                Usuário (Email)
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                                placeholder="Seu usuário/email"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase text-text-light-secondary dark:text-text-dark-secondary tracking-wider">
                                Senha
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                                    placeholder="Sua senha"
                                    required
                                    minLength={6}
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

                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase text-text-light-secondary dark:text-text-dark-secondary tracking-wider">
                                Confirmar Senha
                            </label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                                placeholder="Confirme a senha"
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="pt-2">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Plano Semestral</span>
                                <span className="text-lg font-bold text-primary">R$ 3,00</span>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm hover:translate-y-px"
                            >
                                <span className="text-sm">Cadastrar e Pagar</span>
                                <span className="material-symbols-outlined text-lg">payment</span>
                            </button>
                        </div>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => router.push('/login')}
                                className="text-xs text-slate-500 hover:text-primary font-medium transition-colors"
                            >
                                Já tem uma conta? Faça login
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
