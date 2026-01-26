'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCourseStats } from '../services/disciplinaService';
import { getComments } from '../services/commentService';
import { useAuth } from '../contexts/AuthContext';
import ROUTES from '../routes';
import { DbCourse } from '@/model/coursesModel';
import { DbComment, CommentWithUser } from '../model/commentsModel';
import { DbUser } from '../model/usersModel';

// --- View Controller (Logic) ---
interface CourseStats {
    code: string;
    name: string;
    disciplineCount: number;
    periods: number;
    status: 'active' | 'upcoming';
}

const useHomeController = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<CourseStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState<CommentWithUser[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [stats, commentsData] = await Promise.all([
                    getCourseStats(),
                    getComments()
                ]);
                setCourses(stats as CourseStats[]);
                // Ensure commentsData is an array and safely cast/assign
                setComments(Array.isArray(commentsData) ? (commentsData as unknown as CommentWithUser[]).slice(0, 3) : []);
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getLinkHref = (type: string) => {
        // If not logged in, redirect to courses section for course-specific tools
        // Exception: 'perfil' and 'atividades' require login
        if (!user) {
            if (['gera_grade', 'horarios', 'previsao', 'cronograma'].includes(type)) {
                return '#cursos';
            }
            return ROUTES.LOGIN;
        }

        const courseCode = user.courses.code;

        switch (type) {
            case 'gera_grade': return ROUTES.COURSE(courseCode);
            case 'horarios': return ROUTES.GRADES(courseCode);
            case 'previsao': return ROUTES.PREDICTION;
            case 'cronograma': return ROUTES.FLOW(courseCode);
            case 'atividades': return ROUTES.ACTIVITIES;
            case 'perfil': return ROUTES.PROFILE;
            default: return '#';
        }
    };

    return {
        user,
        courses,
        loading,
        comments,
        getLinkHref
    };
};

// --- View Components ---

const BannerSection = ({ user, ROUTES }: { user: DbUser | null, ROUTES: any }) => {
    return (
        <section className="relative pt-20 pb-24 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                <div className="inline-flex items-center rounded-full px-4 py-1.5 mb-8 border border-blue-100 bg-blue-50 text-primary dark:bg-slate-800 dark:border-slate-700 dark:text-blue-400">
                    <span className="text-xs font-semibold uppercase tracking-wide">Novo</span>
                    <span className="ml-2 text-sm font-medium">Gestão de atividades complementares disponível</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent pb-2">
                    Sua vida acadêmica,<br />finalmente organizada.
                </h1>
                <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10">
                    Monte sua grade horária de forma inteligente, acompanhe seu progresso e gerencie atividades
                    complementares em um só lugar.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link
                        href={user ? `/${user.courses.code || 'engcomp'}` : ROUTES.REGISTER}
                        className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-xl text-white bg-primary hover:bg-primary-hover shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                    >
                        Começar Agora
                        <span className="material-symbols-outlined ml-2 text-lg">arrow_forward</span>
                    </Link>
                    <a
                        href="#funcionalidades"
                        className="inline-flex items-center justify-center px-8 py-4 border border-border-light dark:border-border-dark text-base font-medium rounded-xl text-gray-700 dark:text-gray-200 bg-surface-light dark:bg-surface-dark hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm transition-all duration-200"
                    >
                        Saiba Mais
                    </a>
                </div>
                <div className="mt-16 relative mx-auto max-w-5xl">
                    <div className="rounded-2xl bg-surface-light dark:bg-surface-dark shadow-2xl border border-border-light dark:border-border-dark overflow-hidden p-2">
                        <div className="rounded-xl overflow-hidden bg-gray-50 dark:bg-slate-900 aspect-[16/9] flex items-center justify-center relative">
                            <div className="absolute inset-0 grid grid-cols-4 gap-4 p-8 opacity-20 pointer-events-none">
                                <div className="col-span-1 bg-primary/20 rounded-lg h-full"></div>
                                <div className="col-span-3 grid grid-rows-3 gap-4">
                                    <div className="bg-gray-200 dark:bg-slate-700 rounded-lg h-full"></div>
                                    <div className="bg-gray-200 dark:bg-slate-700 rounded-lg h-full row-span-2"></div>
                                </div>
                            </div>
                            <img
                                alt="Estudantes universitários trabalhando juntos com laptop, representando o uso do sistema"
                                className="object-cover w-full h-full opacity-60 mix-blend-overlay"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDszD8IyyOQJWa3cjrwyH42as-xaAPDX52FIc5agxlhOrz9DWr-vBZJaPQdlt75la65x-a0WtEtV_hrb5gV8c8SaAD5WdTKCqBa8nD4QqkxB_-KBkGpQuIf1NrF0ib3WdHcV8TnhKaaaUB8jKo3LXq23ph5Zdt_3LA-AvdYh3umqS1vcwqyKCi_NsOd962zSWAK2Y4UOHm35dVp9XxxghKgb93s0WOScxWN1a3BIY9t3LwWNmR58_I6MnWkwCWVh-Ltm0HJzTXTPCSc"
                            />
                            <div className="absolute z-10 text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary text-white shadow-lg mb-4">
                                    <span className="material-symbols-outlined text-4xl">calendar_month</span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Interface Intuitiva</h3>
                            </div>
                        </div>
                    </div>
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                </div>
            </div>
        </section>
    );
};

const FeaturesSection = ({ getLinkHref }: { getLinkHref: (t: string) => string }) => {
    return (
        <section className="py-20 bg-white dark:bg-slate-900" id="funcionalidades">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-base font-semibold text-primary uppercase tracking-wide">Recursos</h2>
                    <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                        Tudo o que você precisa para se formar
                    </p>
                    <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 mx-auto">
                        Ferramentas projetadas especificamente para simplificar a burocracia acadêmica.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Funcionalidade 1: Gera Grade */}
                    <Link
                        href={getLinkHref('gera_grade')}
                        className="flex flex-col bg-white dark:bg-surface-dark rounded-2xl overflow-hidden border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300 group cursor-pointer"
                    >
                        <div className="h-48 overflow-hidden bg-blue-50 dark:bg-slate-800 relative border-b border-border-light dark:border-border-dark">
                            <Image
                                src="/gera_grade.png"
                                alt="Interface do Gerador de Grade"
                                fill
                                className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="p-5 flex flex-col flex-grow">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined">add_task</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Gera Grade</h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                Monte sua grade horária visualmente, experimente combinações e evite conflitos.
                            </p>
                        </div>
                    </Link>

                    {/* Funcionalidade 2: Horários */}
                    <Link
                        href={getLinkHref('horarios')}
                        className="flex flex-col bg-white dark:bg-surface-dark rounded-2xl overflow-hidden border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300 group cursor-pointer"
                    >
                        <div className="h-48 overflow-hidden bg-purple-50 dark:bg-slate-800 relative border-b border-border-light dark:border-border-dark">
                            <Image
                                src="/horarios.png"
                                alt="Visualização de Horários"
                                fill
                                className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="p-5 flex flex-col flex-grow">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400">
                                    <span className="material-symbols-outlined">grid_on</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Horários</h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                Consulte rapidamente os horários de todas as disciplinas por período.
                            </p>
                        </div>
                    </Link>

                    {/* Funcionalidade 3: Mapa/Cronograma */}
                    <Link
                        href={getLinkHref('cronograma')}
                        className="flex flex-col bg-white dark:bg-surface-dark rounded-2xl overflow-hidden border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300 group cursor-pointer"
                    >
                        <div className="h-48 overflow-hidden bg-green-50 dark:bg-slate-800 relative border-b border-border-light dark:border-border-dark">
                            <Image
                                src="/mapa.png"
                                alt="Mapa de Pré-requisitos e Cronograma"
                                fill
                                className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="p-5 flex flex-col flex-grow">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400">
                                    <span className="material-symbols-outlined">timeline</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Cronograma</h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                Visualize pré-requisitos, planeje semestres e acompanhe sua trajetória.
                            </p>
                        </div>
                    </Link>

                    {/* Funcionalidade 4: Previsão */}
                    <Link
                        href={getLinkHref('previsao')}
                        className="flex flex-col bg-white dark:bg-surface-dark rounded-2xl overflow-hidden border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300 group cursor-pointer"
                    >
                        <div className="h-48 overflow-hidden bg-teal-50 dark:bg-slate-800 relative border-b border-border-light dark:border-border-dark">
                            <Image
                                src="/predition.png"
                                alt="Simulação de Previsão"
                                fill
                                className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="p-5 flex flex-col flex-grow">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center text-teal-600 dark:text-teal-400">
                                    <span className="material-symbols-outlined">neurology</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Previsão</h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                Simule seus próximos semestres e receba sugestões otimizadas para formatura.
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    );
};

const CoursesSection = ({ courses, loading }: { courses: CourseStats[], loading: boolean }) => {
    return (
        <section className="py-20 bg-background-light dark:bg-background-dark" id="cursos">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Cursos Disponíveis</h2>
                        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                            Atualmente suportamos os seguintes cursos de graduação.
                        </p>
                    </div>
                </div>
                {/* Courses Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Dynamic Courses */}
                    {loading && (
                        <div className="col-span-full text-center py-8">
                            <p className="text-gray-500">Carregando cursos...</p>
                        </div>
                    )}
                    {!loading && courses.map((course) => (
                        course.status === 'active' ? (
                            <Link
                                key={course.code}
                                href={`/${course.code}`}
                                className="group bg-white dark:bg-surface-dark rounded-xl p-6 border border-border-light dark:border-border-dark transition-all hover:border-primary dark:hover:border-primary cursor-pointer"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-primary">
                                        <span className="material-symbols-outlined">computer</span>
                                    </div>
                                    <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full">
                                        Ativo
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{course.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 uppercase">{course.code}</p>
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm">
                                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-base">book</span> {course.disciplineCount} Disciplinas
                                    </span>
                                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-base">event</span> {course.periods} Períodos
                                    </span>
                                </div>
                            </Link>
                        ) : (
                            <div
                                key={course.code}
                                className="group bg-white dark:bg-surface-dark rounded-xl p-6 border border-border-light dark:border-border-dark transition-all opacity-70 cursor-not-allowed pointer-events-none"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-primary">
                                        <span className="material-symbols-outlined">computer</span>
                                    </div>
                                    <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded-full">
                                        Em Breve
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{course.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 uppercase">{course.code}</p>
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm">
                                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-base">book</span> {course.disciplineCount} Disciplinas
                                    </span>
                                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-base">event</span> {course.periods} Períodos
                                    </span>
                                </div>
                            </div>
                        )
                    ))}

                    {/* Em Breve placeholder if needed, or remove */}
                    {!loading && courses.length === 0 && (
                        <div className="col-span-full text-center py-4">
                            <p className="text-gray-500">Nenhum curso disponível no momento.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

const TestimonialsSection = ({ comments }: { comments: CommentWithUser[] }) => {
    return (
        <section className="py-20 bg-white dark:bg-slate-900 border-t border-border-light dark:border-border-dark" id="depoimentos">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-16">
                    O que os alunos dizem
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {comments.length > 0 ? (
                        comments.map((comment) => (
                            <div key={comment.id} className="flex flex-col bg-background-light dark:bg-surface-dark p-8 rounded-2xl shadow-sm border border-transparent hover:border-border-light dark:hover:border-border-dark transition-all">
                                <div className="flex items-center mb-4 text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className="material-symbols-outlined text-lg leading-none">
                                            {i < (comment.rating || 5) ? 'star' : 'star_outline'}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 flex-grow italic mb-6 text-sm leading-relaxed">
                                    "{comment.content}"
                                </p>
                                <div className="flex items-center mt-auto">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary font-bold text-sm uppercase">
                                        {comment.user?.name ? comment.user.name.charAt(0) : '?'}
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {comment.user?.name || 'Aluno CEFET'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            @{comment.user?.username || 'usuario'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        // Fallback se não houver comentários
                        <div className="col-span-full text-center py-8 text-gray-500">
                            <p>Seja o primeiro a deixar seu depoimento!</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

const PricingSection = ({ ROUTES, getLinkHref, user }: { ROUTES: any, getLinkHref: (key: string) => string, user: any }) => {
    return (
        <section className="py-20 bg-background-light dark:bg-background-dark border-t border-border-light dark:border-border-dark" id="precos">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-base font-semibold text-primary uppercase tracking-wide">Planos</h2>
                    <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                        Escolha o melhor para você
                    </p>
                    <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 mx-auto">
                        Comece gratuitamente ou desbloqueie todo o potencial da sua vida acadêmica.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Plano Gratuito */}
                    <div className="relative flex flex-col bg-white dark:bg-surface-dark rounded-3xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden transition-all hover:shadow-md">
                        <div className="p-8 pb-4">
                            <h3 className="text-lg leading-6 font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Gratuito</h3>
                            <div className="mt-4 flex items-baseline text-5xl font-extrabold text-gray-900 dark:text-white">
                                <span className="text-2xl font-medium text-gray-500 mr-1">R$</span>
                                0
                                <span className="ml-1 text-2xl font-medium text-gray-500">/semestre</span>
                            </div>
                            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                                Para quem precisa de uma organização rápida e pontual.
                            </p>
                        </div>
                        <div className="px-6 pb-8 flex-grow flex flex-col justify-between">
                            <ul className="space-y-4 mb-8">
                                {[
                                    'Gera Grade (Básico)',
                                    'Visualização de Horários',
                                    'Cronograma Simples',
                                    'Salvo no navegador (dados perdem se limpar cache)'
                                ].map((feature, index) => (
                                    <li key={index} className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <span className="material-symbols-outlined text-gray-400 text-xl">check</span>
                                        </div>
                                        <p className="ml-3 text-base text-gray-600 dark:text-gray-400">{feature}</p>
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href="#cursos"
                                className="w-full flex items-center justify-center px-6 py-3 border border-border-light dark:border-border-dark text-base font-medium rounded-xl text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
                            >
                                Usar Ferramentas
                            </Link>
                        </div>
                    </div>

                    {/* Plano Semestral */}
                    <div className="relative flex flex-col bg-white dark:bg-surface-dark rounded-3xl shadow-xl overflow-hidden border-2 border-primary transform md:-translate-y-4">
                        <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider text-center w-full md:w-auto">
                            Recomendado
                        </div>
                        <div className="p-8 pb-4 bg-primary/5 dark:bg-primary/10 border-b border-border-light dark:border-border-dark">
                            <h3 className="text-lg leading-6 font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Premium</h3>
                            <div className="mt-4 flex items-baseline text-5xl font-extrabold text-gray-900 dark:text-white">
                                <span className="text-2xl font-medium text-gray-500 mr-1">R$</span>
                                3,00
                                <span className="ml-1 text-2xl font-medium text-gray-500">/semestre</span>
                            </div>
                            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                                A experiência completa. Segurança e ferramentas avançadas.
                            </p>
                        </div>
                        <div className="px-6 pb-8 pt-6 flex-grow flex flex-col justify-between">
                            <ul className="space-y-4 mb-8">
                                {[
                                    'Tudo do Gratuito',
                                    'Salvo na Nuvem (Acesse de qualquer lugar)',
                                    'Previsão de Conclusão de Curso',
                                    'Gestão de Atividades Complementares',
                                    'Suporte Prioritário'
                                ].map((feature, index) => (
                                    <li key={index} className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <span className="material-symbols-outlined text-green-500 text-xl">check_circle</span>
                                        </div>
                                        <p className="ml-3 text-base text-gray-700 dark:text-gray-300 font-medium">{feature}</p>
                                    </li>
                                ))}
                            </ul>

                            {user?.is_paid ? (
                                <button
                                    disabled
                                    className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 cursor-not-allowed md:py-4 md:text-lg transition-all"
                                >
                                    <span className="material-symbols-outlined mr-2">check_circle</span>
                                    Plano Ativo
                                </button>
                            ) : (
                                <Link
                                    href={ROUTES.PLANS}
                                    className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-primary hover:bg-primary-hover md:py-4 md:text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                                >
                                    Assinar Agora
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const WhatsAppFloatingButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    // TODO: Troque pelo seu número (formato: 55 + DDD + Numero, ex: 5521999999999)
    const phoneNumber = '5521988567387';

    const handleSend = () => {
        if (!message.trim()) return;
        const text = encodeURIComponent(message);
        // Uses WhatsApp API
        window.open(`https://wa.me/${phoneNumber}?text=${text}`, '_blank');
        setIsOpen(false);
        setMessage('');
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#128C7E] text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 flex items-center justify-center group"
                title="Fale conosco no WhatsApp"
            >
                <span className="material-symbols-outlined text-3xl">chat</span>
                <span className="absolute right-full mr-3 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Fale conosco
                </span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 sm:p-0">
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="bg-white dark:bg-slate-800 sm:rounded-2xl rounded-t-2xl shadow-2xl max-w-sm w-full p-6 relative z-10 animate-slideUp sm:animate-scaleIn border border-gray-100 dark:border-gray-700">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-[#25D366]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#25D366]">
                                <span className="material-symbols-outlined text-3xl">whatsapp</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Fale com o Suporte</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Envie sua mensagem, dúvida ou sugestão diretamente para nosso WhatsApp.
                            </p>
                        </div>

                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Olá, gostaria de saber mais sobre..."
                            className="w-full h-32 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#25D366] focus:border-transparent outline-none resize-none mb-4 transition-all text-sm"
                            autoFocus
                        />

                        <button
                            onClick={handleSend}
                            disabled={!message.trim()}
                            className="w-full bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                        >
                            <span>Enviar Mensagem</span>
                            <span className="material-symbols-outlined text-sm">send</span>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default function HomePage() {
    const ctrl = useHomeController();

    return (
        <>
            <BannerSection user={ctrl.user} ROUTES={ROUTES} />
            <FeaturesSection getLinkHref={ctrl.getLinkHref} />
            <CoursesSection courses={ctrl.courses} loading={ctrl.loading} />
            <TestimonialsSection comments={ctrl.comments} />
            <PricingSection ROUTES={ROUTES} getLinkHref={ctrl.getLinkHref} user={ctrl.user} />
            <WhatsAppFloatingButton />
        </>
    );
}
