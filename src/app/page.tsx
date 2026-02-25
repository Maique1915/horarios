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
    universityName: string;
    shift: string | null;
    modalities: string | null;
    campus: string | null;
    disciplineCount: number;
    periods: number;
    registeredPeriodsCount: number;
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
                            <img
                                alt="Dashboard acadêmico"
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
        <section className="py-24 bg-white dark:bg-slate-900" id="funcionalidades">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Funcionalidade 1: Gera Grade */}
                    <Link href={getLinkHref('gera_grade')} className="group flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                        <div className="relative aspect-[16/10] overflow-hidden bg-blue-50 dark:bg-blue-900/20">
                            <img src="/gera_grade.png" alt="Gerador de Grade" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 to-transparent opacity-60"></div>
                        </div>
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-500/10 rounded-xl">
                                    <span className="material-symbols-outlined text-blue-500">auto_awesome_motion</span>
                                </div>
                                <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-white uppercase">Gera Grade</h3>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                Monte sua grade horária visualmente, experimente combinações e evite conflitos de horário com nossa inteligência de grade.
                            </p>
                        </div>
                    </Link>

                    {/* Funcionalidade 2: Horários */}
                    <Link href={getLinkHref('horarios')} className="group flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                        <div className="relative aspect-[16/10] overflow-hidden bg-purple-50 dark:bg-purple-900/20">
                            <img src="/horarios.png" alt="Consulta de Horários" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 to-transparent opacity-60"></div>
                        </div>
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-purple-500/10 rounded-xl">
                                    <span className="material-symbols-outlined text-purple-500">calendar_today</span>
                                </div>
                                <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-white uppercase">Horários</h3>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                Acesso instantâneo a todos os horários de disciplinas, professores e salas do seu curso de forma organizada.
                            </p>
                        </div>
                    </Link>

                    {/* Funcionalidade 3: Mapa de Disciplinas */}
                    <Link href="/mapa" className="group flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                        <div className="relative aspect-[16/10] overflow-hidden bg-green-50 dark:bg-green-900/20">
                            <img src="/mapa.png" alt="Mapa de Disciplinas" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 to-transparent opacity-60"></div>
                        </div>
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-green-500/10 rounded-xl">
                                    <span className="material-symbols-outlined text-green-500">account_tree</span>
                                </div>
                                <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-white uppercase">Mapa de Curso</h3>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                Visualize pré-requisitos e a estrutura completa do seu curso em um mapa interativo e intuitivo.
                            </p>
                        </div>
                    </Link>

                    {/* Funcionalidade 4: Previsão */}
                    <Link href="/previsao" className="group flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                        <div className="relative aspect-[16/10] overflow-hidden bg-orange-50 dark:bg-orange-900/20">
                            <img src="/predition.png" alt="Previsão de Formatura" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 to-transparent opacity-60"></div>
                        </div>
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-orange-500/10 rounded-xl">
                                    <span className="material-symbols-outlined text-orange-500">query_stats</span>
                                </div>
                                <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-white uppercase">Previsão</h3>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                Simule seus próximos semestres e receba projeções reais de quando você irá finalmente colar grau.
                            </p>
                        </div>
                    </Link>

                    {/* Funcionalidade 5: Minhas Atividades */}
                    <Link href="/activities" className="group flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                        <div className="relative aspect-[16/10] overflow-hidden bg-rose-50 dark:bg-rose-900/20">
                            <img src="/atividades.png" alt="Minhas Atividades" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 to-transparent opacity-60"></div>
                        </div>
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-rose-500/10 rounded-xl">
                                    <span className="material-symbols-outlined text-rose-500">task_alt</span>
                                </div>
                                <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-white uppercase">Atividades</h3>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                Gerencie suas tarefas, trabalhos e provas em um só lugar integrado com seu calendário de aulas.
                            </p>
                        </div>
                    </Link>

                    {/* Funcionalidade 6: Perfil Acadêmico */}
                    <Link href="/profile" className="group flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                        <div className="relative aspect-[16/10] overflow-hidden bg-cyan-50 dark:bg-cyan-900/20">
                            <img src="/perfil.png" alt="Perfil Acadêmico" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 to-transparent opacity-60"></div>
                        </div>
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-cyan-500/10 rounded-xl">
                                    <span className="material-symbols-outlined text-cyan-500">person_filled</span>
                                </div>
                                <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-white uppercase">Meu Perfil</h3>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                Acompanhe seu CR, horas complementares e estatísticas detalhadas do seu progresso acadêmico.
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    );
};

const CoursesSection = ({ courses, loading }: { courses: CourseStats[], loading: boolean }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const totalPages = Math.ceil(courses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentCourses = courses.slice(startIndex, startIndex + itemsPerPage);

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    return (
        <section className="py-24 bg-gray-50 dark:bg-background-dark" id="cursos">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Cursos Disponíveis</h2>
                        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                            Atualmente suportamos os seguintes cursos de graduação.
                        </p>
                    </div>

                    {/* Pagination Controls - Desktop */}
                    {!loading && totalPages > 1 && (
                        <div className="hidden md:flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Página {currentPage} de {totalPages}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrev}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary/50 transition-colors shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary/50 transition-colors shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading && (
                        <div className="col-span-full text-center py-8">
                            <p className="text-gray-500 animate-pulse italic">Carregando cursos disponíveis...</p>
                        </div>
                    )}
                    {!loading && currentCourses.map((course) => {
                        const isActive = course.status === 'active';
                        return (
                            <Link
                                key={course.code}
                                href={isActive ? `/${course.code}` : '#'}
                                className={`group relative overflow-hidden rounded-3xl transition-all duration-500 hover:-translate-y-2 ${isActive ? 'shadow-xl hover:shadow-primary/20 bg-slate-900' : 'bg-gray-50 dark:bg-slate-800/30 cursor-not-allowed grayscale'}`}
                            >
                                {/* Decorative Gradient Overlay for Active Cards */}
                                {isActive && (
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-colors"></div>
                                )}

                                <div className={`p-8 min-h-[300px] flex flex-col justify-between relative z-10`}>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-6 gap-4 h-14">
                                            <h3 className={`text-xl font-black leading-tight uppercase tracking-tight ${isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                                                {course.name}
                                            </h3>
                                            {isActive ? (
                                                <span className="shrink-0 text-[10px] font-black bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-xl border border-blue-500/20 uppercase tracking-[0.2em] h-fit">
                                                    ATIVO
                                                </span>
                                            ) : (
                                                <span className="shrink-0 text-[10px] font-black bg-gray-200 dark:bg-slate-700/50 text-gray-500 dark:text-gray-400 px-3 py-1.5 rounded-xl border border-gray-300 dark:border-slate-600 uppercase tracking-[0.2em] h-fit">
                                                    EM BREVE
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-2 min-h-[64px]">
                                            <div className="flex items-center gap-2">
                                                <span className={`material-symbols-outlined text-sm ${isActive ? 'text-blue-400' : 'text-gray-400'}`}>account_balance</span>
                                                <p className={`text-xs font-bold tracking-widest uppercase ${isActive ? 'text-blue-400/90' : 'text-gray-500'}`}>
                                                    {course.universityName}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`material-symbols-outlined text-sm ${isActive ? 'text-gray-400' : 'text-gray-500'}`}>location_on</span>
                                                <p className={`text-xs ${isActive ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    Campus {course.campus}
                                                </p>
                                            </div>
                                        </div>

                                        <p className={`mt-6 text-xs font-medium px-3 py-1 inline-block rounded-lg ${isActive ? 'bg-white/5 text-gray-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-500'}`}>
                                            {course.shift || 'Integral'} • {course.modalities || 'Graduação'}
                                        </p>
                                    </div>

                                    <div className={`grid grid-cols-2 gap-4 pt-8 mt-8 border-t ${isActive ? 'border-white/5' : 'border-gray-200 dark:border-white/5'} text-center`}>
                                        <div className="group/stat">
                                            <p className={`text-[10px] uppercase font-black tracking-[0.2em] mb-2 ${isActive ? 'text-gray-500' : 'text-gray-600'}`}>Disciplinas</p>
                                            <p className={`text-2xl font-black ${isActive ? 'text-white group-hover/stat:text-primary transition-colors' : 'text-gray-400'}`}>{course.disciplineCount}</p>
                                        </div>
                                        <div className="group/stat">
                                            <p className={`text-[10px] uppercase font-black tracking-[0.2em] mb-2 ${isActive ? 'text-gray-500' : 'text-gray-600'}`}>Períodos</p>
                                            <p className={`text-2xl font-black ${isActive ? 'text-white group-hover/stat:text-primary transition-colors' : 'text-gray-400'}`}>{course.periods}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Hover Glow for Active Cards */}
                                {isActive && (
                                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/30 rounded-3xl transition-all duration-500"></div>
                                )}
                            </Link>
                        );
                    })}

                    {!loading && courses.length === 0 && (
                        <div className="col-span-full text-center py-4">
                            <p className="text-gray-500">Nenhum curso disponível no momento.</p>
                        </div>
                    )}
                </div>

                {/* Pagination Controls - Mobile */}
                {!loading && totalPages > 1 && (
                    <div className="flex md:hidden flex-col items-center gap-4 mt-8">
                        <div className="flex gap-4 w-full">
                            <button
                                onClick={handlePrev}
                                disabled={currentPage === 1}
                                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary/50 transition-colors shadow-sm font-medium text-sm flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-base">chevron_left</span> Anterior
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={currentPage === totalPages}
                                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary/50 transition-colors shadow-sm font-medium text-sm flex items-center justify-center gap-2"
                            >
                                Próximo <span className="material-symbols-outlined text-base">chevron_right</span>
                            </button>
                        </div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 italic">
                            Página {currentPage} de {totalPages}
                        </span>
                    </div>
                )}
            </div>
        </section>
    );
};

const ContributionSection = () => {
    return (
        <section className="py-24 bg-white dark:bg-surface-dark border-t border-blue-200 dark:border-slate-700 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <span className="material-symbols-outlined text-9xl">diversity_3</span>
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-4">
                        <span className="material-symbols-outlined text-lg">volunteer_activism</span>
                        Contribua com a plataforma
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Não encontrou seu curso?</h3>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl">
                        O Horários é uma plataforma colaborativa e fomos feitos para crescer. Se o seu curso de graduação ainda não está disponível, você pode nos ajudar a trazê-lo para o sistema!
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-primary bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">content_paste_search</span>
                            <div>
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white">Grade Curricular</h4>
                                <p className="text-xs text-gray-500">Lista das matérias obrigatórias e eletivas.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-primary bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">account_tree</span>
                            <div>
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white">Fluxograma</h4>
                                <p className="text-xs text-gray-500">Quais matérias são pré-requisitos de quais.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-primary bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">rule</span>
                            <div>
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white">Regras de Formatura</h4>
                                <p className="text-xs text-gray-500">Carga horária e regras de atividades extras.</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-blue-50/50 dark:bg-slate-800/50 rounded-2xl border border-blue-100 dark:border-slate-700">
                        <div className="flex items-center gap-3 flex-grow">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                                <span className="material-symbols-outlined">info</span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-200">
                                Para adicionar um novo curso, basta entrar em contato. Nossa equipe técnica fará toda a automação e personalização para o seu currículo.
                            </p>
                        </div>
                        <a
                            href="https://wa.me/5521988567387?text=Olá! Gostaria de adicionar um novo curso ao sistema Horários."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors whitespace-nowrap gap-2"
                        >
                            <span className="material-symbols-outlined">forum</span>
                            Falar com Admin
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

const TestimonialsSection = ({ comments, loading }: { comments: CommentWithUser[], loading: boolean }) => {
    return (
        <section className="py-24 bg-gray-50 dark:bg-background-dark overflow-hidden" id="depoimentos">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-base font-semibold text-primary uppercase tracking-wide">Depoimentos</h2>
                    <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                        O que os estudantes dizem
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {loading && (
                        <div className="col-span-full py-12 text-center text-gray-500 italic animate-pulse">
                            Carregando depoimentos...
                        </div>
                    )}
                    {!loading && comments.length > 0 ? (
                        comments.map((comment, idx) => (
                            <div key={idx} className="bg-white dark:bg-surface-dark p-8 rounded-2xl shadow-sm border border-border-light dark:border-border-dark relative group hover:shadow-xl transition-all duration-300">
                                <div className="flex text-orange-400 mb-6">
                                    <span className="material-symbols-outlined text-sm">star</span>
                                    <span className="material-symbols-outlined text-sm">star</span>
                                    <span className="material-symbols-outlined text-sm">star</span>
                                    <span className="material-symbols-outlined text-sm">star</span>
                                    <span className="material-symbols-outlined text-sm">star</span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 italic mb-8 h-24 overflow-y-auto">
                                    "{comment.content}"
                                </p>
                                <div className="flex items-center gap-4 border-t border-gray-100 dark:border-slate-700 pt-6">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {comment.user?.name ? comment.user.name.charAt(0) : '?'}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">{comment.user?.name || 'Estudante'}</h4>
                                        <p className="text-xs text-gray-500 uppercase tracking-tighter">Estudante CEFET</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        !loading && (
                            <div className="col-span-full text-center py-12">
                                <p className="text-gray-500 italic">Seja o primeiro a deixar um depoimento!</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </section>
    );
};

const PricingSection = ({ ROUTES, user }: { ROUTES: any, user: any }) => {
    return (
        <section className="py-24 bg-white dark:bg-slate-900" id="precos">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-base font-semibold text-primary uppercase tracking-wide">Planos</h2>
                    <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                        Escolha o melhor para você
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Plano Gratuito */}
                    <div className="bg-white dark:bg-surface-dark p-10 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
                        <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl mb-6">
                            <span className="material-symbols-outlined text-3xl text-gray-400">person</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Individual</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Comece agora mesmo</p>
                        <div className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">Grátis</div>
                        <ul className="space-y-4 mb-10 text-gray-600 dark:text-gray-300 text-sm">
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-gray-400 text-lg">check</span> Gera Grade (Básico)</li>
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-gray-400 text-lg">check</span> Visualização de Horários</li>
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-gray-400 text-lg">check</span> Cronograma Simples</li>
                        </ul>
                        <Link href="#cursos" className="w-full py-4 text-center border-2 border-gray-100 dark:border-slate-700 text-gray-900 dark:text-white font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800 transition">Usar Ferramentas</Link>
                    </div>

                    {/* Plano Premium */}
                    <div className="bg-[#0F172A] p-10 rounded-3xl border-2 border-primary shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider text-center">
                            Recomendado
                        </div>
                        <div className="p-3 bg-primary/20 rounded-2xl mb-6">
                            <span className="material-symbols-outlined text-3xl text-primary">workspace_premium</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
                        <p className="text-gray-400 mb-6">A experiência completa</p>
                        <div className="text-4xl font-extrabold text-white mb-8">R$ 3,00 <span className="text-sm font-normal text-gray-500">/semestre</span></div>
                        <ul className="space-y-4 mb-10 text-gray-300 text-sm">
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> Salvo na Nuvem</li>
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> Previsão de Conclusão</li>
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> Gestão de Atividades</li>
                        </ul>
                        {user?.is_paid ? (
                            <button
                                disabled
                                className="w-full py-4 text-center bg-green-500/10 text-green-500 font-bold rounded-2xl cursor-not-allowed border border-green-500/20"
                            >
                                Plano Ativo
                            </button>
                        ) : (
                            <Link href={ROUTES.PLANS} className="w-full py-4 text-center bg-primary text-white font-bold rounded-2xl hover:bg-primary-hover shadow-lg shadow-primary/20 transition">Assinar Agora</Link>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

const CTASection = () => {
    return (
        <section className="py-24 bg-[#0F172A] overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-10 left-10 w-64 h-64 bg-primary rounded-full blur-3xl animate-blob"></div>
                <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-600 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-8">Pronto para organizar sua vida acadêmica?</h2>
                <p className="text-xl text-gray-400 mb-12">
                    Junte-se a centenas de estudantes do CEFET que já facilitaram seu processo de montagem de grade.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/register" className="px-10 py-5 bg-primary text-white font-bold rounded-2xl hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all transform hover:-translate-y-1">Criar Minha Conta</Link>
                    <a href="#cursos" className="px-10 py-5 bg-white/10 text-white font-bold rounded-2xl border border-white/10 hover:bg-white/20 transition-all backdrop-blur-sm">Ver Cursos</a>
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
            <ContributionSection />
            <TestimonialsSection comments={ctrl.comments} loading={ctrl.loading} />
            <PricingSection ROUTES={ROUTES} user={ctrl.user} />
            <CTASection />
            <WhatsAppFloatingButton />
        </>
    );
}
