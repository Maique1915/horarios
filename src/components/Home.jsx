'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadDbData, loadCoursesRegistry } from '../services/disciplinaService';
import LoadingSpinner from './LoadingSpinner';

const Home = () => {
    const router = useRouter();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);

                // Carregar registro de cursos do gid=0
                const coursesRegistry = await loadCoursesRegistry();
                console.log('Home - Cursos do registro:', coursesRegistry);

                if (coursesRegistry.length > 0) {
                    // Usar dados do registro
                    const data = await loadDbData();
                    console.log('Home - Dados carregados:', data);

                    const coursesWithInfo = coursesRegistry.map(courseReg => {
                        const courseCode = courseReg._cu;
                        // Contar apenas disciplinas ativas (_ag === true)
                        const disciplineCount = data.filter(d => d._cu === courseCode && d._ag === true).length;
                        const periods = [...new Set(data.filter(d => d._cu === courseCode && d._ag === true).map(d => d._se))].length;

                        console.log(`Home - Curso ${courseCode}: ${disciplineCount} disciplinas, ${periods} períodos`);

                        return {
                            code: courseCode,
                            name: courseReg.name || courseCode.toUpperCase(),
                            disciplineCount,
                            periods,
                            gid: courseReg.gid
                        };
                    });

                    setCourses(coursesWithInfo);
                } else {
                    // Fallback para o método antigo se o registro não estiver disponível
                    console.log('Home - Usando fallback');
                    const data = await loadDbData();
                    const uniqueCourses = [...new Set(data.map(d => d._cu))];

                    const coursesWithInfo = uniqueCourses.map(courseCode => {
                        const disciplineCount = data.filter(d => d._cu === courseCode && d._ag === true).length;

                        return {
                            code: courseCode,
                            name: courseCode.toUpperCase(),
                            disciplineCount,
                            periods: [...new Set(data.filter(d => d._cu === courseCode && d._ag === true).map(d => d._se))].length
                        };
                    });

                    setCourses(coursesWithInfo);
                }
            } catch (error) {
                console.error('Erro ao carregar cursos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    if (loading) {
        return <LoadingSpinner message="Carregando cursos..." />;
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <div className="max-w-7xl mx-auto px-4 py-16">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-text-light-primary dark:text-text-dark-primary mb-6 tracking-tight">
                        Horários CEFET
                    </h1>
                    <p className="text-xl text-text-light-secondary dark:text-text-dark-secondary mb-2 font-light">
                        Selecione seu curso para começar
                    </p>
                    <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary opacity-80">
                        Monte sua grade horária de forma inteligente
                    </p>
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {courses.map((course) => (
                        <div
                            key={course.code}
                            onClick={() => router.push(`/${course.code}`)}
                            className="w-full group bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-primary/50 transition-all duration-300"
                        >
                            <div className="flex flex-col items-center text-center">
                                {/* Icon */}
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                                    <span className="material-symbols-outlined text-3xl text-primary">
                                        school
                                    </span>
                                </div>

                                {/* Course Info */}
                                <h3 className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary mb-1.5 group-hover:text-primary transition-colors">
                                    {course.name.toUpperCase()}
                                </h3>
                                <p className="text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary mb-6 uppercase tracking-wider">
                                    {course.code}
                                </p>

                                {/* Stats */}
                                <div className="flex gap-8 w-full justify-center pt-5 border-t border-border-light dark:border-border-dark">
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <span className="material-symbols-outlined text-lg text-primary/80">
                                                book
                                            </span>
                                            <span className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary">
                                                {course.disciplineCount}
                                            </span>
                                        </div>
                                        <span className="text-xs font-medium text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wide">
                                            disciplinas
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <span className="material-symbols-outlined text-lg text-primary/80">
                                                calendar_month
                                            </span>
                                            <span className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary">
                                                {course.periods}
                                            </span>
                                        </div>
                                        <span className="text-xs font-medium text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wide">
                                            períodos
                                        </span>
                                    </div>
                                </div>

                                {/* Arrow - Subtle indication */}
                                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 text-primary">
                                    <span className="material-symbols-outlined text-xl">
                                        arrow_downward
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {courses.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-5xl text-slate-400">
                                school
                            </span>
                        </div>
                        <h3 className="text-xl font-semibold text-text-light-primary dark:text-text-dark-primary mb-2">
                            Nenhum curso encontrado
                        </h3>
                        <p className="text-text-light-secondary dark:text-text-dark-secondary mb-8 text-sm">
                            Configure os cursos no banco de dados para começar
                        </p>
                    </div>
                )}

                {/* Footer Actions */}

            </div>
        </div>
    );
};

export default Home;
