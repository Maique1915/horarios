'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import ROUTES from '../routes';
import LoadingSpinner from './LoadingSpinner';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const from = searchParams.get('from') || ROUTES.HOME;

    const slides = [
        {
            icon: 'cloud_sync',
            title: 'Seus dados sempre salvos',
            description: 'Não perca mais seu progresso. Com uma conta, suas grades, horários e cronogramas ficam salvos na nuvem para acessar de qualquer lugar.'
        },
        {
            icon: 'diamond',
            title: 'Recursos Premium',
            description: 'Desbloqueie ferramentas exclusivas como a Previsão de Formatura com IA e a Gestão Completa de Atividades Complementares.'
        },
        {
            icon: 'dashboard',
            title: 'Organização Total',
            description: 'Sua vida acadêmica centralizada em um único lugar. Acompanhe seu desempenho e planeje seu futuro semestre a semestre.'
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

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
                    router.push(`${ROUTES.PLANS}?alert=expired`);
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
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex">
            {/* Left Side - Carousel (Desktop Only) */}
            <div className="hidden lg:flex w-1/2 bg-primary relative overflow-hidden items-center justify-center p-12 text-white">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/50 to-transparent"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10 max-w-lg text-center">
                    <div className="mb-12 relative h-64 flex items-center justify-center">
                        {slides.map((slide, index) => (
                            <div
                                key={index}
                                className={`absolute inset-0 transition-all duration-700 transform flex flex-col items-center justify-center ${index === currentSlide
                                        ? 'opacity-100 translate-x-0 scale-100'
                                        : index < currentSlide
                                            ? 'opacity-0 -translate-x-full scale-95'
                                            : 'opacity-0 translate-x-full scale-95'
                                    }`}
                            >
                                <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
                                    <span className="material-symbols-outlined text-5xl">{slide.icon}</span>
                                </div>
                                <h2 className="text-3xl font-bold mb-4">{slide.title}</h2>
                                <p className="text-lg text-blue-100 leading-relaxed">{slide.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center gap-3">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-900">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto lg:mx-0 mb-4 text-primary lg:hidden">
                            <span className="material-symbols-outlined text-4xl">lock</span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
                            Bem-vindo de volta
                        </h1>
                        <p className="mt-2 text-slate-500 dark:text-slate-400">
                            Preencha seus dados para acessar sua conta
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="border border-red-500/20 bg-red-500/10 rounded-lg p-4 flex items-start gap-3 animate-pulse">
                                <span className="material-symbols-outlined text-xl text-red-500 mt-0.5">error</span>
                                <p className="text-sm font-medium text-red-600">{error}</p>
                            </div>
                        )}

                        <div className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Usuário
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        person
                                    </span>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        placeholder="Seu nome de usuário"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        Senha
                                    </label>
                                    <button type="button" className="text-xs font-medium text-primary hover:text-primary-dark">
                                        Esqueceu a senha?
                                    </button>
                                </div>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        key
                                    </span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        placeholder="Sua senha secreta"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-primary rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-xl block">
                                            {showPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <span>Entrar na Plataforma</span>
                            <span className="material-symbols-outlined text-xl">arrow_forward</span>
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white dark:bg-slate-900 text-slate-500">ou</span>
                            </div>
                        </div>

                        <div className="text-center">
                            <p className="text-slate-600 dark:text-slate-400">
                                Ainda não tem uma conta?{' '}
                                <button
                                    type="button"
                                    onClick={() => router.push(ROUTES.REGISTER)}
                                    className="text-primary hover:text-primary-dark font-bold hover:underline"
                                >
                                    Criar conta gratuitamente
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
