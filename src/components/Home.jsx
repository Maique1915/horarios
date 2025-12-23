import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadDbData, loadCoursesRegistry } from '../services/disciplinaService';
import LoadingSpinner from './LoadingSpinner';

const Home = () => {
    const navigate = useNavigate();
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
        <div className="min-h-screen bg-gradient-to-br from-background-light via-surface-light to-background-light dark:from-background-dark dark:via-surface-dark dark:to-background-dark">
            <div className="max-w-7xl mx-auto px-4 py-16">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-text-light-primary dark:text-text-dark-primary mb-4">
                        Sistema de Matrícula
                    </h1>
                    <p className="text-xl text-text-light-secondary dark:text-text-dark-secondary mb-2">
                        Selecione seu curso para começar
                    </p>
                    <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
                        Monte sua grade horária de forma inteligente
                    </p>
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-1 lg:grid-cols-2 gap-8">
                    {courses.map((course) => (
                        <div
                            key={course.code}
                            onClick={() => navigate(`/${course.code}`)}
                            className="w-full group bg-surface-light dark:bg-surface-dark rounded-xl border-2 border-border-light dark:border-border-dark p-5 cursor-pointer hover:shadow-xl hover:scale-105 hover:border-primary transition-all duration-300"
                        >
                            <div className="flex flex-col items-center text-center">
                                {/* Icon */}
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                                    <span className="material-symbols-outlined text-2xl text-white">
                                        school
                                    </span>
                                </div>

                                {/* Course Info */}
                                <h3 className="text-lg font-bold text-text-light-primary dark:text-text-dark-primary mb-1 group-hover:text-primary transition-colors">
                                    {course.name.toUpperCase()}
                                </h3>
                                <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary mb-3 line-clamp-2">
                                    {course.code}
                                </p>

                                {/* Stats */}
                                <div className="flex gap-4 w-full justify-center pt-3 border-t border-border-light dark:border-border-dark">
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-1 mb-0.5">
                                            <span className="material-symbols-outlined text-sm text-primary">
                                                book
                                            </span>
                                            <span className="text-lg font-bold text-primary">
                                                {course.disciplineCount}
                                            </span>
                                        </div>
                                        <span className="text-xs text-text-light-secondary dark:text-text-dark-secondary">
                                            disciplinas
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-1 mb-0.5">
                                            <span className="material-symbols-outlined text-sm text-primary">
                                                calendar_month
                                            </span>
                                            <span className="text-lg font-bold text-primary">
                                                {course.periods}
                                            </span>
                                        </div>
                                        <span className="text-xs text-text-light-secondary dark:text-text-dark-secondary">
                                            períodos
                                        </span>
                                    </div>
                                </div>

                                {/* Arrow */}
                                <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="material-symbols-outlined text-primary animate-pulse text-base">
                                        arrow_forward
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {courses.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-6xl text-primary">
                                school
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-text-light-primary dark:text-text-dark-primary mb-3">
                            Nenhum curso encontrado
                        </h3>
                        <p className="text-text-light-secondary dark:text-text-dark-secondary mb-8">
                            Configure os cursos no Google Sheets para começar
                        </p>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="flex justify-center gap-4 mt-12">
                    <button
                        onClick={() => navigate('/edit')}
                        className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-colors bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark hover:bg-background-light dark:hover:bg-background-dark"
                    >
                        <span className="material-symbols-outlined text-lg">settings</span>
                        <span>Gerenciar Cursos</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
