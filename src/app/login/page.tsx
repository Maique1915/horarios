'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext';
import ROUTES from '../../routes';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

// --- Constants ---
const SLIDES = [
    {
        icon: 'cloud_sync',
        image: '/mapa.png',
        title: 'Seus dados sempre salvos',
        description: 'Não perca mais seu progresso. Com uma conta, suas grades, horários e cronogramas ficam salvos na nuvem para acessar de qualquer lugar.'
    },
    {
        icon: 'neurology',
        image: '/predition.png',
        title: 'Previsão com IA',
        description: 'Simule seus próximos semestres e receba sugestões otimizadas para se formar no menor tempo possível.'
    },
    {
        icon: 'workspace_premium',
        image: '/atividades.png',
        title: 'Gestão de Atividades',
        description: 'Controle suas horas complementares, gerencie certificados e acompanhe o progresso exato para completar a carga horária.'
    },
    {
        icon: 'dashboard',
        image: '/horarios.png',
        title: 'Organização Total',
        description: 'Sua vida acadêmica centralizada em um único lugar. Acompanhe seu desempenho e planeje seu futuro semestre a semestre.'
    }
];

// --- Controller ---
const useLoginController = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Handle null searchParams safely inside Suspense boundary later, but hook needs to be safe.
    // In Next.js App Router, useSearchParams is safe to call but might return null during static generation if not suspended.
    // However, we are wrapping the component in Suspense in the main export, so it's fine.
    const from = searchParams?.get('from') || ROUTES.HOME;

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(username, password);

            if (result.success && result.user) {
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
                setError(result.error || 'Erro ao realizar login. Tente novamente.');
                setLoading(false); // Only stop loading on error, on success we redirect
            }
        } catch (err) {
            setError('Ocorreu um erro inesperado. Tente novamente.');
            console.error(err);
            setLoading(false);
        }
    };

    return {
        // State
        username, setUsername,
        password, setPassword,
        error,
        loading,
        showPassword, setShowPassword,
        currentSlide, setCurrentSlide,
        slides: SLIDES,
        // Actions
        handleSubmit,
        router,
        ROUTES
    };
};

// --- View ---
const LoginView = ({ ctrl }: { ctrl: ReturnType<typeof useLoginController> }) => {
    if (ctrl.loading) {
        return <LoadingSpinner message="Autenticando..." />;
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex">
            {/* Left Side - Carousel (Desktop Only) */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-900">
                {ctrl.slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ${index === ctrl.currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                        {/* Background Image with Blur */}
                        <div className="absolute inset-0">
                            <Image
                                src={slide.image}
                                alt={slide.title}
                                fill
                                className="object-cover blur-[3px] scale-105 transform" // Scale to avoid white edges from blur
                                priority={index === 0}
                            />
                            {/* Overlays for readability */}
                            <div className="absolute inset-0 bg-primary/70 mix-blend-multiply" />
                            <div className="absolute inset-0 bg-black/40" />
                        </div>

                        {/* Content Overlay */}
                        <div className="relative h-full flex flex-col items-center justify-center p-16 text-center text-white">
                            <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mb-8 backdrop-blur-md border border-white/20 shadow-2xl">
                                <span className="material-symbols-outlined text-5xl text-white">{slide.icon}</span>
                            </div>
                            <h2 className="text-4xl font-bold mb-6 tracking-tight drop-shadow-lg">{slide.title}</h2>
                            <p className="text-lg text-blue-50 leading-relaxed max-w-lg font-medium drop-shadow-md">
                                {slide.description}
                            </p>
                        </div>
                    </div>
                ))}

                {/* Dots Navigation */}
                <div className="absolute bottom-12 left-0 right-0 z-20 flex justify-center gap-3">
                    {ctrl.slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => ctrl.setCurrentSlide(index)}
                            className={`h-2.5 rounded-full transition-all duration-300 backdrop-blur-sm ${index === ctrl.currentSlide
                                ? 'w-10 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]'
                                : 'w-2.5 bg-white/40 hover:bg-white/60'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
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

                    <form onSubmit={ctrl.handleSubmit} className="space-y-6">
                        {ctrl.error && (
                            <div className="border border-red-500/20 bg-red-500/10 rounded-lg p-4 flex items-start gap-3 animate-pulse">
                                <span className="material-symbols-outlined text-xl text-red-500 mt-0.5">error</span>
                                <p className="text-sm font-medium text-red-600">{ctrl.error}</p>
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
                                        value={ctrl.username}
                                        onChange={(e) => ctrl.setUsername(e.target.value)}
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
                                        type={ctrl.showPassword ? "text" : "password"}
                                        value={ctrl.password}
                                        onChange={(e) => ctrl.setPassword(e.target.value)}
                                        className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        placeholder="Sua senha secreta"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => ctrl.setShowPassword(!ctrl.showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-primary rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-xl block">
                                            {ctrl.showPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={ctrl.loading}
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
                                    onClick={() => ctrl.router.push(ctrl.ROUTES.REGISTER)}
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

// Wrapper Component to use Suspense for useSearchParams
const LoginWithController = () => {
    const ctrl = useLoginController();
    return <LoginView ctrl={ctrl} />;
};

export default function LoginPage() {
    return (
        <Suspense fallback={<LoadingSpinner message="Carregando..." />}>
            <LoginWithController />
        </Suspense>
    );
}
