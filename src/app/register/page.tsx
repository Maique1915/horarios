'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext';
import ROUTES from '../../routes';
import { supabase } from '../../lib/supabaseClient';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import PixPayment from '../../components/plans/PixPayment';
import { SLIDES } from '../login/page';

// --- Types ---
interface Course {
    id: string;
    name: string;
    shift: string | null;
    university?: {
        name: string;
    }
}

// --- Controller ---
const useRegisterController = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPixUI, setShowPixUI] = useState(false);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [currentSlide, setCurrentSlide] = useState(0);

    const { register } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchCourses = async () => {
            const { data, error } = await supabase
                .from('courses')
                .select('id, name, shift, university:universities(name)');
            if (error) console.error("Error fetching courses:", error);
            else {
                const formatted = (data || []).map((c: any) => ({
                    ...c,
                    university: Array.isArray(c.university) ? c.university[0] : c.university
                }));
                setCourses(formatted as Course[]);
            }
        };
        fetchCourses();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
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
            console.log("Registering user:", { username, fullName, selectedCourse });
            const result = await register(username, password, fullName, selectedCourse);

            if (result.success && result.user) {
                // 2. SUCESSO: Mostrar Instruções PIX
                setLoading(false);
                setShowPixUI(true); // Show manual payment instructions
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

    return {
        // State
        username, setUsername,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        fullName, setFullName,
        error,
        loading,
        showPassword, setShowPassword,
        showPixUI,
        courses,
        selectedCourse, setSelectedCourse,
        currentSlide, setCurrentSlide,
        slides: SLIDES,
        // Actions
        handleSubmit,
        router,
        ROUTES
    };
};

// --- View ---
const RegisterView = ({ ctrl }: { ctrl: ReturnType<typeof useRegisterController> }) => {
    if (ctrl.loading) {
        return <LoadingSpinner message="Criando conta..." />;
    }

    if (ctrl.showPixUI) {
        return <PixPayment />;
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex">
            {/* Left Side - Carousel (Desktop Only) */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-900">
                {ctrl.slides.map((slide: any, index: number) => (
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
                                className="object-cover blur-[3px] scale-105 transform"
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
                    {ctrl.slides.map((_: any, index: number) => (
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

            {/* Right Side - Registration Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-900 overflow-y-auto">
                <div className="w-full max-w-md space-y-8 py-8">
                    <div className="text-center lg:text-left">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto lg:mx-0 mb-4 text-primary lg:hidden">
                            <span className="material-symbols-outlined text-4xl">person_add</span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
                            Criar Conta
                        </h1>
                        <p className="mt-2 text-slate-500 dark:text-slate-400">
                            Cadastre-se para começar a organizar sua vida acadêmica.
                        </p>
                    </div>

                    <form onSubmit={ctrl.handleSubmit} className="space-y-5">
                        {ctrl.error && (
                            <div className="border border-red-500/20 bg-red-500/10 rounded-lg p-4 flex items-start gap-3 animate-pulse">
                                <span className="material-symbols-outlined text-xl text-red-500 mt-0.5">error</span>
                                <p className="text-sm font-medium text-red-600">{ctrl.error}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Nome Completo
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        badge
                                    </span>
                                    <input
                                        type="text"
                                        value={ctrl.fullName}
                                        onChange={(e) => ctrl.setFullName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        placeholder="Seu nome completo"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Curso
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10">
                                        school
                                    </span>
                                    <select
                                        value={ctrl.selectedCourse}
                                        onChange={(e) => ctrl.setSelectedCourse(e.target.value)}
                                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none cursor-pointer"
                                        required
                                    >
                                        <option value="" disabled>Selecione seu curso</option>
                                        {ctrl.courses.map(course => (
                                            <option key={course.id} value={course.id}>
                                                {course.name} ({course.university?.name || 'Uni'} - {course.shift || 'Geral'})
                                            </option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                        keyboard_arrow_down
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Usuário (Email)
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
                                        placeholder="Seu usuário/email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        Senha
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={ctrl.showPassword ? "text" : "password"}
                                            value={ctrl.password}
                                            onChange={(e) => ctrl.setPassword(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                            placeholder="Sua senha"
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => ctrl.setShowPassword(!ctrl.showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-primary rounded-lg"
                                        >
                                            <span className="material-symbols-outlined text-xl flex items-center justify-center">
                                                {ctrl.showPassword ? 'visibility_off' : 'visibility'}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        Confirmar
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={ctrl.showPassword ? "text" : "password"}
                                            value={ctrl.confirmPassword}
                                            onChange={(e) => ctrl.setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                            placeholder="Confirme"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={ctrl.loading}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
                        >
                            <span>Criar Minha Conta</span>
                            <span className="material-symbols-outlined text-xl">arrow_forward</span>
                        </button>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white dark:bg-slate-900 text-slate-500 uppercase text-xs font-bold tracking-widest">ou</span>
                            </div>
                        </div>

                        <div className="text-center">
                            <p className="text-slate-600 dark:text-slate-400">
                                Já possui uma conta?{' '}
                                <button
                                    type="button"
                                    onClick={() => ctrl.router.push(ctrl.ROUTES.LOGIN)}
                                    className="text-primary hover:text-primary-dark font-bold hover:underline"
                                >
                                    Fazer login
                                </button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default function RegisterPage() {
    const ctrl = useRegisterController();
    return <RegisterView ctrl={ctrl} />;
}
